import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const EMPTY = { slug: '', price: 0, image_url: '', drive_link: '', stripe_link: '', is_free: false, category_id: '', title: '', description: '' };

export default function AdminCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*, product_translations(*)').order('sort_order');
    const { data: cats } = await supabase.from('categories').select('*, category_translations(*)').order('sort_order');
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Schema: product_translations.language, product_translations.name
  const getTitle = (p) => p.product_translations?.find(t => t.language === 'pt-BR')?.name || p.slug;
  // Schema: category_translations.language, category_translations.name
  const getCatName = (c) => c.category_translations?.find(t => t.language === 'pt-BR')?.name || c.slug;

  const save = async () => {
    const { slug, price, image_url, drive_link, stripe_link, is_free, category_id, title, description } = form;
    if (!slug || !title) return setMsg('⚠️ Preencha slug e título PT-BR.');
    let productId = editing;
    if (!editing) {
      const { data, error } = await supabase.from('products')
        .insert([{ slug, price: parseFloat(price) || 0, image_url, drive_link, stripe_link, is_free: Boolean(is_free), category_id: category_id || null, active: true }])
        .select().single();
      if (error) return setMsg('❌ ' + error.message);
      productId = data.id;
    } else {
      const { error } = await supabase.from('products')
        .update({ slug, price: parseFloat(price) || 0, image_url, drive_link, stripe_link, is_free: Boolean(is_free), category_id: category_id || null })
        .eq('id', editing);
      if (error) return setMsg('❌ ' + error.message);
    }
    // Upsert translation using correct schema fields: language, name, description
    await supabase.from('product_translations')
      .upsert([{ product_id: productId, language: 'pt-BR', name: title, description }], { onConflict: 'product_id,language' });
    setMsg('✅ Salvo!'); setForm(EMPTY); setEditing(null); load();
    setTimeout(() => setMsg(''), 3000);
  };

  const del = async (id) => {
    if (!window.confirm('Excluir permanentemente?')) return;
    await supabase.from('product_translations').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
  };

  const edit = (p) => {
    const t = p.product_translations?.find(x => x.language === 'pt-BR') || p.product_translations?.[0];
    setForm({ slug: p.slug, price: p.price || 0, image_url: p.image_url || '', drive_link: p.drive_link || '', stripe_link: p.stripe_link || '', is_free: p.is_free || false, category_id: p.category_id || '', title: t?.name || '', description: t?.description || '' });
    setEditing(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const S = {
    inp: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #b8860b', background: '#111128', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box', outline: 'none' },
    lbl: { color: '#aaa', fontSize: 12, display: 'block', marginBottom: 3 }
  };

  const fields = [
    ['slug','Slug (ID único)'], ['title','Título PT-BR'], ['price','Preço (0 = Grátis)'],
    ['image_url','URL da Imagem'], ['stripe_link','Link Stripe (pagos)'], ['drive_link','Link Drive (download)']
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', padding: 24, fontFamily: 'sans-serif', color: '#ccc' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <h1 style={{ color: '#f0d060', fontSize: 24, fontWeight: 800, margin: 0 }}>⚙️ Admin — Catálogo</h1>
          <a href="/catalog" style={{ color: '#b8860b', fontSize: 13, textDecoration: 'none' }}>← Ver Catálogo</a>
        </div>

        {msg && <div style={{ background: msg.startsWith('✅') ? '#0a2a0a' : '#2a0a0a', border: '1px solid ' + (msg.startsWith('✅') ? '#2e7d32' : '#c62828'), color: msg.startsWith('✅') ? '#81c784' : '#ef9a9a', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{msg}</div>}

        <div style={{ background: '#1a1a2e', border: '1px solid #b8860b', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: '#b8860b', marginTop: 0, fontSize: 18 }}>{editing ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0 20px' }}>
            {fields.map(([k, l]) => (
              <div key={k}>
                <label style={S.lbl}>{l}</label>
                <input style={S.inp} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={S.lbl}>Categoria</label>
              <select style={{ ...S.inp, height: 38, cursor: 'pointer' }} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{getCatName(c)}</option>)}
              </select>
            </div>
            <div>
              <label style={S.lbl}>Descrição PT-BR</label>
              <textarea style={{ ...S.inp, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_free} onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))} />
            <span style={{ color: '#ccc', fontSize: 13 }}>Produto Gratuito (is_free)</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} style={{ background: '#b8860b', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {editing ? '💾 Atualizar' : '✅ Salvar'}
            </button>
            {editing && <button onClick={() => { setForm(EMPTY); setEditing(null); }} style={{ background: '#2a2a4a', color: '#ccc', border: '1px solid #444', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>✕ Cancelar</button>}
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #1a1a2e' }}>
          {loading ? <p style={{ color: '#666', textAlign: 'center', padding: 32 }}>⏳ Carregando...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ borderBottom: '2px solid #b8860b', background: '#1a1a2e' }}>
                {['Título PT-BR','Slug','Preço','Grátis','Categoria','Stripe','Drive','Ações'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#b8860b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #111', background: i % 2 === 0 ? '#0f0f20' : '#111128' }}>
                    <td style={{ padding: '9px 12px', color: '#f0d060', fontWeight: 600 }}>{getTitle(p)}</td>
                    <td style={{ padding: '9px 12px', color: '#555', fontSize: 12 }}>{p.slug}</td>
                    <td style={{ padding: '9px 12px' }}>{p.price ? 'R$ ' + p.price : <span style={{ color: '#444' }}>—</span>}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>{p.is_free ? '🟢' : '⚪'}</td>
                    <td style={{ padding: '9px 12px', color: '#888' }}>{categories.find(c => c.id === p.category_id) ? getCatName(categories.find(c => c.id === p.category_id)) : <span style={{ color: '#444' }}>—</span>}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>{p.stripe_link ? '✅' : '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>{p.drive_link ? '✅' : '—'}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => edit(p)} style={{ background: '#1a3a5c', color: '#90caf9', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✏️</button>
                        <button onClick={() => del(p.id)} style={{ background: '#3a1a1a', color: '#ef9a9a', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p style={{ color: '#333', fontSize: 12, marginTop: 12, textAlign: 'right' }}>{products.length} produto(s)</p>
      </div>
    </div>
  );
}