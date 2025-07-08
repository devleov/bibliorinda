let cacheBooks = [];
let idCacheBooks = 0;

/* Função: Carregar a lista de livros */
loadList("warn-search");

/* Função: Atribuir ao `cacheBooks` a lista de livros */
(async () => {
    console.log("uai")
    await getAllBooks()
});

let booksInTrash = [];

/* Por padrão deixar o botão de salvar as alterações desligado */
$("#btn-trash-books").attr("disabled", "disabled");

/* Evento: Remoção de livro pelo atributo `data-ba-id` */
$("#modal-remove").on("click", ".btn-remove-item", function () {
    /* Obtenção do id do elemento correspondente do botão de excluir */
    const idElement = $(this).attr("data-ba-id");

    booksInTrash.push(idElement);

    $("#btn-trash-books").removeAttr("disabled")
});

/* Evento: Clique no botão de salvar as alterações no modal de remoção de livro */
$("#btn-trash-books").on("click", async () => {

    /* Requisição API Bibliorinda para remover livros */
    const url = "https://api-bibliorinda.onrender.com/deleteBook";
    const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ booksInTrash }),
        headers: { "Content-type": "application/json" },
    });

    const data = await resp.json();

    if (!resp.ok) {
        /* Aviso quando não foi possível remover os livros */
        $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + data.message)

        $(".alert").addClass("alert-danger show")

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            $(".text-alert").html("")
            $(".alert").removeClass("alert-danger show")
        }, 5000)

        return;
    }

    /* Caso dê problema de sincronização entre os índices do banco e do cache de livros */
    if (data.message.includes("problema")) {
        /* Aviso após remoção dos livros */
        $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + data.message)
        $(".alert").addClass("alert-danger show")

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            $(".alert").removeClass("alert-success show")
            $(".text-alert").html("")
        }, 5000)

        return;
    }

    /* Itera sobre cada ID da lista, e procura o índice do elemento na lista de livros do cache e apaga */
    booksInTrash.forEach((bookIds) => {
        const idArray = cacheBooks.findIndex((element) => element.id == bookIds)
        /* Elimina o livro da lista de livros */
        cacheBooks.splice(idArray, 1);
    });

    /* Aviso após remoção dos livros */
    $(".text-alert").html('<i class="fa-solid fa-check-circle me-2"></i>' + data.message)
    $(".alert").addClass("alert-success show")

    if (intervalWarns) clearTimeout(intervalWarns);

    intervalWarns = setTimeout(() => {
        $(".alert").removeClass("alert-success show")
        $(".text-alert").html("")
    }, 5000)

    /* Limpa os IDs dos livros que vão ser apagados */
    booksInTrash = [];

    $("#btn-trash-books").attr("disabled", "disabled");

    reloadList("list-remove");
})

/* Evento: Alteração no campo de pesquisa principal */
$("#input-search").on("change", () => {
    searchBook("list-books", "input-search", "warn-search")
});

/* Evento: Clique no botão de abrir o modal de remover livro */
$("#btn-remove-book").on("click", () => {
    let text = "";

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
    });

    $("#list-remove").html(text);
});

/* Evento: Alteração no modal de remoção de livros */
$("#input-remove").on("change", () => {
    searchBook("list-remove", "input-remove", "warn-remove")
});

/* Evento: Reatualizar a lista */
$("#btn-reload-list").on("click", () => {
    reloadList("list-books", "warn-remove")
});

function capitalize(string) {
    return string
        .toLowerCase() // Deixa tudo em mínusculo
        .split(" ") // Transforma em array com cada palavra separada
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Procura as primeiras letras e deixa maíuscula
        .join(" ") // Junta tudo e deixa em uma única palavra
};

