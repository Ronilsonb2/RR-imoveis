# Como personalizar o site para outra imobiliária

O código do site e do painel é genérico. Tudo o que muda de uma empresa para outra fica em
**`js/config.js`**, mais as imagens da marca e as prévias de link.

## 1. Dados da empresa: `js/config.js`

Copie `js/config.exemplo.js` por cima de `js/config.js` e preencha:

| Constante | O que é | Onde aparece |
|---|---|---|
| `SITE_URL` | Endereço público do site, sem barra no final | canonical, prévias de link, dados estruturados e sitemap |
| `API_BASE_URL` | Endereço da API (em produção, com `https://`) | Todas as buscas e o painel |
| `EMPRESA_NOME` | Nome da imobiliária | Título das abas, rodapé, painel |
| `EMPRESA_LOGO` | Caminho do logo a partir da raiz do site (versão clara, para fundo escuro) | Topo, rodapé, "Quem somos", login do painel |
| `EMPRESA_SOBRE` | Parágrafos da seção "Quem somos" (um item por parágrafo) | Home |
| `CONTACT_WHATSAPP_NUMBER` | WhatsApp no formato internacional, só dígitos (`5511900000000`) | Todos os botões e formulários de contato |
| `CONTACT_PHONE_DISPLAY` | Telefone como deve aparecer na tela | Rodapé |
| `CONTACT_EMAIL` | E-mail de contato | Rodapé |
| `CONTACT_ADDRESS` | `"Cidade - UF"` | Rodapé e exemplos dos formulários ("Ex.: Centro, Cidade") |
| `CRECI_NUMBER` | Registro no CRECI; `null` esconde a linha | Rodapé e "Quem somos" |
| `SOCIAL_LINKS` | Links de Facebook, Instagram e TikTok; `null` deixa o ícone apagado | Rodapé |

As páginas trazem só marcadores (`data-empresa-nome`, `data-empresa-logo`, `data-contato`,
`data-rede`...), preenchidos pelo `js/empresa.js` com esses valores. Não é preciso editar HTML para isso.

## 2. Imagens

- **Logo**: coloque o arquivo em `img/` e aponte `EMPRESA_LOGO` para ele.
- **Favicon**: substitua `img/favicon.svg`.
- **Banner da home** (`img/banner2.webp` e `img/banner-mobile.webp`; use WebP, ~100 KB) troque se quiser fotos próprias.

## 3. Prévia de link (WhatsApp, Facebook)

Ao compartilhar um link, o WhatsApp e as redes leem o HTML **sem executar JavaScript**. Por isso estas
tags ficam no `<head>` de `index.html`, `produtos.html` e `detalhes-imoveis.html`, e devem ser
ajustadas à mão:

- `og:site_name`: nome da imobiliária;
- `og:image`: endereço completo de uma imagem (ex.: `https://www.suaimobiliaria.com.br/img/logo.png`).

## 4. Publicação

- **Sitemap e robots**: com `SITE_URL` e `API_BASE_URL` corretos no `js/config.js`, rode
  `node scripts/gerar-sitemap.mjs` (Node 18+). Ele lista todos os imóveis publicados em `sitemap.xml` e refaz o
  `robots.txt`. Rode de novo quando cadastrar imóveis novos. O `robots.txt` só vale na raiz do domínio
  (em `usuario.github.io/projeto/` os buscadores o ignoram; com domínio próprio funciona).
- **Metatags estáticas**: troque o endereço antigo em `og:image`, `og:url` e `canonical` dos três HTMLs
  (`index.html`, `produtos.html`, `detalhes-imoveis.html`) e em `404.html` (links e favicon, que usam o
  caminho `/imobiliaria/`).
- **Política de privacidade**: `politica-privacidade.html` é um modelo padrão para a LGPD; revise o texto
  com a imobiliária (idealmente com um advogado).
- API: liberar o domínio do site no CORS (`CORS_ORIGINS`) e criar o usuário do painel
  (`ADMIN_EMAIL` / `ADMIN_SENHA`), conforme o ROTEIRO da API.
