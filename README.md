# Playbook da gestão da mudança

Playbook da gestão de uma mudança, do problema ao benefício, para os participantes da formação Lean Change Management
(Gino Terentim · Rethinking Learning). Abre no navegador, funciona no computador e no celular e não exige cadastro.

## O que a página traz

A linha do tempo organiza 21 etapas em fases. A natureza da mudança define o caminho:

1. Problema: mapa do problema (consistência e relevância) e solução e escopo.
2. Business case: benefícios, capacidades, entregas, ROI e decisão, com a calculadora do ROI mínimo e do custo-teto.
3. A mudança: estado atual e futuro, diferença e blueprint (7S nos três níveis) e critérios de sucesso.
4. Natureza e caminho: a classificação no Cynefin.
5. Caminho preditivo (claro e complicado): plano com melhores e boas práticas.
6. Caminho Lean Change (complexo): insights, opções, experimentos, medidas e decisão.
7. Condução e sustentação (linha comum): estrutura e patrocínio, ondas e Grande · Próximo · Agora, Tela da Mudança, respostas à mudança, os quatro tipos de não, acompanhamento e benefícios.

Cada etapa abre com a pergunta, o conceito rápido, o passo a passo, as dicas e um exemplo preenchido (apenas ilustrativo). A pessoa preenche os campos, acompanha o andamento no quadro (A fazer, Fazendo, Feito) e vê a Tela da Mudança montada com o que já foi preenchido. A página imprime ou salva em PDF o playbook preenchido, os modelos em branco ou a Tela.

Tudo fica salvo no navegador de quem usa. Cada mudança pode ser exportada para um arquivo e importada em outro computador.

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub, por exemplo `playbook-gestao-da-mudanca`.
2. Envie os arquivos desta pasta (`index.html`, `README.md` e a pasta `proxy`) pelo botão Add file, opção Upload files.
3. Em Settings, Pages, escolha Deploy from a branch, branch `main`, pasta `/ (root)`, e salve.
4. Em um ou dois minutos a página estará em `https://SEU-USUARIO.github.io/playbook-gestao-da-mudanca/`.

## Ajuda da IA

A página usa um modelo da OpenAI (gpt-4o-mini por padrão). A chave nunca fica no repositório.

**Chave no navegador.** No botão IA, a pessoa informa a própria chave da OpenAI; ela fica salva só naquele navegador e é enviada apenas à OpenAI, a cada clique em Sugerir ou Revisar.

**Servidor intermediário, para a turma.** Um Cloudflare Worker guarda a chave e recebe os pedidos da página, protegido por senha. O arquivo `proxy/worker.js` traz o código e o passo a passo. Com o Worker publicado, um link pronto configura a IA no navegador de quem o abre:

```
https://SEU-USUARIO.github.io/playbook-gestao-da-mudanca/?ia=https://NOME.SEU-USUARIO.workers.dev&senha=SENHA
```

Sem nenhuma das duas configurações, o playbook funciona por inteiro; só os botões de IA informam que ela não está configurada.

Cuidados: o texto de cada pedido vai para a OpenAI. Não inclua dados confidenciais, nomes de clientes ou informações pessoais, e confirme a política de segurança da informação da empresa antes de usar a IA com dados reais.

## Créditos

Lean Change Management é método de Jason Little (leanchange.org); o desenho do motor é o oficial do método. Cynefin: Dave Snowden. 7S: Waterman, Peters e Phillips. ADKAR: Jeff Hiatt. Difusão de inovações: Everett Rogers. Campo de forças: Kurt Lewin. Quatro tipos de não: Andrew Atkins. Ícones: Lucide (licença ISC). Fonte: Poppins.
