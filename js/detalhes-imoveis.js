
const paramsIdImovel = new URLSearchParams(window.location.search);
let apiUrlImovel = `${API_BASE_URL}/imovel/${paramsIdImovel.get("idImovel")}`;

const resultImovel = document.getElementById('show-imovel');

console.log(`URL do imovel: ${apiUrlImovel}`);

mostrarImoveis(apiUrlImovel, resultImovel);


function mostrarImoveis(apiUrlImovel, resultImovel) {

  // Fazendo a requisição para a URL com o tipo de imóvel escolhido
  fetch(apiUrlImovel)
  .then(response => response.json()) // Convertemos a resposta para JSON
  .then(data => {
      console.log("Dados do imóvel:", data);

      // Checar se data é um objeto de imóvel ou contém erro
      if (!data || Object.keys(data).length === 0) {
        resultImovel.textContent = 'Nenhum imóvel encontrado.';
        return;
      }
    
      const imovel = data; // Array com os imóveis

      // Título da aba com o nome do imóvel (só afeta a aba do navegador;
      // não muda o preview de link no WhatsApp/redes, que não executa JS)
      document.title = `${imovel.titulo} — R&R Imóveis`;
      const metaDescricao = document.getElementById('detalhes-description');
      if (metaDescricao) {
        const descricaoResumida = imovel.descricao.length > 150
          ? imovel.descricao.substring(0, 150) + '...'
          : imovel.descricao;
        metaDescricao.setAttribute('content', descricaoResumida);
      }

      resultImovel.innerHTML = '';

      const slideElement = document.createElement('div');
      slideElement.classList.add('slide');

      let imagensHTML = "";
      if (imovel.imagens.length > 0) {
        console.log(imovel.imagens.length);
          imagensHTML = imovel.imagens.map((img, index) => 
              `<img src="${img.url}" class="" alt="...">`
          ).join("");
      } else {
          imagensHTML = `<img src="img/sem-foto.jpeg" class="d-block w-100" alt="Imagem padrão">`;
      }

      console.log(imagensHTML);


      let precoVendaFormat = Number(imovel.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');
      let precoLocacaoFormat = Number(imovel.precoLocacao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '');

      // Gerar o HTML do slide
      slideElement.innerHTML = `
        <div class="imagens-imovel">
            ${imagensHTML}
        </div>

        <div class="container-detalhes-imovel">
            <div class="info-price">
                <div class="price">
                    <p>${imovel.finalidadeImovel === "VENDA" ? "Venda" : "Locacão"}</p>
                    <span>R$ ${imovel.finalidadeImovel === "VENDA" ? precoVendaFormat : precoLocacaoFormat} 
                            ${imovel.finalidadeImovel === "LOCACAO" ? '<span class="dinamica">/mês</span>' : ''}</span>
                </div>
                <div class="info-condominio">
                    <p>Condominio</p>
                    <span>R$ ${Number(imovel.taxaCondominio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="info-iptu">
                    <p>IPTU</p>
                    <span>R$ ${Number(imovel.valorIptu || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
            <div class="info-detalhes-imovel">
                <div class="qtd-metros">
                    <span>✅ ${imovel.areaConstruida} m2</span>
                </div>
                <div class="qtd-quartos">
                    <span>✅ ${imovel.quartos} quarto${imovel.quartos > 1 ? 's' : ''}</span>
                </div>
                <div class="info-banheiros">
                    <span>✅ ${imovel.banheiros} banheiro${imovel.banheiros > 1 ? 's' : ''}</span>
                </div>
                <div class="info-garagem">
                    <span>✅ ${imovel.garagem} vaga${imovel.garagem > 1 ? 's' : ''}</span>
                </div>
            </div>

            <div class="info-endereco">
                <p>Endereço</p>
                <span>${imovel.endereco.rua}, ${imovel.endereco.bairro} - ${imovel.endereco.cidade} ${imovel.endereco.estado}</span>
            </div>

            <div class="line">&nbsp;</div>

            <div class="descricao-imovel">
                <h1 class="titulo-imovel">${imovel.titulo}</h1>
                <p class="descricao">${imovel.descricao}</p>
            </div>

            <div class="info-contado">${CONTACT_PHONE_DISPLAY} · ${CONTACT_EMAIL}</div>
        </div>
      `;

      // Adicionar o slide ao contêiner do carrossel
      resultImovel.appendChild(slideElement);

      // O Slick só pode ser iniciado depois que as imagens já estão no DOM
      // (antes disso, no "window load", a div ainda estava vazia).
      $('.imagens-imovel').slick({
          dots: imovel.imagens.length > 1,
          arrows: imovel.imagens.length > 1,
          infinite: imovel.imagens.length > 1,
          speed: 500,
          cssEase: 'linear',
          slidesToShow: 3,
          slidesToScroll: 1,
          responsive: [
              {
                  breakpoint: 1000,
                  settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1
                  }
              }
          ]
      });

  })
  .catch(error => {
      console.error('Erro ao buscar imóveis:', error);
      resultImovel.textContent = 'Erro ao buscar imóveis.';
  });
}


// Direcionando contato para Whatsapp
document.addEventListener('DOMContentLoaded', () => {
    const mensagem =
                    `Olá! Tenho interesse neste imóvel.\n\n` +
                    `Link do imóvel: ${window.location.href}\n\n` +
                    `Poderia me passar mais informações, por favor?`;

    const urlWhatsapp = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  
    const btnWhatsapp = document.getElementById("btn-whatsapp");
    btnWhatsapp.setAttribute("href", urlWhatsapp);
});