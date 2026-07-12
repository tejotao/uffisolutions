#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

// @babel/traverse's default export shape differs between ESM and CJS
// interop — this project's own plugins/utils/ast-utils.js hits the same
// quirk and unwraps it the same way.
const traverse = traverseModule.default || traverseModule;

const CLEAN_CONTENT_REGEX = {
  // Negative lookbehind on "//" avoids treating the "//" in a URL literal
  // (e.g. `href={`https://...`}`) as a line-comment start — that mismatch
  // used to eat everything up to the next unrelated "//"/EOL, corrupting
  // the rest of the file for the regex-based extraction below.
  comments: /\/\*[\s\S]*?\*\/|(?<!:)\/\/.*$/gm,
  templateLiterals: /`[\s\S]*?`/g,
  strings: /'[^']*'|"[^"]*"/g,
  jsxExpressions: /\{.*?\}/g,
  htmlEntities: {
    quot: /&quot;/g,
    amp: /&amp;/g,
    lt: /&lt;/g,
    gt: /&gt;/g,
    apos: /&apos;/g
  }
};

const EXTRACTION_REGEX = {
  helmet: /<Helmet[^>]*?>([\s\S]*?)<\/Helmet>/i,
  helmetTest: /<Helmet[\s\S]*?<\/Helmet>/i,
  title: /<title[^>]*?>\s*(.*?)\s*<\/title>/i,
  description: /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
};

function cleanContent(content) {
  return content
    .replace(CLEAN_CONTENT_REGEX.comments, '')
    .replace(CLEAN_CONTENT_REGEX.templateLiterals, '""')
    .replace(CLEAN_CONTENT_REGEX.strings, '""');
}

function cleanText(text) {
  if (!text) return text;
  
  return text
    .replace(CLEAN_CONTENT_REGEX.jsxExpressions, '')
    .replace(CLEAN_CONTENT_REGEX.htmlEntities.quot, '"')
    .replace(CLEAN_CONTENT_REGEX.htmlEntities.amp, '&')
    .replace(CLEAN_CONTENT_REGEX.htmlEntities.lt, '<')
    .replace(CLEAN_CONTENT_REGEX.htmlEntities.gt, '>')
    .replace(CLEAN_CONTENT_REGEX.htmlEntities.apos, "'")
    .trim();
}

// Components that wrap the real page (auth/role gates) or that represent a
// redirect rather than an actual page — never the answer we want for "what
// page does this route render".
const NON_PAGE_COMPONENTS = new Set(['ProtectedRoute', 'AdminRoute', 'Navigate', 'Fragment', 'React.Fragment']);

// Walks a JSX `element={...}` expression — which in this codebase can be a
// plain <Component/>, a ternary (`cond ? <A/> : <B/>`, used for the
// logged-in-redirect routes), or a page wrapped in <ProtectedRoute>/
// <AdminRoute> — and collects every real page component name found,
// skipping wrappers/redirects. Recursing into children is what lets this
// see through `<AdminRoute><AdminUsers/></AdminRoute>` to "AdminUsers".
function collectPageComponentNames(node, names = []) {
  if (!node) return names;
  if (node.type === 'JSXElement') {
    const opening = node.openingElement;
    const nameNode = opening.name;
    const name = nameNode?.type === 'JSXIdentifier' ? nameNode.name : null;
    if (name && !NON_PAGE_COMPONENTS.has(name)) names.push(name);
    for (const child of node.children) collectPageComponentNames(child, names);
    // A wrapper's own props can carry JSX too (rare here, cheap to check).
    for (const attr of opening.attributes) {
      if (attr.type === 'JSXAttribute' && attr.value?.type === 'JSXExpressionContainer') {
        collectPageComponentNames(attr.value.expression, names);
      }
    }
  } else if (node.type === 'JSXFragment') {
    for (const child of node.children) collectPageComponentNames(child, names);
  } else if (node.type === 'JSXExpressionContainer') {
    collectPageComponentNames(node.expression, names);
  } else if (node.type === 'ConditionalExpression') {
    collectPageComponentNames(node.consequent, names);
    collectPageComponentNames(node.alternate, names);
  }
  return names;
}

function getJsxAttrValue(openingElement, attrName) {
  const attr = openingElement.attributes.find(
    (a) => a.type === 'JSXAttribute' && a.name.name === attrName
  );
  if (!attr) return undefined;
  if (attr.value === null) return true; // boolean shorthand, e.g. `index`
  if (attr.value?.type === 'StringLiteral') return attr.value.value;
  if (attr.value?.type === 'JSXExpressionContainer') return attr.value.expression;
  return undefined;
}

