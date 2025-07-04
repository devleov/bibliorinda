/* Remove acentos e caracteres especiais */
function removeCaracter(word) {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

async function loadList() {
    /* Variável de controle de texto */
    let text = "";

    /* Requisição para obter todos os livros da API Bibliorinda */
    const arrayBook = await getCacheAllBooks();

    /* Carregamento padrão da lista */
    arrayBook.slice(0, 10).forEach((element, index) => {
        text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.title}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>
            </tr>
         `;

        $("#list-books").html(text);
    });
}