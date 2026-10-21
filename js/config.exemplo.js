// MODELO de configuração para uma nova imobiliária.
// Copie este arquivo por cima do js/config.js e troque os valores (passo a passo em PERSONALIZAR.md).

// Endereço base da API Spring (em produção, o domínio da API com https).
const API_BASE_URL = "http://localhost:8080";

// ---------- Empresa ----------
const EMPRESA_NOME = "Nome da Imobiliária";
const EMPRESA_LOGO = "img/logo.png"; // caminho a partir da raiz do site (versão clara, para fundo escuro)

// Parágrafos da seção "Quem somos" (home). Um item por parágrafo.
const EMPRESA_SOBRE = [
    "Somos uma imobiliária de [cidade] que cuida da compra, venda e locação de imóveis.",
    "Conte o diferencial da empresa aqui: tempo de mercado, região em que atua, tipo de atendimento.",
];

// ---------- Contato ----------
const CONTACT_WHATSAPP_NUMBER = "5511900000000"; // Formato internacional, só dígitos (usado nos links wa.me)
const CONTACT_PHONE_DISPLAY = "(11) 90000-0000";
const CONTACT_EMAIL = "contato@suaimobiliaria.com.br";
const CONTACT_ADDRESS = "Cidade - UF"; // "Cidade - UF": a cidade também aparece nos exemplos dos formulários
const CRECI_NUMBER = null; // null = escondido. Ex.: "12345-J" (anúncio de imóvel deve trazer o CRECI)
const SOCIAL_LINKS = {
    facebook: null,  // ex.: "https://facebook.com/suaimobiliaria"
    instagram: null,
    tiktok: null,
}; // null = link não informado (o ícone aparece apagado)
