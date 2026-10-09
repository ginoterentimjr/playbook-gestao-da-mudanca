// Servidor intermediário para a ajuda da IA do playbook (Cloudflare Worker).
// A chave da OpenAI fica aqui, como segredo do Worker; a página só conhece o endereço deste servidor e a senha.
//
// Como publicar (cerca de cinco minutos):
// 1. Em dash.cloudflare.com, Workers & Pages > Create > Create Worker; cole este arquivo e publique.
// 2. Em Settings > Variables and Secrets, crie:
//    OPENAI_API_KEY   (Secret) a chave da OpenAI
//    SENHA            (Secret) uma senha curta para os participantes (opcional, mas recomendada)
//    ORIGENS          (Text) endereços autorizados, separados por vírgula, por exemplo https://usuario.github.io
//    MODELO           (Text, opcional) o modelo da OpenAI para todos os pedidos, por exemplo gpt-6.1-sol
//    ESFORCO          (Text, opcional) o esforço de raciocínio dos modelos que raciocinam: low, medium ou high (padrão low)
// 3. Copie o endereço do Worker (https://nome.usuario.workers.dev) e use-o na página, em IA > Servidor intermediário,
//    ou compartilhe o link pronto: https://usuario.github.io/repositorio/?ia=https://nome.usuario.workers.dev&senha=SENHA

const OPENAI = 'https://api.openai.com/v1/chat/completions';

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
    const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ error: { message: 'Use POST.' } }, 405);
    if (!autorizada) return json({ error: { message: 'Origem não autorizada.' } }, 403);
    if (env.SENHA && req.headers.get('X-Senha') !== env.SENHA) return json({ error: { message: 'Senha inválida.' } }, 401);
    if (!env.OPENAI_API_KEY) return json({ error: { message: 'A chave da OpenAI ainda não foi configurada no servidor.' } }, 503);
    let corpo;
    try { corpo = await req.json(); } catch (e) { return json({ error: { message: 'Corpo inválido.' } }, 400); }

    // o modelo do servidor, quando definido, vale para todos os pedidos
    const modelo = env.MODELO || corpo.model || 'gpt-4o-mini';
    const mensagens = Array.isArray(corpo.messages) ? corpo.messages.slice(0, 12) : [];
    // modelos que raciocinam (o1, o3, o4, gpt-5, gpt-6...) usam max_completion_tokens e reasoning_effort, sem temperature
    const raciocina = /^(o\d|gpt-5|gpt-6)/i.test(modelo);
    const pedido = { model: modelo, messages: mensagens };
    if (raciocina) {
      pedido.max_completion_tokens = 8000;
      pedido.reasoning_effort = env.ESFORCO || 'low';
    } else {
      pedido.temperature = 0.4;
      pedido.max_tokens = Math.min(Number(corpo.max_tokens) || 700, 1200);
    }

    const chamar = (p) => fetch(OPENAI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify(p),
    });
    let r = await chamar(pedido);
    // se o modelo recusar algum parâmetro opcional, repete só com o essencial
    if (r.status === 400) {
      const texto = await r.text();
      if (/unsupported|not supported|unrecognized|unknown parameter/i.test(texto)) {
        r = await chamar({ model: modelo, messages: mensagens });
      } else {
        return new Response(texto, { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }
    return new Response(await r.text(), { status: r.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
