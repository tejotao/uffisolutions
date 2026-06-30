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
      {/* NAV simples */}
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
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: '20px 0 10px', letterSpacing: -0.5 }}>Termos de Uso</h1>
          <p style={{ color: MUTED, fontSize: 14 }}>Última actualização: 20 de junho de 2026</p>
        </div>

        <Section title="1. Identificação do Operador">
          <p>A plataforma UffiSolutions é operada pela <strong style={{ color: '#fff' }}>UffiSphere HTJS Ltd</strong>, empresa registada no Reino Unido, doravante designada como "UffiSolutions", "nós" ou "nosso".</p>
          <p>Para contacto: <a href="mailto:support@uffisolutions.com" style={{ color: ACCENT }}>support@uffisolutions.com</a></p>
        </Section>

        <Section title="2. Objecto e Âmbito">
          <p>A UffiSolutions é uma plataforma digital de infoprodutos, treinamentos, guias e ferramentas digitais destinados a ajudar utilizadores — principalmente brasileiros residentes no Reino Unido e em outros países — a adquirir conhecimento prático sobre importação, empreendedorismo, vida no exterior e geração de renda digital.</p>
          <p>Estes Termos regulam o acesso e a utilização do website <strong style={{ color: '#fff' }}>uffisolutions.com</strong> e de todos os produtos e serviços digitais disponibilizados na plataforma.</p>
        </Section>

        <Section title="3. Aceitação dos Termos">
          <p>Ao aceder ou utilizar a plataforma, o utilizador declara ter lido, compreendido e aceite estes Termos de Uso na sua totalidade. Caso não concorde com alguma cláusula, deverá abster-se de utilizar os serviços.</p>
        </Section>

        <Section title="4. Produtos e Serviços">
          <p>A UffiSolutions disponibiliza:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>Guias e e-books em formato digital (PDF)</li>
            <li style={{ marginBottom: 6 }}>Cursos e vídeos educativos</li>
            <li style={{ marginBottom: 6 }}>Planilhas, calculadoras e ferramentas digitais</li>
            <li style={{ marginBottom: 6 }}>Checklists e templates prontos</li>
            <li style={{ marginBottom: 6 }}>Acesso a comunidades e newsletters</li>
          </ul>
          <p>Alguns produtos são gratuitos; outros requerem pagamento. As condições específicas de cada produto estão indicadas na respectiva página de produto.</p>
        </Section>

        <Section title="5. Pagamentos e Reembolsos">
          <p>Os pagamentos são processados de forma segura através do <strong style={{ color: '#fff' }}>Stripe</strong>. A UffiSolutions não armazena dados de cartão de crédito.</p>
          <p><strong style={{ color: '#fff' }}>Política de reembolso:</strong> Devido à natureza digital dos produtos, os reembolsos são avaliados caso a caso. Se considerar que o produto não correspondeu ao descrito, contacte-nos em até <strong style={{ color: '#fff' }}>14 dias</strong> após a compra para análise, conforme previsto no direito do consumidor do Reino Unido (Consumer Contracts Regulations 2013).</p>
        </Section>

        <Section title="6. Direitos de Propriedade Intelectual">
          <p>Todo o conteúdo disponível na plataforma — incluindo textos, imagens, vídeos, planilhas e materiais educativos — é propriedade exclusiva da UffiSphere HTJS Ltd ou dos seus licenciadores, sendo protegido pelas leis de direito de autor do Reino Unido e internacionais.</p>
          <p>É expressamente proibido reproduzir, redistribuir, revender ou partilhar publicamente qualquer produto adquirido sem autorização prévia e escrita.</p>
        </Section>

        <Section title="7. Conduta do Utilizador">
          <p>O utilizador compromete-se a:</p>
          <ul style={{ paddingLeft: 20, margin: '8px 0' }}>
            <li style={{ marginBottom: 6 }}>Utilizar a plataforma apenas para fins lícitos e pessoais</li>
            <li style={{ marginBottom: 6 }}>Não partilhar credenciais de acesso com terceiros</li>
            <li style={{ marginBottom: 6 }}>Não tentar contornar qualquer sistema de segurança da plataforma</li>
            <li style={{ marginBottom: 6 }}>Não utilizar o conteúdo adquirido para fins comerciais sem autorização</li>
          </ul>
        </Section>

        <Section title="8. Limitação de Responsabilidade">
          <p>O conteúdo disponibilizado tem fins educativos e informativos. A UffiSolutions não garante resultados financeiros específicos decorrentes do uso dos produtos. Os resultados dependem do esforço, circunstâncias e aplicação de cada utilizador.</p>
          <p>A UffiSolutions não se responsabiliza por decisões tomadas com base no conteúdo da plataforma, nem por quaisquer danos indirectos, incidentais ou consequenciais.</p>
        </Section>

        <Section title="9. Protecção de Dados (UK GDPR)">
          <p>O tratamento dos seus dados pessoais está descrito na nossa <a href="/privacy" style={{ color: ACCENT }}>Política de Privacidade</a>, em conformidade com o <strong style={{ color: '#fff' }}>UK GDPR</strong> e o <strong style={{ color: '#fff' }}>Data Protection Act 2018</strong>.</p>
        </Section>

        <Section title="10. Modificações aos Termos">
          <p>A UffiSolutions reserva-se o direito de modificar estes Termos a qualquer momento. As alterações serão comunicadas através da plataforma e entrarão em vigor após 15 dias da publicação. A continuação do uso da plataforma após esse período implica a aceitação dos novos Termos.</p>
        </Section>

        <Section title="11. Lei Aplicável e Jurisdição">
          <p>Estes Termos são regidos pela legislação do <strong style={{ color: '#fff' }}>Reino Unido</strong>. Qualquer litígio será submetido à jurisdição exclusiva dos tribunais ingleses e galeses, sem prejuízo dos direitos do consumidor previstos na lei.</p>
        </Section>

        <div style={{ background: '#141414', border: '1px solid #1c1c1c', borderRadius: 12, padding: '20px 24px', marginTop: 48 }}>
          <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>
            Para questões relacionadas com estes Termos, contacte-nos em <a href="mailto:support@uffisolutions.com" style={{ color: ACCENT }}>support@uffisolutions.com</a> · UffiSphere HTJS Ltd · United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}