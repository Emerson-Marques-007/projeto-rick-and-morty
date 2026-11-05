# Rick and Morty - Galeria de Personagens

Site feito para o trabalho da disciplina **Web Development Front-End** do curso de **Análise e Desenvolvimento de Sistemas** (UniFECAF).

A página consome a [Rick and Morty API](https://rickandmortyapi.com/) com `fetch` e mostra os personagens em cards criados dinamicamente pelo JavaScript. Foi feito apenas com **HTML, CSS e JavaScript puros**, sem frameworks.

**Autor:** Emerson Marques Cardoso dos Santos - RA 92924

## Funcionalidades

- Cards criados 100% pelo JavaScript (`createElement` + `appendChild`); o HTML só tem um contêiner vazio
- Cada card mostra nome, imagem, status, espécie, gênero, origem, última localização e número de episódios
- Busca por nome (com *debounce* para não chamar a API a cada letra)
- Filtro por status (vivo, morto, desconhecido)
- Paginação (20 personagens por página)
- Favoritos salvos no `localStorage`, com tela só de favoritos
- Portal clicável no topo que sorteia uma página aleatória de personagens
- Cards no estilo "ficha de identificação": anel colorido na foto mostra o status e barra mostra em quantos episódios o personagem aparece
- Animação de carregamento (cards fantasma) enquanto a API responde
- Layout responsivo (funciona no celular) e respeito a quem desativa animações no sistema

## Estrutura

```
projeto-rick-and-morty/
├── index.html   estrutura da página (section dos cards vazia)
├── style.css    estilos, grid responsivo e tema
├── script.js    consumo da API e criação dos cards
└── README.md
```

## API utilizada

- Documentação: https://rickandmortyapi.com/documentation
- Endpoint: `https://rickandmortyapi.com/api/character`
- Parâmetros usados: `page`, `name` e `status`
- Não exige token nem cadastro

## Como executar

1. Baixe ou clone o repositório.
2. Abra a pasta no VS Code e use a extensão **Live Server** (botão direito no `index.html` > *Open with Live Server*).
   Ou, no terminal, dentro da pasta: `python -m http.server 8000` e acesse `http://localhost:8000`.

## Tecnologias

HTML5, CSS3 (Grid, Flexbox, variáveis CSS, animações) e JavaScript (Fetch API, Promises, manipulação do DOM, localStorage).
