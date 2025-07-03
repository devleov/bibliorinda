// Parâmetros:
// o elemento que vai ser preenchido (box) 
// o elemento que vai pegar o conteúdo para a filtragem (input)
// o elemento de aviso (warn)

function searchBook(box, input, warn) {
    let text = "";
    $(`#${box}`).html("");

    const search = removeCaracter($(`#${input}`).val().toLowerCase());

    const data = livros.filter((element, index) => {
        return removeCaracter(element.name.toLowerCase()).includes(search) || removeCaracter(element.author.toLowerCase()).includes(search) || removeCaracter(element.category.toLowerCase()).includes(search) || removeCaracter(element.shelf.toLowerCase()).includes(search)
    }).slice(0, 10)

    if (data.length == 0) {
        $(`#${warn}`).css("display", "block")

        return;
    }

    $(`#${warn}`).css("display", "none")

    // Para a pesquisa do modal de remoção de livros, adicionar o botão de remover o item
    if (input == "search-remove") {
        data.forEach((element, index) => {
            text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.name}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>

                <td>
                    <button data-ba-id="${element.id}" class="btn-remove-item btn btn-danger">Remover</button>
                </td>
            </tr>
        `;
        })
    } else {
        // Se não for o modal de remoção então só preencher com os dados sem o botão de remoção

        data.forEach((element, index) => {
            text += `
            <tr>
                <td>${element.id}</td>
                <td>${element.shelf}</td>
                <td>${element.name}</td>
                <td>${element.category}</td>
                <td>${element.author}</td>
            </tr>
        `;
        })
    }

    $(`#${box}`).html(text);
}