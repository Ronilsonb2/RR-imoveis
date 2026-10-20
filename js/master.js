$('#nav-bar-toggle').click(function () {
  $('.menu-line').toggleClass('_open');
  $('.nav-bar').toggleClass('_open');
})

$('.nav-bar li').click(function(){ 
  $('.menu-line').removeClass('_open');
  $('.nav-bar').removeClass('_open');
});

window.addEventListener('scroll', function(e) {
  $('.menu-line').removeClass('_open');
  $('.nav-bar').removeClass('_open');
});

function initPosition(){
  let headerHeight = $('.header').height();
  // $('.banner-logo').css('margin-top', headerHeight);

  setTimeout(function(){$('#body').addClass('_open'); }, 300);
}

$(document).ready(function() {
  setTimeout(function(){initPosition(); }, 500);
});

// Voltando ao topo da pagina
document.getElementById("voltar-ao-topo").addEventListener("click", function () {
  window.scrollTo({
      top: 0,
      behavior: "smooth" // Suaviza o scroll
  });
});

// Os selects Estado / Cidade / Bairro são carregados por js/localizacao.js

// Botão flutuante de WhatsApp (index.html e produtos.html)
// Rodapé: ano atual e CRECI (a linha só aparece quando CRECI_NUMBER estiver preenchido no config.js)
document.addEventListener("DOMContentLoaded", function () {
  const ano = document.getElementById("ano-atual");
  if (ano) ano.textContent = new Date().getFullYear();

  // Rodapé (#creci) e "Quem somos" ([data-creci])
  if (CRECI_NUMBER) {
    document.querySelectorAll("#creci, [data-creci]").forEach(function (elemento) {
      elemento.textContent = `CRECI: ${CRECI_NUMBER}`;
      elemento.hidden = false;
    });
  }

  // Links de WhatsApp com mensagem pronta: <a data-whatsapp-msg="...">
  document.querySelectorAll("[data-whatsapp-msg]").forEach(function (link) {
    link.href = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(link.dataset.whatsappMsg)}`;
  });
});

// "Quer vender ou alugar seu imóvel?" -> monta a mensagem e abre o WhatsApp do corretor
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-anuncie");
  if (!form) return;

  const erro = document.getElementById("anuncie-erro");
  const valor = function (id) { return document.getElementById(id).value.trim(); };

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = valor("anuncie-nome");
    const telefone = valor("anuncie-telefone");
    const local = valor("anuncie-local");
    if (!nome || !telefone || !local) {
      erro.textContent = "Preencha seu nome, telefone e o bairro/cidade do imóvel.";
      erro.hidden = false;
      return;
    }
    erro.hidden = true;

    const detalhes = valor("anuncie-detalhes");
    const mensagem =
      `Olá! Quero anunciar meu imóvel com a R&R Imóveis.\n\n` +
      `Nome: ${nome}\n` +
      `Telefone: ${telefone}\n` +
      `Quero: ${valor("anuncie-finalidade")}\n` +
      `Tipo: ${valor("anuncie-tipo")}\n` +
      `Local: ${local}` +
      (detalhes ? `\nDetalhes: ${detalhes}` : "");

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, "_blank");
    form.reset();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const btnWhatsFlutuante = document.getElementById("btn-whatsapp-flutuante");
  if (!btnWhatsFlutuante) return;

  const mensagem = "Olá! Gostaria de mais informações sobre os imóveis disponíveis.";
  btnWhatsFlutuante.setAttribute("href", `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`);
});

// Formulário de contato -> envia via WhatsApp
document.addEventListener("DOMContentLoaded", function () {
  const btnEnviar = document.getElementById("enviar-form");
  const btnCancelar = document.getElementById("cancelar-form");
  if (!btnEnviar || !btnCancelar) return;

  const campoNome = document.getElementById("contato-nome");
  const campoTelefone = document.getElementById("contato-telefone");
  const campoEmail = document.getElementById("contato-email");
  const campoDuvida = document.getElementById("contato-duvida");
  const erroMsg = document.getElementById("contato-erro");

  function limparFormulario() {
    campoNome.value = "";
    campoTelefone.value = "";
    campoEmail.value = "";
    campoDuvida.value = "";
    erroMsg.style.display = "none";
  }

  btnEnviar.addEventListener("click", function () {
    const nome = campoNome.value.trim();
    const telefone = campoTelefone.value.trim();
    const email = campoEmail.value.trim();
    const duvida = campoDuvida.value.trim();

    if (!nome || !duvida || (!telefone && !email)) {
      erroMsg.textContent = "Preencha nome, dúvida e ao menos um contato (telefone ou email).";
      erroMsg.style.display = "block";
      return;
    }
    erroMsg.style.display = "none";

    const mensagem =
      `Olá! Meu nome é ${nome}.\n` +
      (telefone ? `Telefone: ${telefone}\n` : "") +
      (email ? `Email: ${email}\n` : "") +
      `Dúvida: ${duvida}`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, "_blank");
    limparFormulario();
  });

  btnCancelar.addEventListener("click", limparFormulario);
});

