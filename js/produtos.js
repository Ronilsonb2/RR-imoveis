import { formatarPreco, truncateText } from './utils.js';
import { buscarImoveisApi } from './api.js';

const $filtro = $('.filtro');
const $formLateral = $('.form-lateral');
$filtro.click(function () {
  $formLateral.toggleClass('_open');
  $filtro.toggleClass('_open');
});

$('.select-opcao').click(function(){
  $('.select-opcao').removeClass('btn-active'); // Remove de todos
  $(this).addClass('btn-active'); // Adiciona no clicado
});

// Seleionar opcoes de filtros de imoveis
function selecionarItem(container, classe) {
  $(`${container} div`).click(function () {
    let id = $(this).attr("id");

    $(classe).css("background-color", "transparent");
    $("#" + id).css("background-color", "#877b7b");
  });
}

// Chamando a função para diferentes categorias
selecionarItem("#quartos", ".quarto");
selecionarItem("#suite", ".suite");
selecionarItem("#banheiro", ".banheiro");
selecionarItem("#vagas", ".vaga");

// Capturar os parâmetros da URL
const params = new URLSearchParams(window.location.search);
console.log('URL recebida: '+ params);

// Atualizar botões de finalidade (Compra/Aluguel)
const finalidade = params.get('finalidadeImovel');

// Mapeamento de ID dos botões
const botoes = {
  'VENDA': "opcoes-compras",
  'LOCACAO': "opcoes-alugar"
};

// Ativar botão correspondente
if (botoes[finalidade]) { document.getElementById(botoes[finalidade]).classList.add("btn-active")}

// Preencher os filtros com os valores da URL
document.getElementById('tipo-imovel').value = params.get('tipoDeImovel') || 'Selecione';
const estadoSelect = document.getElementById('estado-imovel');
const cidadeSelect = document.getElementById('cidade-imovel');
const bairroSelect = document.getElementById('bairro-imovel');

// Função para definir o valor após as opções estarem carregadas
function setSelectValue(selectElement, value) {
  if (value) {
      let optionExists = [...selectElement.options].some(option => option.value === value);
      if (optionExists) {selectElement.value = value;}
  }
}

// Estado pode ser setado diretamente
setTimeout(() => {
  setSelectValue(estadoSelect, params.get('estado'));
}, 100);

// Aguardar carregamento das cidades antes de definir o valor
estadoSelect.addEventListener("change", async function() {
  await esperarCarregamento(cidadeSelect);
  setSelectValue(cidadeSelect, params.get('cidade'));
});

function esperarCarregamento(elemento) {
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (elemento.options.length > 1) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(elemento, { childList: true });
  });
}

// Aguardar carregamento dos bairros antes de definir o valor
cidadeSelect.addEventListener("change", function() {
    setTimeout(() => {
        setSelectValue(bairroSelect, params.get('bairro'));
    }, 1000);
});

// Dispara o evento manualmente caso o estado já venha da URL
if (params.get('estado')) {
    estadoSelect.dispatchEvent(new Event("change"));
}

// A API ainda não ordena nem filtra por destaque de verdade, então buscamos
// o lote inteiro do filtro atual e ordenamos/paginamos aqui no front.
const TAMANHO_LOTE = 1000;
const paginaInicial = parseInt(params.get('page'), 10) || 0;
params.set('page', '0');
params.set('size', String(TAMANHO_LOTE));

// Construir a URL para a API com base nos parâmetros recebidos
let apiUrl = `${API_BASE_URL}/imovel/filtros/avancados?${params.toString()}`;
const resultadoImoveis = document.getElementById('show-imoveis-filtrados');
mostrarImoveis(apiUrl, resultadoImoveis);

// Critério de referência pra ordenar por preço (usa o que estiver preenchido)
function valorDeReferencia(imovel) {
  return imovel.precoVenda !== null && imovel.precoVenda !== undefined
    ? imovel.precoVenda
    : (imovel.precoLocacao || 0);
}

function ordenarImoveis(imoveis, criterio) {
  const copia = [...imoveis];
  switch (criterio) {
    case "menor_valor":
      return copia.sort((a, b) => valorDeReferencia(a) - valorDeReferencia(b));
    case "maior_valor":
      return copia.sort((a, b) => valorDeReferencia(b) - valorDeReferencia(a));
    case "recentes":
      return copia.sort((a, b) => b.idImovel - a.idImovel);
    default:
      return copia;
  }
}

