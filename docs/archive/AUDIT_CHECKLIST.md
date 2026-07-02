# Technical Audit & Fine-Tuning Checklist

## 1. Admin Panel Formatting & Saving
- [ ] **Form Validation**:
  - Verify mandatory fields (Title, Category, Language) prevent submission if empty.
  - Verify numeric constraints on Price fields (must not be negative).
- [ ] **Data Persistence**:
  - Verify that adding a new product creates an entry in `products` AND `product_translations`.
  - Verify that modifying an existing product correctly updates the translation for the selected language or creates a new translation row if it didn't exist.
- [ ] **Error Handling**:
  - Ensure Supabase constraints (e.g., missing FK for category) trigger clear `toast` error messages.
  - Verify transaction rollbacks: if translation fails to insert, the main product shouldn't remain orphaned.
- [ ] **Success Feedback**:
  - Verify modal auto-closes 1.5s after successful save.
  - Verify data table re-fetches to reflect the newly saved data instantly.

## 2. Dashboard Course Display ("Meus Cursos")
- [ ] **Query Integrity**:
  - Verify `DashboardPage` fetches free courses (`is_free = true`) correctly.
  - Verify purchases fetch queries `user_purchases` mapped to `user.id` or `buyer_email`.
- [ ] **Enrichment (Translations/Categories)**:
  - Verify `Promise.all` translation enrichment gracefully handles missing translations (falls back to default title).
- [ ] **Empty States & Loading**:
  - Ensure a spinning loader appears during initial data fetch.
  - Verify the empty state ("Nenhum curso disponível") renders clearly when users have zero purchases/free products.
- [ ] **Course Metadata Display**:
  - Verify `CourseCard` renders category badges correctly via `categorySlug`.
  - Verify the "GRÁTIS" badge renders conditionally if `isFree` is true.

## 3. Modal Button Functionality (`PremiumContentModal`)
- [ ] **Visibility & Rendering**:
  - Ensure modal only opens for "Acessar" on free courses or when directly triggered.
  - Verify background scroll is locked when modal is open.
- [ ] **Content Accessibility**:
  - Verify "Ler Online" button dynamically checks for `content_url` presence. Disables if null.
  - Verify "Baixar" checks for `drive_link` or `content_url`.
- [ ] **Download Logic**:
  - Verify Google Drive links (`drive.google.com`) open in a `_blank` tab natively.
  - Verify direct files attempt DOM `a` tag download injection.
- [ ] **Missing Content Fallback**:
  - Ensure "Conteúdo não disponível" placeholder shows when neither `content_url` nor `drive_link` exist.

## 4. Public Catalog Navigation
- [ ] **Category Filtering**:
  - Verify clicking a category in `CategoryFilter` filters the product grid instantly.
  - Verify "Todos" resets the filter.
- [ ] **Search Input**:
  - Ensure typing in the search bar matches against both course names and descriptions.
  - Verify case-insensitive matching.
- [ ] **Navigation Flow**:
  - Click on a course image/title -> redirects to `/courses/:slug` or `/curso/:id`.
  - Verify URL matches the expected `slug`.

## 5. Authentication Flow
- [ ] **Registration**:
  - Verify `signUp` handles full name mapping to `profiles` table automatically.
  - Verify password length constraints (min 6 chars).
- [ ] **Login**:
  - Verify successful login updates `AuthContext` state instantly and redirects to `/dashboard`.
- [ ] **Protected Routes**:
  - Navigate to `/dashboard` while logged out -> verify redirect to `/login`.
  - Navigate to `/admin` without admin email -> verify "Acesso Negado" block appears.
- [ ] **Logout**:
  - Verify `signOut` clears all local cache, context state, and pushes user to `/`.

## 6. Data Synchronization & Supabase
- [ ] **Query Execution**:
  - Audit network tab: Verify duplicate API calls are minimized.
  - Ensure `fetchCategories` and `fetchAllProducts` execute concurrently where applicable.
- [ ] **Real-time / Polling**:
  - Verify `NotificationContext` and `FavoritesContext` poll updates properly without memory leaks.
- [ ] **Cache Invalidation**:
  - After saving an item in Admin, verify UI components re-render without a hard reload.

## 7. Error Handling
- [ ] **Supabase Catch Blocks**:
  - Disconnect network -> verify `catch` blocks set the `error` state.
  - Verify global `toast` catches uncaught promise rejections.
- [ ] **Missing Imagery**:
  - Verify `<img />` `onError` attribute swaps to fallback Category icons correctly in `CourseCard`.
- [ ] **Invalid Routes**:
  - Navigate to `/curso/non-existent` -> ensure User-friendly 404/Error component renders with a "Voltar ao Catálogo" button.

## 8. Performance
- [ ] **Component Rerenders**:
  - Verify contexts don't cause unnecessary global rerenders.
- [ ] **Lazy Loading / Images**:
  - Check that course images cover aspect ratios properly without shifting layout (`object-cover`).
- [ ] **Vite Build Verification**:
  - Run `npm run build` and ensure no unresolved imports, missing variables, or unused variables break the compilation process.