// Endereço base da API Spring. Quando publicar a API em produção,
// troque apenas esta linha em vez de procurar em cada arquivo .js
const API_BASE_URL = "http://localhost:8080";

// Dados de contato da imobiliária. Centralizados aqui para não precisar
// editar index.html, produtos.html e detalhes-imoveis.html separadamente.
const CONTACT_WHATSAPP_NUMBER = "5513996308174"; // Formato internacional, só dígitos (usado nos links wa.me)
const CONTACT_PHONE_DISPLAY = "(13) 99630-8174";
const CONTACT_EMAIL = "rafabotelho73@gmail.com";
const CONTACT_ADDRESS = "Taboão da Serra - SP";
const CRECI_NUMBER = null; // null = ainda não informado, exibe placeholder de pendência
const SOCIAL_LINKS = {
    facebook: null,
    instagram: null,
    tiktok: null,
}; // null = link ainda não informado
