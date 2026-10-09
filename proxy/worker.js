// Servidor intermediário para a ajuda da IA do Kanban Lean Change (Cloudflare Worker).
// A chave da OpenAI fica aqui, como segredo do Worker; a página só conhece o endereço deste servidor e a senha.
//
// Como publicar (cerca de cinco minutos):
// 1. Em dash.cloudflare.com, Workers & Pages > Create > Create Worker; cole este arquivo e publique.
// 2. Em Settings > Variables and Secrets, crie os segredos:
//    OPENAI_API_KEY   a chave da OpenAI
//    SENHA            uma senha curta para os participantes (opcional, mas recomendada)
//    ORIGENS          endereços autorizados, separados por vírgula, por exemplo https://usuario.github.io
// 3. Copie o endereço do Worker (https://nome.usuario.workers.dev) e use-o na página, em IA > Servidor intermediário,
//    ou compartilhe o link pronto: https://usuario.github.io/repositorio/?ia=https://nome.usuario.workers.dev&senha=SENHA

export default {
  async fetch(req, env) {
    const origem = req.headers.get('Origin') || '';
    const origens = (env.ORIGENS || '').split(',').map(s => s.trim()).filter(Boolean);
    const autorizada = origens.length === 0 || origens.includes(origem);
    const cors = {
      'Access-Control-Allow-Origin': autorizada ? (origem || '*') : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Senha',
      'Vary': 'Origin',
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: { message: 'Use POST.' } }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (!autorizada) return new Response(JSON.stringify({ error: { message: 'Origem não autorizada.' } }), { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (env.SENHA && req.headers.get('X-Senha') !== env.SENHA) return new Response(JSON.stringify({ error: { message: 'Senha inválida.' } }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
    let corpo;
    try { corpo = await req.json(); } catch (e) { return new Response(JSON.stringify({ error: { message: 'Corpo inválido.' } }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }); }
    const pedido = {
      model: corpo.model || 'gpt-4o-mini',
      messages: Array.isArray(corpo.messages) ? corpo.messages.slice(0, 12) : [],
      temperature: 0.4,
      max_tokens: Math.min(Number(corpo.max_tokens) || 700, 1200),
    };
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify(pedido),
    });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
