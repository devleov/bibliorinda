function reloadList(box) {
    let text = "";

    if (box == "list-remove") {
        livros.forEach((element, index) => {
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

        livros.forEach((element, index) => {
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