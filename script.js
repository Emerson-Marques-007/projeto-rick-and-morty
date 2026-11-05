/**
 * script.js - Galeria de personagens de Rick and Morty
 * Autor: Emerson Marques Cardoso dos Santos (RA 92924)
 * Curso: Análise e Desenvolvimento de Sistemas - UniFECAF
 * Disciplina: Web Development Front-End
 *
 * O QUE ESTE ARQUIVO FAZ
 *  1. Consome a Rick and Morty API com fetch (https://rickandmortyapi.com/api/character).
 *     Não precisa de token nem de cadastro.
 *  2. Cria os cards dos personagens dinamicamente (createElement + appendChild).
 *  3. Busca por nome, filtro por status, paginação (20 por página), favoritos
 *     e um portal que sorteia uma página aleatória.
 *
 * FLUXO: evento na tela -> buscarPersonagens() -> fetch -> JSON -> mostrarCards() -> criarCard()
 */

// endereço base da API (não precisa de token)
const urlApi = "https://rickandmortyapi.com/api/character";

// a API tem 51 episódios no total. Uso esse número pra calcular o tamanho da barra do card
const totalEpisodiosApi = 51;

// elementos da página que o JavaScript precisa manipular
const areaCards = document.getElementById("lista-cards");
const mensagem = document.getElementById("mensagem");
const inputBusca = document.getElementById("busca");
const selectStatus = document.getElementById("filtro-status");
const btnAnterior = document.getElementById("anterior");
const btnProxima = document.getElementById("proxima");
const textoPagina = document.getElementById("pagina-info");
const btnFavoritos = document.getElementById("btn-favoritos");
const spanQtdFav = document.getElementById("qtd-fav");
const btnPortal = document.getElementById("btn-portal");
const galeria = document.getElementById("galeria");

let pagina = 1;
let totalPaginas = 1;
let vendoFavoritos = false;

// cada vez que carrego algo ganha um número novo. Se uma resposta antiga
// chegar atrasada (digitei rápido ou troquei de página) eu ignoro ela
let numeroRequisicao = 0;

// favoritos ficam salvos no navegador (só os ids) pra não perder quando atualizar a página
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// a API devolve tudo em inglês, então traduzo na hora de mostrar
const statusPt = { Alive: "Vivo", Dead: "Morto", unknown: "Desconhecido" };
const generoPt = { Male: "Masculino", Female: "Feminino", Genderless: "Sem gênero", unknown: "Desconhecido" };


/**
 * Busca uma página de personagens na API e manda desenhar os cards.
 *
 * Passos:
 *  1. monta a URL com a página, o nome buscado e o status escolhido;
 *  2. faz o fetch (requisição GET);
 *  3. confere se a resposta é válida (a API devolve 404 quando nada é encontrado);
 *  4. converte o corpo da resposta de JSON para objeto;
 *  5. guarda o total de páginas e cria os cards;
 *  6. se algo falhar, o catch mostra a mensagem de erro na tela.
 */
function buscarPersonagens() {
  numeroRequisicao++;
  const minhaVez = numeroRequisicao;

  vendoFavoritos = false;
  btnFavoritos.classList.remove("ativo");
  mensagem.classList.remove("erro");
  mensagem.textContent = "Abrindo o portal...";
  mostrarEsqueleto();

  let url = urlApi + "?page=" + pagina;
  if (inputBusca.value.trim() !== "") {
    url += "&name=" + encodeURIComponent(inputBusca.value.trim());
  }
  if (selectStatus.value !== "") {
    url += "&status=" + selectStatus.value;
  }

  fetch(url)
    .then(function (resposta) {
      // quando a busca não acha nada a API devolve 404
      if (!resposta.ok) {
        throw new Error("Nenhum personagem encontrado com esses filtros. Tente outro nome.");
      }
      return resposta.json();
    })
    .then(function (dados) {
      if (minhaVez !== numeroRequisicao) { return; } // resposta antiga, ignora

      totalPaginas = dados.info.pages;
      mensagem.textContent = dados.info.count + " personagens encontrados";
      mostrarCards(dados.results);
      atualizarBotoes();
    })
    .catch(function (erro) {
      if (minhaVez !== numeroRequisicao) { return; }

      areaCards.innerHTML = "";
      mensagem.classList.add("erro");
      // TypeError = o fetch nem chegou na API (sem internet, por exemplo)
      mensagem.textContent = erro instanceof TypeError
        ? "Não consegui falar com a API. Confira sua internet e tente de novo."
        : erro.message;
      totalPaginas = 1;
      pagina = 1;
      atualizarBotoes();
    });
}


