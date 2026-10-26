// Gera sitemap.xml e robots.txt a partir do js/config.js (SITE_URL e API_BASE_URL) e dos imóveis publicados na API.
// Uso (Node 18+):  node scripts/gerar-sitemap.mjs
// Rode de novo sempre que cadastrar/remover imóveis, ou agende (ex.: GitHub Actions) para manter atualizado.
import { readFileSync, writeFileSync } from 'node:fs';

const raiz = new URL('../', import.meta.url);
const config = readFileSync(new URL('js/config.js', raiz), 'utf8');
const lerConstante = nome => config.match(new RegExp(`const ${nome}\\s*=\\s*"([^"]+)"`))?.[1];

const siteUrl = lerConstante('SITE_URL')?.replace(/\/$/, '');
const apiUrl = lerConstante('API_BASE_URL')?.replace(/\/$/, '');
if (!siteUrl || !apiUrl) throw new Error('SITE_URL e API_BASE_URL precisam estar definidos em js/config.js');

// Percorre todas as páginas da listagem pública (a API só devolve imóveis visíveis no site)
const ids = [];
for (let pagina = 0, total = 1; pagina < total; pagina++) {
    const resposta = await fetch(`${apiUrl}/imovel?size=100&page=${pagina}`);
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status} ao listar imóveis`);
    const dados = await resposta.json();
    ids.push(...dados.content.map(imovel => imovel.idImovel));
    total = dados.page.totalPages;
}

const url = (caminho, prioridade) => `  <url>\n    <loc>${siteUrl}/${caminho}</loc>\n    <priority>${prioridade}</priority>\n  </url>`;
const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    url('index.html', '1.0'),
    url('produtos.html', '0.9'),
    ...ids.map(id => url(`detalhes-imoveis.html?idImovel=${id}`, '0.8').replace('&', '&amp;')),
    '</urlset>',
    '',
].join('\n');

writeFileSync(new URL('sitemap.xml', raiz), sitemap);
writeFileSync(new URL('robots.txt', raiz),
    `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`sitemap.xml com ${ids.length} imóveis e robots.txt gerados para ${siteUrl}`);
