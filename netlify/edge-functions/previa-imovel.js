// Prévia do link do imóvel (WhatsApp, Facebook...) com a foto do próprio imóvel.
//
// Os robôs de prévia leem o HTML sem executar JavaScript, e a página de detalhes é estática (as tags og: trazem
// a imagem da imobiliária). Esta função roda na Netlify, na frente da página: se quem pede é um robô de prévia,
// devolve o HTML que a API monta em /compartilhar/{id} (foto de capa, título e preço do imóvel); para qualquer
// outra pessoa, e em qualquer falha, serve a página normal.
//
// O endereço da API vem do próprio js/config.js do site (API_BASE_URL), então não há nada para configurar aqui.

export const config = { path: ['/detalhes-imoveis.html', '/detalhes-imoveis'] };

// Só robôs de compartilhamento. Buscadores (Google, Bing) ficam de fora: recebem a página completa.
const ROBOS_DE_PREVIA = /WhatsApp|facebookexternalhit|facebot|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|SkypeUriPreview|Pinterest/i;

let apiBase; // lido uma vez por instância da função

async function enderecoDaApi(origem) {
    if (apiBase !== undefined) return apiBase;
    try {
        const resposta = await fetch(new URL('/js/config.js', origem), { signal: AbortSignal.timeout(3000) });
        const achado = (await resposta.text()).match(/const\s+API_BASE_URL\s*=\s*["']([^"']+)["']/);
        apiBase = achado ? achado[1].replace(/\/+$/, '') : null;
    } catch {
        return null; // não guarda a falha: tenta de novo na próxima requisição
    }
    return apiBase;
}

export default async function previaDoImovel(request, context) {
    const url = new URL(request.url);
    const id = url.searchParams.get('idImovel');

    if (!id || !/^\d{1,18}$/.test(id) || !ROBOS_DE_PREVIA.test(request.headers.get('user-agent') || '')) {
        return context.next();
    }

    try {
        const api = await enderecoDaApi(url.origin);
        if (!api) return context.next();

        // redirect manual: a API responde 302 (imóvel sem foto ou fora do site) e aí vale a página normal
        const resposta = await fetch(`${api}/compartilhar/${id}`, {
            redirect: 'manual',
            signal: AbortSignal.timeout(4000),
            headers: { accept: 'text/html' },
        });
        if (resposta.status !== 200) return context.next();

        return new Response(await resposta.text(), {
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'cache-control': 'public, max-age=300',
            },
        });
    } catch {
        return context.next(); // API fora do ar ou lenta: a prévia fica com a imagem padrão, o link não quebra
    }
}
