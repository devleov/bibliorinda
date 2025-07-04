/* Requisição GET para pegar a lista de livros da API Bibliorinda */
async function getAllBooks() {
    const url = "https://api-bibliorinda.onrender.com/findAllBooks"; /* URL da rota `findAllBooks` */
    const resp = await fetch(url); /* Obtendo a resposta */
    const data = resp.json(); /* Convertendo o corpo para JSON */

    return data;
};

/* Obter a resposta da requisição e guardar em cache */
async function getCacheAllBooks() {
    if (cacheBooks.length === 0) {
        cacheBooks = await getAllBooks();
    }

    /* Retornar a resposta do cache */
    return cacheBooks;
}