// Maps page component name -> route path by parsing App.jsx as a real AST
// (regex previously used here couldn't handle nested JSX inside
// `element={...}` — e.g. `<AdminRoute><AdminUsers/></AdminRoute>` or
// `user ? <Navigate/> : <HomePage/>` — and silently matched nothing for
// every route in this file).
function extractRoutes(appJsxPath) {
  if (!fs.existsSync(appJsxPath)) return new Map();

  try {
    const content = fs.readFileSync(appJsxPath, 'utf8');
    const ast = parse(content, { sourceType: 'module', plugins: ['jsx'] });
    const routes = new Map();

    traverse(ast, {
      JSXElement(nodePath) {
        const opening = nodePath.node.openingElement;
        const tagName = opening.name;
        if (tagName?.type !== 'JSXIdentifier' || tagName.name !== 'Route') return;

        const isIndex = getJsxAttrValue(opening, 'index') === true;
        const rawPath = getJsxAttrValue(opening, 'path');
        const routePath = isIndex
          ? '/'
          : typeof rawPath === 'string'
            ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`)
            : undefined;
        // "*" is the catch-all not-found route — not a real page to list.
        if (!routePath || routePath === '*') return;

        const elementExpr = getJsxAttrValue(opening, 'element');
        const pageNames = collectPageComponentNames(
          elementExpr?.type ? { type: 'JSXExpressionContainer', expression: elementExpr } : null
        );
        // Ternaries (`user ? <Navigate/> : <HomePage/>`) contribute both
        // branches — the real page is the one that survived the
        // NON_PAGE_COMPONENTS filter, and source order puts it last here.
        const componentName = pageNames.at(-1);
        if (componentName) routes.set(componentName, routePath);
      },
    });

    return routes;
  } catch (error) {
    console.warn('[generate-llms] extractRoutes failed, falling back to guessed URLs:', error.message);
    return new Map();
  }
}

function findReactFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findReactFiles(fullPath));
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractHelmetData(content, filePath, routes) {
  const cleanedContent = cleanContent(content);
  
  if (!EXTRACTION_REGEX.helmetTest.test(cleanedContent)) {
    return null;
  }
  
  const helmetMatch = content.match(EXTRACTION_REGEX.helmet);
  if (!helmetMatch) return null;
  
  const helmetContent = helmetMatch[1];
  const titleMatch = helmetContent.match(EXTRACTION_REGEX.title);
  const descMatch = helmetContent.match(EXTRACTION_REGEX.description);
  
  const title = cleanText(titleMatch?.[1]);
  const description = cleanText(descMatch?.[1]);
  
  const fileName = path.basename(filePath, path.extname(filePath));
  const url = routes.size && routes.has(fileName)
    ? routes.get(fileName) 
    : generateFallbackUrl(fileName);
  
  return {
    url,
    title: title || 'Untitled Page',
    description: description || 'No description available'
  };
}

function generateFallbackUrl(fileName) {
  const cleanName = fileName.replace(/Page$/, '').toLowerCase();
  return cleanName === 'app' ? '/' : `/${cleanName}`;
}

function generateLlmsTxt(pages) {
  const sortedPages = pages.sort((a, b) => a.title.localeCompare(b.title));
  const pageEntries = sortedPages.map(page => 
    `- [${page.title}](${page.url}): ${page.description}`
  ).join('\n');
  
  return `## Pages\n${pageEntries}`;
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function processPageFile(filePath, routes) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return extractHelmetData(content, filePath, routes);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

function main() {
  const pagesDir = path.join(process.cwd(), 'src', 'pages');
  const appJsxPath = path.join(process.cwd(), 'src', 'App.jsx');

  let pages = [];
  
  if (!fs.existsSync(pagesDir)) {
    pages.push(processPageFile(appJsxPath, []))
    pages = pages.filter(Boolean);
  } else {
    const routes = extractRoutes(appJsxPath);
    const reactFiles = findReactFiles(pagesDir);

    pages = reactFiles
      .map(filePath => processPageFile(filePath, routes))
      .filter(Boolean);
  }

  if (pages.length === 0) {
    console.error('❌ No pages with Helmet components found!');
    process.exit(1);
  }


  const llmsTxtContent = generateLlmsTxt(pages);
  const outputPath = path.join(process.cwd(), 'public', 'llms.txt');
  
  ensureDirectoryExists(path.dirname(outputPath));
  fs.writeFileSync(outputPath, llmsTxtContent, 'utf8');
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main();
}
