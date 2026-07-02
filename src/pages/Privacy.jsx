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
          {['Data Collected','Purpose','Legal Basis','Retention'].map(h => (
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
        <a href="/" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>← Back to Home</a>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 32px 80px' }}>
        <div style={{ marginBottom: 48 }}>
          <span style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: ACCENT, padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Legal</span>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: '20px 0 10px', letterSpacing: -0.5 }}>Privacy Policy</h1>
          <p style={{ color: MUTED, fontSize: 14 }}>Last updated: 20 June 2026</p>
        </div>

        <Section title="1. Data Controller">
          <p><strong style={{ color: '#fff' }}>UffiSphere HTJS Ltd</strong> (hereinafter "UffiSolutions"), a company registered in the United Kingdom, is the controller responsible for processing your personal data.</p>
          <p>Contact for privacy matters: <a href="mailto:us@uffisolutions.com" style={{ color: ACCENT }}>us@uffisolutions.com</a></p>
          <p>This policy applies to the website <strong style={{ color: '#fff' }}>uffisolutions.com</strong> and all digital products offered on the platform, in accordance with the <strong style={{ color: '#fff' }}>UK GDPR</strong> (UK General Data Protection Regulation) and the <strong style={{ color: '#fff' }}>Data Protection Act 2018</strong>.</p>
        </Section>

        <Section title="2. Data We Collect and How We Use It">
          <DataTable rows={[
            ['Name and email','Account creation and communication','Performance of contract / Legitimate interest','Until account deletion'],
            ['Payment data (Stripe)','Purchase processing','Performance of contract','As required by tax law (7 years)'],
            ['IP address and technical cookies','Site security and functionality','Legitimate interest','Session / 12 months'],
            ['Analytics cookies','Improving user experience','Consent','13 months'],
            ['Purchase history','Access to purchased products','Performance of contract','Life of account + 7 years'],
          ]} />
        </Section>

        <Section title="3. Legal Basis for Processing">
          <p>We process your data based on the following legal bases under the UK GDPR:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Performance of a contract (Art. 6(1)(b)):</strong> To provide the products and services purchased</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Legal obligation (Art. 6(1)(c)):</strong> To comply with UK tax and legal obligations</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Legitimate interest (Art. 6(1)(f)):</strong> For platform security and fraud prevention</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Consent (Art. 6(1)(a)):</strong> For non-essential cookies and marketing communications</li>
          </ul>
        </Section>

        <Section title="4. Sharing Data with Third Parties">
          <p>Your data is only shared with:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Stripe:</strong> Secure payment processing (card data is never stored by us)</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Supabase:</strong> Secure database hosting (servers in the EU/UK)</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Google Drive:</strong> Delivery of digital content after purchase</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Hostinger:</strong> Website hosting</li>
          </ul>
          <p>We never sell, rent or share your personal data with third parties for commercial purposes.</p>
        </Section>

        <Section title="5. Your Rights under the UK GDPR">
          <p>You have the following rights regarding your personal data:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginTop: 12 }}>
            {[
              ['🔍 Access','Find out what data we hold about you'],
              ['✏️ Rectification','Correct inaccurate data'],
              ['🗑️ Erasure','Request deletion of your data ("right to be forgotten")'],
              ['⛔ Objection','Object to processing for marketing purposes'],
              ['📦 Portability','Receive your data in a machine-readable format'],
              ['⏸️ Restriction','Restrict processing in certain circumstances'],
            ].map(([t, d]) => (
              <div key={t} style={{ background: '#141414', border: '1px solid #222', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{d}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>To exercise any of these rights, contact us at <a href="mailto:us@uffisolutions.com" style={{ color: ACCENT }}>us@uffisolutions.com</a>. We will respond within <strong style={{ color: '#fff' }}>30 days</strong>.</p>
          <p>You also have the right to lodge a complaint with the <strong style={{ color: '#fff' }}>Information Commissioner's Office (ICO)</strong> in the UK: <a href="https://ico.org.uk" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>ico.org.uk</a></p>
        </Section>

        <Section title="6. Cookies">
          <p>We use the following types of cookies:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Essential:</strong> Necessary for the basic functioning of the site. No consent required.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Analytics:</strong> To understand how users interact with the site (e.g. session duration). Consent required.</li>
            <li style={{ marginBottom: 6 }}><strong style={{ color: '#fff' }}>Preferences:</strong> To remember your language and settings choices. Consent required.</li>
          </ul>
          <p>You can manage your cookie preferences at any time through your browser settings or by contacting us.</p>
        </Section>

        <Section title="7. Data Security">
          <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss or destruction, including:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>HTTPS encryption on all communications</li>
            <li style={{ marginBottom: 6 }}>Role-based access control</li>
            <li style={{ marginBottom: 6 }}>Payment processing exclusively via Stripe (PCI DSS compliant)</li>
          </ul>
        </Section>

        <Section title="8. International Data Transfers">
          <p>Your data is primarily processed in the United Kingdom and the European Union. Where data is transferred to other countries, we ensure appropriate safeguards are in place in accordance with the UK GDPR, such as Standard Contractual Clauses (SCCs) or adequacy decisions.</p>
        </Section>

        <Section title="9. Changes to this Policy">
          <p>We may update this Policy periodically. We will notify registered users of significant changes by email. The date of the last update appears at the top of this page.</p>
        </Section>

        <div style={{ background: '#141414', border: '1px solid #1c1c1c', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            To exercise your rights or for any privacy-related question, contact: <a href="mailto:us@uffisolutions.com" style={{ color: ACCENT }}>us@uffisolutions.com</a> · UffiSphere HTJS Ltd · United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}
