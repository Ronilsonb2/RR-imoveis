// Configuração DESTA imobiliária. O resto do site é genérico: tudo o que muda de uma empresa
// para outra está aqui (modelo em js/config.exemplo.js; passo a passo em PERSONALIZAR.md).

// Endereço base da API Spring (publicada no Railway). Para testar com a API local, use "http://localhost:8080".
const API_BASE_URL = "https://imobiliaria-production-3e42.up.railway.app";

// Endereço público do site, sem barra no final (usado em canonical, prévias de link e dados estruturados do Google).
// Ao trocar de domínio, atualize aqui e rode: node scripts/gerar-sitemap.mjs (veja PERSONALIZAR.md).
const SITE_URL = "https://rafael-imoveis.netlify.app";

// ---------- Empresa ----------
const EMPRESA_NOME = "Rafael Alves Imóveis";
const EMPRESA_LOGO = "img/logo-rafael-imoveis.webp"; // caminho a partir da raiz do site (versão clara, para fundo escuro)

// Parágrafos da seção "Quem somos" (home). Um item por parágrafo.
const EMPRESA_SOBRE = [
    "Com uma trajetória dedicada à excelência no setor imobiliário em São Paulo e região, atuo com foco na realização de negócios seguros e transparentes em compra, venda e locação.",
    "Valorizo o seu tempo: meu atendimento é direto, sem intermediários ou centrais, proporcionando uma experiência consultiva única e sob medida para o seu perfil.",
];

// ---------- Contato ----------
const CONTACT_WHATSAPP_NUMBER = "5511911108572"; // Formato internacional, só dígitos (usado nos links wa.me)
const CONTACT_PHONE_DISPLAY = "(11) 91110-8572";
const CONTACT_EMAIL = "rafabotelho73@gmail.com";
const CONTACT_ADDRESS = "São Paulo - SP"; // "Cidade - UF": a cidade também aparece nos exemplos dos formulários
const CRECI_NUMBER = "240359"; // null = ainda não informado: a linha do CRECI fica escondida. Ex.: "12345-J"
const SOCIAL_LINKS = {
    facebook: null,
    instagram: "https://www.instagram.com/rafaelalves_s.p",
    tiktok: "https://www.tiktok.com/@imoveisrafael",
}; // null = link ainda não informado (o ícone aparece apagado)
