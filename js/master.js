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

// Inserindo os dados de pesquisas inicial na home Estados / Cidades / Bairros
document.addEventListener("DOMContentLoaded", function () {
  const estadoSelect = document.getElementById("estado-imovel");
  const cidadeSelect = document.getElementById("cidade-imovel");
  const bairroSelect = document.getElementById("bairro-imovel");

  if (!estadoSelect || !cidadeSelect || !bairroSelect) return;

  // 🔹 Carrega os estados do backend
  fetch(`${API_BASE_URL}/estados`)
      .then(response => response.json())
      .then(estados => {
          estadoSelect.innerHTML = '<option value="">Selecione um estado</option>';
          estados.forEach(estado => {
              const option = document.createElement("option");
              option.value = estado;
              option.textContent = estado;
              estadoSelect.appendChild(option);
          });
      })
      .catch(error => console.error("Erro ao carregar estados:", error));

  // 🔹 Quando o usuário escolhe um estado, buscar cidades
  estadoSelect.addEventListener("change", function () {
      const estadoSelecionado = this.value;
      cidadeSelect.innerHTML = '<option value="">Carregando cidades...</option>';
      cidadeSelect.disabled = true;
      bairroSelect.innerHTML = '<option value="">Selecione uma cidade primeiro</option>';
      bairroSelect.disabled = true;

      if (estadoSelecionado) {
          fetch(`${API_BASE_URL}/cidades?estado=${estadoSelecionado}`)
              .then(response => response.json())
              .then(cidades => {
                  cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
                  cidades.forEach(cidade => {
                      const option = document.createElement("option");
                      option.value = cidade;
                      option.textContent = cidade;
                      cidadeSelect.appendChild(option);
                  });
                  cidadeSelect.disabled = false;
              })
              .catch(error => console.error("Erro ao carregar cidades:", error));
      }
  });

  // 🔹 Quando o usuário escolhe uma cidade, buscar bairros
  cidadeSelect.addEventListener("change", function () {
      const cidadeSelecionada = this.value;
      bairroSelect.innerHTML = '<option value="">Carregando bairros...</option>';
      bairroSelect.disabled = true;

      if (cidadeSelecionada) {
          fetch(`${API_BASE_URL}/bairros?cidade=${cidadeSelecionada}`)
              .then(response => response.json())
              .then(bairros => {
                  bairroSelect.innerHTML = '<option value="">Selecione um bairro</option>';
                  bairros.forEach(bairro => {
                      const option = document.createElement("option");
                      option.value = bairro;
                      option.textContent = bairro;
                      bairroSelect.appendChild(option);
                  });
                  bairroSelect.disabled = false;
              })
              .catch(error => console.error("Erro ao carregar bairros:", error));
      }
  });
});

// Botão flutuante de WhatsApp (index.html e produtos.html)
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