// Metodo responsavel por fazer o carregamento de todos os imoveis encontrados, na pagina
async function mostrarImoveis(url, resultadoImoveis) {
    const totalImoveisRetornados = document.getElementById('resultado-total-imoveis');
    const data = await buscarImoveisApi(url);

    if (data.totalElements > 0) {
      totalImoveisRetornados.innerHTML = `<p><b>${data.totalElements}</b> ${data.totalElements === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}</p>`;

      // Ordena o lote completo e recorta só a página atual
      const imoveisOrdenados = ordenarImoveis(data.content, ordenacao);
      const totalPaginas = Math.ceil(imoveisOrdenados.length / itensPorPagina);
      const inicio = paginaAtual * itensPorPagina;
      const imoveisDaPagina = imoveisOrdenados.slice(inicio, inicio + itensPorPagina);

      // Limpa os resultados anteriores
      resultadoImoveis.innerHTML = '';

      // Renderiza os imóveis
      imoveisDaPagina.forEach(imovel => resultadoImoveis.appendChild(criarCardImovel(imovel)));
      atualizarPaginacao(totalPaginas);

    } else {
        totalImoveisRetornados.innerHTML = '<p><b>0</b> imóveis encontrados</p>';
        const urlSugestoes = `${API_BASE_URL}/imovel`;
        sugestoesDeImoveis(urlSugestoes);
    }
}

let carrosselIndex = 1; // Variável global para controlar os IDs dos carrosséis

