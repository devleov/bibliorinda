/* Parâmetros:
    O elemento que vai ser preenchido (box) 
    O elemento que vai pegar o conteúdo para a filtragem (input)
    O elemento de aviso (warn)
*/

async function searchBook(box, input, warn) {
    let text = "";

    $(`#${box}`).html("");

    const search = removeCaracter($(`#${input}`).val().toLowerCase());

    const data = cacheBooks.filter((element, index) => {
        return removeCaracter(element.title.toLowerCase()).includes(search) || removeCaracter(element.author.toLowerCase()).includes(search) || removeCaracter(element.category.toLowerCase()).includes(search) || removeCaracter(element.shelf.toLowerCase()).includes(search)
    }).slice(0, 10)

    if (cacheBooks.length == 0) {
        $(`#${warn}`).html('<i class="fa-solid fa-magnifying-glass-plus fs-5 me-2"></i> <p class="mb-0 fw-bold fs-4 text-dark d-inline">Não há livros por aqui..</p>')
        $(`#${warn}`).css("display", "block");

        return;
    }

    if (cacheBooks.length > 0 && data.length == 0) {
        $(`#${warn}`).html('<i class="fa-solid fa-magnifying-glass-plus fs-5 me-2"></i> <p class="mb-0 fw-bold fs-4 text-dark d-inline">Não há livros com estas caracteríscas..</p>')
        $(`#${warn}`).css("display", "block")

        return;
    }

    $(`#${warn}`).hide();

    // Para a pesquisa do modal de remoção de livros, adicionar o botão de remover o item
    if (input == "input-remove") {
        data.forEach((element, index) => {
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
        // Se não for o modal de remoção então só preencher com os dados sem o botão de remoção

        data.forEach((element, index) => {
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