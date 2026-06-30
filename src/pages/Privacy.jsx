import React from 'react';

const ACCENT = '#f59e0b';
const BG = '#0a0a0a';
const MUTED = '#a3a3a3';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ color: ACCENT, fontSize: 18, fontWeight: 700, margin: '0 0 14px', paddingBottom: 8, borderBottom: '1px solid #1c1c1c' }}>{title}</h2>
    <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </div>
);

const DataTable = ({ rows }) => (
  <div style={{ overflowX: 'auto', marginTop: 12 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #f59e0b' }}>
          {['Dados Recolhidos','Finalidade','Base Legal','Retenção'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: ACCENT, fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #1c1c1c', background: i%2===0?'#111':'#141414' }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '8px 12px', color: MUTED }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Privacy() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <nav style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid #1c1c1c', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#000' }}>U</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Uffi<span style={{ color: ACCENT }}>Solutions</span></span>
        </a>
        <a href="/" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>← Voltar ao início</a>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 32px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: ACCENT, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Legal</span>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: '20px 0 10px', letterSpacing: -0.5 }}>Política de Privacidade</h1>
          <p style={{ color: MUTED, fontSize: 14 }}>Última actualização: 20 de junho de 2026</p>
        </div>

        <Section title="1. Responsável pelo Tratamento de Dados">
          <p><strong style={{ color: '#fff' }}>UffiSphere HTJS Ltd</strong> (doravante "UffiSolutions"), empresa registada no Reino Unido, é a responsável pelo tratamento dos seus dados pessoais.</p>
          <p>Contacto para assuntos de privacidade: <a href="mailto:support@uffisolutions.com" style={{ color: ACCENT }}>support@uffisolutions.com</a></p>
          <p>Esta política é aplicável ao website <strong style={{ color: '#fff' }}>uffisolutions.com</strong> e a todos os produtos digitais oferecidos na plataforma, em conformidade com o <strong style={{ color: '#fff' }}>UK GDPR</strong> (UK General Data Protection Regulation) e o <strong style={{ color: '#fff' }}>Data Protection Act 2018</strong>.</p>
        </Section>

        <Section title="2. Dados que Recolhemos e Como os Utilizamos">
          <DataTable rows={[
            ['Nome e email','Criação de conta e comunicação','Execução de contrato / Interesse legítimo','Até eliminação de conta'],
            ['Dados de pagamento (Stripe)','Processamento de compras','Execução de contrato','Conforme lei fiscal (7 anos)'],
            ['Endereço IP e cookies técnicos','Segurança e funcionamento do site','Interesse legítimo','Sessão / 12 meses'],
            ['Cookies de análise','Melhorar a experiência do utilizador','Consentimento','13 meses'],
            ['Histórico de compras','Acesso a produtos adquiridos','Execução de contrato','Vida da conta + 7 anos'],
          ]} />
        </Section>

        <Section title="3. Base Legal para o Tratamento">
          <p>Tratamos os seus dados com base nas seguintes bases legais previstas no UK GDPR:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Execução de contrato (Art. 6(1)(b)):</strong> Para fornecer os produtos e serviços adquiridos</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Obrigação legal (Art. 6(1)(c)):</strong> Para cumprir obrigações fiscais e legais no Reino Unido</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Interesse legítimo (Art. 6(1)(f)):</strong> Para segurança da plataforma e prevenção de fraudes</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Consentimento (Art. 6(1)(a)):</strong> Para cookies não essenciais e comunicações de marketing</li>
          </ul>
        </Section>

        <Section title="4. Partilha de Dados com Terceiros">
          <p>Os seus dados apenas são partilhados com:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Stripe:</strong> Processamento seguro de pagamentos (dados de cartão nunca armazenados por nós)</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Supabase:</strong> Alojamento seguro da base de dados (servidores na UE/UK)</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Google Drive:</strong> Entrega de conteúdo digital após compra</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Hostinger:</strong> Alojamento do website</li>
          </ul>
          <p>Nunca vendemos, alugamos ou partilhamos os seus dados pessoais com terceiros para fins comerciais.</p>
        </Section>

        <Section title="5. Os Seus Direitos ao Abrigo do UK GDPR">
          <p>Tem os seguintes direitos relativamente aos seus dados pessoais:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginTop: 12 }}>
            {[
              ['🔍 Acesso','Saber quais dados temos sobre si'],
              ['✏️ Rectificação','Corrigir dados incorrectos'],
              ['🗑️ Apagamento','Solicitar a eliminação dos seus dados ("direito ao esquecimento")'],
              ['⛔ Oposição','Opor-se ao tratamento para marketing'],
              ['📦 Portabilidade','Receber os seus dados em formato legível por máquina'],
              ['⏸️ Limitação','Restringir o tratamento em certas circunstâncias'],
            ].map(([t, d]) => (
              <div key={t} style={{ background: '#141414', border: '1px solid #222', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{d}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>Para exercer qualquer um destes direitos, contacte-nos em <a href="mailto:support@uffisolutions.com" style={{ color: ACCENT }}>support@uffisolutions.com</a>. Responderemos no prazo de <strong style={{ color: '#fff' }}>30 dias</strong>.</p>
          <p>Tem também o direito de apresentar queixa junto do <strong style={{ color: '#fff' }}>Information Commissioner's Office (ICO)</strong> no Reino Unido: <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>ico.org.uk</a></p>
        </Section>

        <Section title="6. Cookies">
          <p>Utilizamos os seguintes tipos de cookies:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Essenciais:</strong> Necessários para o funcionamento básico do site. Não requerem consentimento.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Analíticos:</strong> Para compreender como os utilizadores interagem com o site (ex: tempo de sessão). Requerem consentimento.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Preferências:</strong> Para guardar as suas escolhas de idioma e configurações. Requerem consentimento.</li>
          </ul>
          <p>Pode gerir as suas preferências de cookies em qualquer momento através das definições do seu browser ou contactando-nos.</p>
        </Section>

        <Section title="7. Segurança dos Dados">
          <p>Implementamos medidas técnicas e organizacionais adequadas para proteger os seus dados pessoais contra acesso não autorizado, perda ou destruição, incluindo:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>Encriptação HTTPS em todas as comunicações</li>
            <li style={{ marginBottom: 6 }}>Acesso restrito por função (role-based access)</li>
            <li style={{ marginBottom: 6 }}>Processamento de pagamentos exclusivamente via Stripe (PCI DSS compliant)</li>
          </ul>
        </Section>

        <Section title="8. Transferências Internacionais de Dados">
          <p>Os seus dados são principalmente tratados no Reino Unido e na União Europeia. Caso sejam transferidos para outros países, garantimos que existem salvaguardas adequadas em conformidade com o UK GDPR, como Cláusulas Contratuais Padrão (SCCs) ou decisões de adequação.</p>
        </Section>

        <Section title="9. Alterações a Esta Política">
          <p>Podemos actualizar esta Política periodicamente. Notificaremos os utilizadores registados sobre alterações significativas por email. A data da última actualização encontra-se no topo desta página.</p>
        </Section>

        <div style={{ background: '#141414', border: '1px solid #1c1c1c', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            Para exercer os seus direitos ou para qualquer questão de privacidade, contacte: <a href="mailto:support@uffisolutions.com" style={{ color: ACCENT }}>support@uffisolutions.com</a> · UffiSphere HTJS Ltd · United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}