/**
 * Mostra "cards fantasma" enquanto a API ainda não respondeu.
 * Assim a tela não fica vazia e o usuário vê que algo está carregando.
 */
function mostrarEsqueleto() {
  areaCards.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const fantasma = document.createElement("div");
    fantasma.className = "card esqueleto";
    areaCards.appendChild(fantasma);
  }
}


/**
 * Cria o card de UM personagem usando document.createElement.
 * Nenhum HTML do card existe no arquivo .html: tudo nasce aqui.
 *
 * @param {Object} p - personagem como a API devolve (id, name, image, status, species...)
 * @param {number} indice - posição do card na lista (usada no atraso da animação de entrada)
 * @returns {HTMLElement} o <article> pronto, ainda fora da página (quem insere é mostrarCards)
 */
function criarCard(p, indice) {
  const card = document.createElement("article");
  // a classe alive/dead/unknown muda a cor do anel da foto no CSS
  card.className = "card " + p.status.toLowerCase();
  card.style.setProperty("--i", indice);

  // faixa de cima: número do personagem + coração
  const topo = document.createElement("div");
  topo.className = "topo-card";

  const codigo = document.createElement("span");
  codigo.className = "codigo";
  codigo.textContent = "ID " + p.id;

  const coracao = document.createElement("button");
  coracao.className = "coracao";
  coracao.type = "button";
  coracao.title = "Favoritar";
  coracao.setAttribute("aria-label", "Favoritar " + p.name);
  coracao.textContent = favoritos.includes(p.id) ? "♥" : "♡";
  coracao.addEventListener("click", function () {
    favoritar(p.id, coracao);
  });

  topo.appendChild(codigo);
  topo.appendChild(coracao);

  // foto com a etiqueta de status por cima
  const foto = document.createElement("div");
  foto.className = "foto";

  const img = document.createElement("img");
  img.src = p.image;
  img.alt = "Imagem de " + p.name;
  img.loading = "lazy";

  const selo = document.createElement("span");
  selo.className = "selo";
  selo.textContent = statusPt[p.status] || p.status;

  foto.appendChild(img);
  foto.appendChild(selo);

  // nome
  const nome = document.createElement("h2");
  nome.textContent = p.name;

  // espécie e gênero
  const chips = document.createElement("div");
  chips.className = "chips";
  const especie = document.createElement("span");
  especie.textContent = p.species;
  const genero = document.createElement("span");
  genero.textContent = generoPt[p.gender] || p.gender;
  chips.appendChild(especie);
  chips.appendChild(genero);

  // origem e última localização
  const info = document.createElement("div");
  info.className = "info";
  info.appendChild(criarLinha("Origem", p.origin.name));
  info.appendChild(criarLinha("Visto pela última vez em", p.location.name));

  // episódios: texto + barra proporcional
  const qtdEpisodios = p.episode.length;
  const episodios = document.createElement("div");
  episodios.className = "episodios";

  const textoEp = document.createElement("p");
  textoEp.textContent = qtdEpisodios === 1 ? "Aparece em 1 episódio" : "Aparece em " + qtdEpisodios + " episódios";

  const trilho = document.createElement("div");
  trilho.className = "trilho";
  const preenchimento = document.createElement("div");
  preenchimento.className = "preenchimento";
  // regra de três: 51 episódios = 100% (Math.min garante que nunca passa disso)
  preenchimento.style.width = Math.min((qtdEpisodios / totalEpisodiosApi) * 100, 100) + "%";
  trilho.appendChild(preenchimento);

  episodios.appendChild(textoEp);
  episodios.appendChild(trilho);

  // junta tudo dentro do card
  card.appendChild(topo);
  card.appendChild(foto);
  card.appendChild(nome);
  card.appendChild(chips);
  card.appendChild(info);
  card.appendChild(episodios);

  return card;
}

/**
 * Cria uma linha de informação do card, com o título pequeno em cima do valor.
 *
 * @param {string} titulo - rótulo (ex.: "Origem")
 * @param {string|number} valor - valor vindo da API
 * @returns {HTMLElement} um <p> com o texto
 */
function criarLinha(titulo, valor) {
  const linha = document.createElement("p");
  const rotulo = document.createElement("strong");
  rotulo.textContent = titulo;
  linha.appendChild(rotulo);
  linha.appendChild(document.createTextNode(valor));
  return linha;
}

/**
 * Limpa a área de cards e desenha um card para cada personagem da lista.
 * O appendChild é o que realmente coloca o card dentro da página (DOM).
 *
 * @param {Object[]} lista - personagens vindos da API
 */
function mostrarCards(lista) {
  areaCards.innerHTML = "";
  lista.forEach(function (p, indice) {
    areaCards.appendChild(criarCard(p, indice));
  });
}


