/* Remove acentos e caracteres especiais */
function removeCaracter(word) {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

async function loadList(warn) {
    /* Variável de controle de texto */
    let text = "";

    /* Requisição para obter todos os livros da API Bibliorinda e mandar para o cache */
    const arrayBook = await getCacheAllBooks();

    if (arrayBook.length == 0) {
        $(`#${warn}`).html('<i class="fa-solid fa-magnifying-glass-plus fs-5 me-2"></i> <p class="mb-0 fw-bold fs-4 text-dark d-inline">Não há livros por aqui..</p>')
        $(`#${warn}`).css("display", "block");

        return;
    }

    $(`#${warn}`).text("")
    $(`#${warn}`).css("display", "none")

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