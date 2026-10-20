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

// Botão flutuante de WhatsApp (index.html e produtos.html)
document.addEventListener("DOMContentLoaded", function () {
  const btnWhatsFlutuante = document.getElementById("btn-whatsapp-flutuante");
  if (!btnWhatsFlutuante) return;

  const mensagem = "Olá! Gostaria de mais informações sobre os imóveis disponíveis.";
  btnWhatsFlutuante.setAttribute("href", `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`);
});

// "Fale com a gente": um formulário só, com assunto. "Anunciar meu imóvel" mostra os campos do imóvel.
// O envio monta a mensagem e abre o WhatsApp do corretor.
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-contato");
  if (!form) return;

  const assunto = document.getElementById("contato-assunto");
  const camposAnunciar = document.getElementById("campos-anunciar");
  const rotuloMensagem = document.getElementById("rotulo-mensagem");
  const erro = document.getElementById("contato-erro");
  const valor = function (id) { return document.getElementById(id).value.trim(); };

  function ajustarAoAssunto() {
    const anunciar = assunto.value === "anunciar";
    camposAnunciar.hidden = !anunciar;
    rotuloMensagem.textContent = anunciar ? "Detalhes do imóvel (opcional)" : "Mensagem";
    document.getElementById("contato-mensagem").placeholder = anunciar
      ? "Quartos, metragem, valor pretendido..."
      : "Conte o que você procura ou qual é a sua dúvida";
  }
  assunto.addEventListener("change", ajustarAoAssunto);
  ajustarAoAssunto();

  // Botões como "Quero anunciar meu imóvel" (data-assunto) já abrem o formulário no assunto certo
  document.querySelectorAll("[data-assunto]").forEach(function (botao) {
    botao.addEventListener("click", function () {
      assunto.value = botao.dataset.assunto;
      ajustarAoAssunto();
      setTimeout(function () { document.getElementById("contato-nome").focus({ preventScroll: true }); }, 400);
    });
  });

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const anunciar = assunto.value === "anunciar";
    const nome = valor("contato-nome");
    const telefone = valor("contato-telefone");
    const email = valor("contato-email");
    const mensagemTexto = valor("contato-mensagem");
    const local = valor("contato-local");

    let problema = "";
    if (!nome || (!telefone && !email)) problema = "Preencha seu nome e ao menos um contato (telefone ou e-mail).";
    else if (anunciar && !local) problema = "Informe o bairro e a cidade do imóvel.";
    else if (!anunciar && !mensagemTexto) problema = "Escreva sua mensagem.";
    if (problema) {
      erro.textContent = problema;
      erro.hidden = false;
      return;
    }
    erro.hidden = true;

    const contato = (telefone ? `Telefone: ${telefone}\n` : "") + (email ? `E-mail: ${email}\n` : "");
    let mensagem;
    if (anunciar) {
      mensagem =
        `Olá! Quero anunciar meu imóvel com a R&R Imóveis.\n\n` +
        `Nome: ${nome}\n` + contato +
        `Quero: ${valor("contato-finalidade")}\n` +
        `Tipo: ${valor("contato-tipo")}\n` +
        `Local: ${local}` +
        (mensagemTexto ? `\nDetalhes: ${mensagemTexto}` : "");
    } else {
      const intro = assunto.value === "interesse" ? "Estou procurando um imóvel para comprar ou alugar." : "Tenho uma dúvida.";
      mensagem = `Olá! Meu nome é ${nome}. ${intro}\n\n` + contato + `\n${mensagemTexto}`;
    }

    window.open(`https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`, "_blank");
    form.reset();
    ajustarAoAssunto();
  });
});
