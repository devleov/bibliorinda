/* Requisição GET para pegar a lista de livros da API Bibliorinda */
async function getAllBooks() {
    const url = "http://localhost:8081/findAllBooks"; /* URL da rota `findAllBooks` */
    const resp = await fetch(url); /* Obtendo a resposta */
    const { data, idNextBook } = await resp.json(); /* Convertendo o corpo para JSON */

    /* Se o banco estiver vazio não dá para saber qual vai ser o próximo índice só depois que adicionar um livro, como eu poderia saber o próximo índice do banco sem ter existência de registros na tabela? */

    /* Índice do próximo item do banco de dados */
    idCacheBooks = idNextBook;
    
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