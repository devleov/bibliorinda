function removeCaracter(word) {
    return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function loadList() {
    /* Variável de controle de texto */
    let text;

    /* Carregamento padrão da lista */
    livros.slice(0, 10).forEach((element, index) => {
        text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.name}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>
            </tr>
        `;

        $("#list-books").html(text);
    })
}