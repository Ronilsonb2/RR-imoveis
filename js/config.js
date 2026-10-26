// Configuração DESTA imobiliária. O resto do site é genérico: tudo o que muda de uma empresa
// para outra está aqui (modelo em js/config.exemplo.js; passo a passo em PERSONALIZAR.md).

// Endereço base da API Spring (publicada no Railway). Para testar com a API local, use "http://localhost:8080".
const API_BASE_URL = "https://imobiliaria-production-3e42.up.railway.app";

// ---------- Empresa ----------
const EMPRESA_NOME = "R&R Imóveis";
const EMPRESA_LOGO = "img/logo-marca-footer3.png"; // caminho a partir da raiz do site (versão clara, para fundo escuro)

// Parágrafos da seção "Quem somos" (home). Um item por parágrafo.
const EMPRESA_SOBRE = [
    "A R&R Imóveis é uma imobiliária de Taboão da Serra - SP que cuida da compra, venda e locação de imóveis.",
    "O atendimento é feito diretamente pelo corretor: você fala com quem conhece o imóvel, sem central de atendimento.",
];

// ---------- Contato ----------
const CONTACT_WHATSAPP_NUMBER = "5513996308174"; // Formato internacional, só dígitos (usado nos links wa.me)
const CONTACT_PHONE_DISPLAY = "(13) 99630-8174";
const CONTACT_EMAIL = "rafabotelho73@gmail.com";
const CONTACT_ADDRESS = "Taboão da Serra - SP"; // "Cidade - UF": a cidade também aparece nos exemplos dos formulários
const CRECI_NUMBER = null; // null = ainda não informado: a linha do CRECI fica escondida. Ex.: "12345-J"
const SOCIAL_LINKS = {
    facebook: null,
    instagram: null,
    tiktok: null,
}; // null = link ainda não informado (o ícone aparece apagado)