/* Função: Obtenção dos dados do modal de adicionar livro */
function getDataFormAddBook() {
    const $nameBook = $("#input-name");
    const $authorBook = $("#input-author");
    const $categoryBook = $("#input-category");
    const $shelfBook = $("#input-shelf");


    return {
        id: cacheBooks.length ? cacheBooks[cacheBooks.length - 1].id + 1 : 1,
        shelf: $shelfBook.val().toUpperCase().trim(),
        title: capitalize($nameBook.val().trim()),
        category: capitalize($categoryBook.val().trim()),
        author: capitalize($authorBook.val().trim()),
    };
};

/* Evento: Dispara após abrir o modal de adicionar livro */
$("#btn-add-book").on("click", () => {
    /* Obtenção do ID do novo livro */
    const { id } = getDataFormAddBook()

    /* Preenche o campo do ID com o ID do novo livro fornecido */
    $("#book-id").text(id)
})

/* Evento: Alteração nos inputs do modal de adicionamento de livro */
$("#modal-add input").each((index, element) => {
    $(element).on("change", function () {
        const { title, category, author } = getDataFormAddBook();

        /* Condição: Se o campo NÃO estiver vazio */
        if ($(this).val().trim() !== "") {
            $(this).addClass("is-valid")
            $(this).removeClass("is-invalid")
        } else {
            /* Condição: Se o campo ESTIVER vazio */
            $(this).addClass("is-invalid")
            $(this).removeClass("is-valid")
        }

        /* Condição: Se todos os campos obrigatórios terem conteúdo - adicionar atributo no botão de salvar o livro */
        if (title && author && category) {
            $("#btn-save-book").attr("data-bs-dismiss", "modal");
        }
    });
})

let intervalWarns;

/* Evento: Adicionar um livro na lista de livros */
$("#btn-save-book").on("click", async () => {
    /* Obtenção dos dados do modal de adicionar livro */
    const { id, shelf, title, category, author } = getDataFormAddBook();

    /* Filtragem por elementos que possuem conteúdo vazio */
    const inputsEmpty = $("#modal-add input").filter((index, element) => {
        return element.value.trim() == "";
    });

    /* Itera sobre os campos vazios */
    inputsEmpty.each((index, element) => {

        /* Sempre independente se o campo de prateleira estiver vazio atribuir que está tudo certo, pois ele é opcional. */
        if (element.id == "input-shelf") {
            $(element).addClass("is-valid")
            $(element).removeClass("is-invalid")

            return;
        }

        /* Os demais campos se estiver vazio atribuir que precisa preencher, pois é obrigatório. */
        $(element).addClass("is-invalid")
        $(element).removeClass("is-valid")
    })

    if (!title || !author || !category) return;

    /* Requisição API Bibliorinda para adicionar um livro */
    const url = "https://api-bibliorinda.onrender.com/createBook";
    const resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title, author, category, shelf }),
        headers: { "Content-type": "application/json" },
    });

    const data = await resp.json();

    if (!resp.ok) {
        /* Aviso quando não foi possível adicionar o livro */
        $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + data.message)

        $(".alert").addClass("alert-danger show")

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            $(".text-alert").html("")
            $(".alert").removeClass("alert-danger show")
        }, 5000)

        /* Removendo todo o conteúdo dos inputs */
        $("#modal-add input").each((index, element) => {
            $(element).removeClass("is-valid")
            $(element).val("")
        });

        return;
    }

    /* Atualizar a lista cache da lista de livros */
    cacheBooks.push({ id, title, author, category, shelf });

    /* Aviso após adicionar o livro */
    $(".text-alert").html('<i class="fa-solid fa-check-circle me-2"></i>' + data.message)
    $(".alert").addClass("alert-success show")

    if (intervalWarns) clearTimeout(intervalWarns);

    intervalWarns = setTimeout(() => {
        $(".alert").removeClass("alert-success show")
        $(".text-alert").html("")
    }, 5000)

    /* Removendo todo o conteúdo dos inputs */
    $("#modal-add input").each((index, element) => {
        $(element).removeClass("is-valid")
        $(element).val("")
    })

    /* Atualizar lista */
    reloadList("list-books", "warn-search")
});