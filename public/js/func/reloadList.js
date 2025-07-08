async function reloadList(box, warn) {
    let text = "";

    /* Limpando a caixa da lista de livros, para ser preenchida com o cache dos livros */
    $(`#${box}`).text("")

    /* Limpar os avisos da tela */
    $(`#${warn}`).html("")
    $(`#${warn}`).css("display", "none")
    
    if (box == "list-remove") {
        cacheBooks.forEach((element, index) => {
            text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.title}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>
                
                <td>
                    <button data-ba-id="${element.id}" class="btn-remove-item btn btn-danger">Remover</button>
                </td>
            </tr>
        `;
        })

    } else {
        
        cacheBooks.forEach((element, index) => {
            text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.title}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>
            </tr>
        `;
        })
    }

    $(`#${box}`).html(text);
}