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

export default function Terms() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Simple nav */}
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
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: '20px 0 10px', letterSpacing: -0.5 }}>Terms of Use</h1>
          <p style={{ color: MUTED, fontSize: 14 }}>Last updated: 20 June 2026</p>
        </div>

        <Section title="1. Operator Identification">
          <p>The UffiSolutions platform is operated by <strong style={{ color: '#fff' }}>UffiSphere HTJS Ltd</strong>, a company registered in the United Kingdom, hereinafter referred to as "UffiSolutions", "we" or "our".</p>
          <p>For enquiries: <a href="mailto:us@uffisolutions.com" style={{ color: ACCENT }}>us@uffisolutions.com</a></p>
        </Section>

        <Section title="2. Purpose and Scope">
          <p>UffiSolutions is a digital platform for info-products, training, guides and digital tools designed to help users — primarily Brazilians living in the United Kingdom and other countries — acquire practical knowledge about importing, entrepreneurship, life abroad and digital income generation.</p>
          <p>These Terms govern access to and use of the website <strong style={{ color: '#fff' }}>uffisolutions.com</strong> and all digital products and services made available on the platform.</p>
        </Section>

        <Section title="3. Acceptance of Terms">
          <p>By accessing or using the platform, the user declares that they have read, understood and fully accepted these Terms of Use. If you do not agree with any clause, you should refrain from using the services.</p>
        </Section>

        <Section title="4. Products and Services">
          <p>UffiSolutions provides:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>Digital guides and e-books (PDF)</li>
            <li style={{ marginBottom: 6 }}>Courses and educational videos</li>
            <li style={{ marginBottom: 6 }}>Spreadsheets, calculators and digital tools</li>
            <li style={{ marginBottom: 6 }}>Checklists and ready-made templates</li>
            <li style={{ marginBottom: 6 }}>Access to communities and newsletters</li>
          </ul>
          <p>Some products are free; others require payment. Specific conditions for each product are stated on its respective product page.</p>
        </Section>

        <Section title="5. Payments and Refunds">
          <p>Payments are processed securely through <strong style={{ color: '#fff' }}>Stripe</strong>. UffiSolutions does not store credit card data.</p>
          <p><strong style={{ color: '#fff' }}>Refund policy:</strong> Due to the digital nature of the products, refunds are assessed on a case-by-case basis. If you believe a product did not match its description, contact us within <strong style={{ color: '#fff' }}>14 days</strong> of purchase for review, in accordance with UK consumer law (Consumer Contracts Regulations 2013).</p>
        </Section>

        <Section title="6. Intellectual Property Rights">
          <p>All content available on the platform — including text, images, videos, spreadsheets and educational materials — is the exclusive property of UffiSphere HTJS Ltd or its licensors, and is protected under UK and international copyright law.</p>
          <p>It is strictly prohibited to reproduce, redistribute, resell or publicly share any purchased product without prior written authorisation.</p>
        </Section>

        <Section title="7. User Conduct">
          <p>The user agrees to:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>Use the platform only for lawful, personal purposes</li>
            <li style={{ marginBottom: 6 }}>Not share access credentials with third parties</li>
            <li style={{ marginBottom: 6 }}>Not attempt to bypass any security system on the platform</li>
            <li style={{ marginBottom: 6 }}>Not use purchased content for commercial purposes without authorisation</li>
          </ul>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>The content provided is for educational and informational purposes. UffiSolutions does not guarantee specific financial results from the use of its products. Results depend on each user's effort, circumstances and application.</p>
          <p>UffiSolutions is not liable for decisions made based on the platform's content, nor for any indirect, incidental or consequential damages.</p>
        </Section>

        <Section title="9. Data Protection (UK GDPR)">
          <p>The processing of your personal data is described in our <a href="/privacidade" style={{ color: ACCENT }}>Privacy Policy</a>, in accordance with the <strong style={{ color: '#fff' }}>UK GDPR</strong> and the <strong style={{ color: '#fff' }}>Data Protection Act 2018</strong>.</p>
        </Section>

        <Section title="10. Changes to these Terms">
          <p>UffiSolutions reserves the right to modify these Terms at any time. Changes will be communicated through the platform and will take effect 15 days after publication. Continued use of the platform after that period constitutes acceptance of the new Terms.</p>
        </Section>

        <Section title="11. Governing Law and Jurisdiction">
          <p>These Terms are governed by the laws of the <strong style={{ color: '#fff' }}>United Kingdom</strong>. Any dispute will be subject to the exclusive jurisdiction of the courts of England and Wales, without prejudice to consumer rights provided by law.</p>
        </Section>

        <div style={{ background: '#141414', border: '1px solid #1c1c1c', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            For questions relating to these Terms, contact us at <a href="mailto:us@uffisolutions.com" style={{ color: ACCENT }}>us@uffisolutions.com</a> · UffiSphere HTJS Ltd · United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}