/**
 * Adiciona ou remove um personagem dos favoritos.
 * Guarda só o id no localStorage, então os favoritos continuam depois de fechar o site.
 *
 * @param {number} id - id do personagem
 * @param {HTMLElement} botao - botão do coração que foi clicado (para trocar ♡ por ♥)
 */
function favoritar(id, botao) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(function (f) { return f !== id; });
    botao.textContent = "♡";
  } else {
    favoritos.push(id);
    botao.textContent = "♥";
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  spanQtdFav.textContent = favoritos.length;

  // se estiver na tela de favoritos, atualiza a lista na hora
  if (vendoFavoritos) {
    mostrarFavoritos();
  }
}

/**
 * Mostra só os personagens favoritados.
 * A API aceita vários ids de uma vez (/character/1,2,3), então basta UM fetch.
 * Cuidado: com apenas 1 id a API devolve um objeto e não uma lista (tratado no código).
 */
function mostrarFavoritos() {
  numeroRequisicao++; // cancela qualquer carregamento que ainda esteja rolando
  const minhaVez = numeroRequisicao;

  vendoFavoritos = true;
  btnFavoritos.classList.add("ativo");
  mensagem.classList.remove("erro");
  textoPagina.textContent = "Favoritos";
  btnAnterior.disabled = true;
  btnProxima.disabled = true;

  if (favoritos.length === 0) {
    areaCards.innerHTML = "";
    mensagem.textContent = "Você ainda não favoritou ninguém. Clique no coração de um card para salvar aqui.";
    return;
  }

  mensagem.textContent = "Carregando favoritos...";
  mostrarEsqueleto();

  fetch(urlApi + "/" + favoritos.join(","))
    .then(function (resposta) { return resposta.json(); })
    .then(function (dados) {
      if (minhaVez !== numeroRequisicao) { return; }

      const lista = Array.isArray(dados) ? dados : [dados];
      mensagem.textContent = lista.length + " favorito(s)";
      mostrarCards(lista);
    })
    .catch(function () {
      if (minhaVez !== numeroRequisicao) { return; }
      areaCards.innerHTML = "";
      mensagem.classList.add("erro");
      mensagem.textContent = "Não consegui carregar os favoritos. Tente de novo.";
    });
}


/**
 * Atualiza o texto "Página X de Y" e liga/desliga os botões Anterior e Próxima
 * (Anterior fica desligado na página 1 e Próxima na última).
 */
function atualizarBotoes() {
  textoPagina.textContent = "Página " + pagina + " de " + totalPaginas;
  btnAnterior.disabled = pagina <= 1;
  btnProxima.disabled = pagina >= totalPaginas;
}


/* ---------- EVENTOS ----------
 * Daqui pra baixo ficam os "ouvintes" que ligam o que o usuário faz na tela ao código.
 */

// botão "Anterior": volta uma página, busca de novo e sobe a tela
btnAnterior.addEventListener("click", function () {
  pagina--;
  buscarPersonagens();
  galeria.scrollIntoView({ behavior: "smooth" });
});

// botão "Próxima": avança uma página, busca de novo e sobe a tela
btnProxima.addEventListener("click", function () {
  pagina++;
  buscarPersonagens();
  galeria.scrollIntoView({ behavior: "smooth" });
});

// Portal: sorteia uma página qualquer entre 1 e o total de páginas
btnPortal.addEventListener("click", function () {
  // Math.random() dá um número entre 0 e 1; multiplico pelo total e arredondo pra cima
  pagina = Math.ceil(Math.random() * totalPaginas);
  buscarPersonagens();
  galeria.scrollIntoView({ behavior: "smooth" });
});

// Debounce: cada letra digitada reinicia um cronômetro. A busca só acontece
// se o usuário ficar 0,4s sem digitar, evitando uma requisição por letra.
let espera;
inputBusca.addEventListener("input", function () {
  clearTimeout(espera);
  espera = setTimeout(function () {
    pagina = 1;
    buscarPersonagens();
  }, 400);
});

// troca de status: volta pra página 1 e busca de novo na API
selectStatus.addEventListener("change", function () {
  pagina = 1;
  buscarPersonagens();
});

// botão de favoritos: alterna entre a lista normal e só os favoritos
btnFavoritos.addEventListener("click", function () {
  if (vendoFavoritos) {
    buscarPersonagens();
  } else {
    mostrarFavoritos();
  }
});

/* ---------- INÍCIO ----------
 * Quando a página abre: mostra o contador de favoritos e já carrega a primeira página.
 */
spanQtdFav.textContent = favoritos.length;
buscarPersonagens();