// Função para criar o HTML de um imóvel
function criarCardImovel(imovel) {
  const slideElement = document.createElement('div');
  slideElement.classList.add('slide');

  console.log(imovel);

  let imagensHTML = "";
  if (imovel.imagens.length > 0) {
      // A API retorna "imagens" como array de objetos {id,url} em /imovel,
      // mas como array de strings em /imovel/filtros/avancados (usado aqui).
      imagensHTML = imovel.imagens.map((img, index) => {
          const url = typeof img === "string" ? img : img.url;
          return `<div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${url}" class="d-block w-100" alt="...">
          </div>`;
      }).join("");
  } else {
      imagensHTML = `<div class="carousel-item active">
                        <img src="img/sem-foto.jpeg" class="d-block w-100" alt="Imagem padrão">
                     </div>`;
  }

  // const imageUrl = imovel.imagens.length > 0 ? imovel.imagens[0] : 'img/sem-foto.jpg'; // 
  const descricaoResumida = truncateText(imovel.descricao, 65);
  const precoVendaFormat = Number(imovel.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');
  const precoLocacaoFormat = Number(imovel.precoLocacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');

  // Criando um ID único para cada carrossel
  const carouselId = `imagens-imovel-carrossell${carrosselIndex}`;

  // Gerar o HTML do slide
  slideElement.innerHTML = `
    <div class="box-produto">
        <div id="${carouselId}" class="imagens-imovel carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            ${imagensHTML}
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
        <div class="desc-oferta-container">
            <div class="desc-oferta">
                <div>
                    <h2>${imovel.titulo}</h2>
                    <h3>${imovel.endereco.bairro}, ${imovel.endereco.cidade}</h3>
                </div>
                <p class="descricao-curta">${descricaoResumida}</p>
                <div class="icons-config">
                    <div class="icons metragem">${imovel.areaConstruida}</div>
                    <div class="icons quarto">${imovel.quartos}</div>
                    <div class="icons banheiro">${imovel.banheiros}</div>
                    <div class="icons garagem">${imovel.garagem}</div>
                </div>
                <p class="price-imovel">${imovel.precoVenda !== null
                  ? `Venda<br> <span> ${precoVendaFormat}</span>`
                  : `Locação<br> <span> ${precoLocacaoFormat}</span>`
                }
                </p>
                <div class="text-xs-center">
                    <a target="_blank" href="/detalhes-imoveis.html?idImovel=${imovel.idImovel}" class="btn-2">Mais detalhes</a>
                </div>
            </div>
        </div>
    </div>
  `;

  carrosselIndex++;
  return slideElement;
}

// Variaveis da funcao realizarBusca
let finalidadeImovel = '';
let tipoImovel = '';
let estadoImovel = '';
let cidadeImovel = '';
let bairroImovel = '';
let qtdQuartos = '';
let qtdSuites = '';
let qtdBanheiros = '';
let qtdGaragen = '';
let precoMin = '';
let precoMax = '';
let areaMin = '';
let areaMax = '';
let ordenacao = document.getElementById('ordenacao-resultados').value;

let paginaAtual = paginaInicial;
const itensPorPagina = 9;

function realizarBusca(pagina = 0){
  paginaAtual = pagina; // Atualiza a página atual
  let params = new URLSearchParams();

  // Busca o lote inteiro (ordenação e paginação acontecem no front)
  params.append("page", 0);
  params.append("size", TAMANHO_LOTE);
  params.append("finalidadeImovel", finalidadeImovel || finalidade || "VENDA");

  if (estadoImovel) params.append("estado", estadoImovel);
  if (cidadeImovel) params.append("cidade", cidadeImovel);
  if (bairroImovel) params.append("bairro", bairroImovel);
  if (tipoImovel && tipoImovel !== "Selecione") params.append("tipoDeImovel", tipoImovel);
  if (qtdQuartos) params.append("quartos", qtdQuartos);
  if (qtdSuites) params.append("suites", qtdSuites); // confira se o nome do parâmetro bate com o @RequestParam da sua API
  if (qtdBanheiros) params.append("banheiros", qtdBanheiros);
  if (qtdGaragen) params.append("garagem", qtdGaragen);
  if (areaMin) params.append("areaMin", areaMin);
  if (areaMax) params.append("areaMax", areaMax);
  
  // Formatação do preço
  if (precoMin) {
    let precoMinFormat = precoMin.trim().replace(/\./g, '').replace(',', '.');
    params.append(finalidadeImovel === "LOCACAO" ? "precoLocacaoMin" : "precoVendaMin", precoMinFormat);
  }
  if (precoMax) {
    let precoMaxFormat = precoMax.trim().replace(/\./g, '').replace(',', '.');
    params.append(finalidadeImovel === "LOCACAO" ? "precoLocacaoMax" : "precoVendaMax", precoMaxFormat);
  }

  let url = `${API_BASE_URL}/imovel/filtros/avancados?${params.toString()}`;
  console.log('URL gerada:', url);

  // Atualiza a URL sem recarregar a página (aqui sim com o número de página real)
  const paramsUrl = new URLSearchParams(params);
  paramsUrl.set("page", pagina);
  window.history.pushState({}, "", window.location.pathname + "?" + paramsUrl.toString());

  mostrarImoveis(url, resultadoImoveis);
};

// Monta a lista de páginas a exibir, sempre com primeira, última,
// a atual e suas vizinhas, usando "..." para os intervalos escondidos.
function gerarPaginasVisiveis(atual, total) {
  const janela = 1;
  const inicio = Math.max(0, atual - janela);
  const fim = Math.min(total - 1, atual + janela);

  const paginas = [0];
  if (inicio > 1) paginas.push("...");
  for (let i = inicio; i <= fim; i++) {
      if (i !== 0 && i !== total - 1) paginas.push(i);
  }
  if (fim < total - 2) paginas.push("...");
  paginas.push(total - 1);

  return paginas;
}

function atualizarPaginacao(totalPages) {
  const paginacao = document.querySelector("#paginacao");
  paginacao.innerHTML = ""; // Limpa a paginação anterior

  if (totalPages <= 1) return; // Se houver apenas uma página, não exibe os botões

  // Botão "Anterior"
  if (paginaAtual > 0) {
      const btnAnterior = document.createElement("button");
      btnAnterior.classList.add("pagina-btn", "pagina-nav");
      btnAnterior.innerHTML = "&lsaquo;";
      btnAnterior.setAttribute("aria-label", "Página anterior");
      btnAnterior.addEventListener("click", () => realizarBusca(paginaAtual - 1));
      paginacao.appendChild(btnAnterior);
  }

  // Botões numerados, com reticências para intervalos longos
  gerarPaginasVisiveis(paginaAtual, totalPages).forEach(pagina => {
      if (pagina === "...") {
          const reticencias = document.createElement("span");
          reticencias.classList.add("reticencias");
          reticencias.innerText = "...";
          paginacao.appendChild(reticencias);
          return;
      }

      const btnNumero = document.createElement("button");
      btnNumero.innerText = pagina + 1;
      btnNumero.classList.add("pagina-btn", paginaAtual === pagina ? "ativo" : "inativo");
      btnNumero.addEventListener("click", () => realizarBusca(pagina));
      paginacao.appendChild(btnNumero);
  });

  // Botão "Próximo"
  if (paginaAtual < totalPages - 1) {
      const btnProximo = document.createElement("button");
      btnProximo.classList.add("pagina-btn", "pagina-nav");
      btnProximo.innerHTML = "&rsaquo;";
      btnProximo.setAttribute("aria-label", "Próxima página");
      btnProximo.addEventListener("click", () => realizarBusca(paginaAtual + 1));
      paginacao.appendChild(btnProximo);
  }
}

async function sugestoesDeImoveis(url) {

  const totalImoveisRetornados = document.getElementById('resultado-total-imoveis');

  const data = await buscarImoveisApi(url);

  console.log(data.totalElements);

  totalImoveisRetornados.innerHTML = `<p style="font-size: 25px;"><b>Nenhum imóvel encontrado!</b></p>`;
  
  // Menssagem mostrada quando não encontrou nenhum imovel
  resultadoImoveis.innerHTML = ` 
  <div class="msg-info" style="display: flex;">
    <h1><b>Oops!</b><h1>
    <br>
      <h3>Sua busca não retornou nenhum resultado.</h3>
    <br>
    <p>Veja algumas sugestões =></p>
  </div>`;

    // Pega até 5 imóveis sugeridos (a própria "url" já é a listagem geral, sem filtros)
    const sugestoes = data.content.slice(0, 5);

    sugestoes.forEach(imovel => resultadoImoveis.appendChild(criarCardImovel(imovel)));
}

//=========== Busca avançada com filtros========== //
const opCompra = document.getElementById("opcoes-compras");
const opAlugar = document.getElementById("opcoes-alugar");
const selectTipoImovel = document.getElementById('tipo-imovel');
const selectEstadoImovel = document.getElementById('estado-imovel');
const selectCidadeImovel = document.getElementById('cidade-imovel');
const selectBairroImovel = document.getElementById('bairro-imovel');
const btnBuscar = document.getElementById('btn-buscar');
const selectOrdenacao = document.getElementById('ordenacao-resultados');

opCompra.addEventListener("click", function(){finalidadeImovel = "VENDA";});
opAlugar.addEventListener("click", function(){finalidadeImovel = "LOCACAO";});
selectTipoImovel.addEventListener("change", function(){tipoImovel = selectTipoImovel.value;});
selectEstadoImovel.addEventListener('change', function(){estadoImovel = selectEstadoImovel.value;});
selectCidadeImovel.addEventListener('change', function(){cidadeImovel = selectCidadeImovel.value;});
selectBairroImovel.addEventListener('change', function(){bairroImovel = selectBairroImovel.value;});

// Reordena sem esperar o clique em "Buscar" e volta pra primeira página
selectOrdenacao.addEventListener('change', function () {
  ordenacao = selectOrdenacao.value;
  realizarBusca(0);
});

document.querySelector('#preco-min').addEventListener('input', function(event) {
  precoMin = formatarPreco(event.target);
  event.target.value = precoMin;
});

document.querySelector('#preco-max').addEventListener('input', function(event) {
  precoMax = formatarPreco(event.target);
  event.target.value = precoMax;
});

document.querySelectorAll('#quartos .gtd-op').forEach(item => {
  item.addEventListener('click', event => {
    let selectedValue = event.target.innerText;
    qtdQuartos = parseInt(selectedValue.replace('+', ''), 10);
  });
});

document.querySelectorAll('#suite .gtd-op').forEach(item => {
  item.addEventListener('click', event => {
    let selectedValue = event.target.innerText;
    qtdSuites = parseInt(selectedValue.replace('+', ''), 10);
  });
});

document.querySelectorAll('#banheiro .gtd-op').forEach(item => {
  item.addEventListener('click', event => {
    let selectedValue = event.target.innerText;
    qtdBanheiros = parseInt(selectedValue.replace('+', ''), 10);
  });
});

document.querySelectorAll('#vagas .gtd-op').forEach(item => {
  item.addEventListener('click', event => {
    let selectedValue = event.target.innerText;
    qtdGaragen = parseInt(selectedValue.replace('+', ''), 10);
  });
});

document.querySelector('#area-min').addEventListener('input', function(event) {   
  areaMin = event.target.value.trim();  
  let errorMsg = document.querySelector('.erro-msg-area-min');   

  if (isNaN(areaMin) || areaMin < 1) {  
      errorMsg.style.display = 'block';  
  } else {  
      errorMsg.style.display = 'none';  
  }  
});

document.querySelector('#area-max').addEventListener('input', function(event) {   
  areaMax = event.target.value.trim();  
  let errorMsg = document.querySelector('.erro-msg-area-max');    

  if (isNaN(areaMax) || areaMax < 1) {  
      errorMsg.style.display = 'block';  
  } else {  
      errorMsg.style.display = 'none';  
  }  
});

btnBuscar.addEventListener('click', function(){
  document.querySelector(".filtro").classList.remove("_open");
  document.querySelector(".form-lateral").classList.remove("_open");
  window.scrollTo(0, 0);

  tipoImovel = selectTipoImovel.value;
  estadoImovel = selectEstadoImovel.value;
  realizarBusca();
});





