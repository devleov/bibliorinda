/* 🧮 Variáveis globais do sistema */

let cacheBooks = [];
let intervalWarns = {};
let timeIntervalWarns = 5000;
let booksInTrash = [];
let url = "";
let resp = {};
let data = {};

/* 📌 Estado inicial da interface */

$("#btn-add-book, #btn-remove-book, #btn-reload-list, #btn-edit-book")
    .prop("disabled", true);

$("#input-search")
    .prop("readonly", true);

$("#warn-search").show();
$("#warn-search").html(`
    <div class="p-2 d-flex align-items-center">
        <div class="spinner-border me-2" role="status"></div>
        <span class="text-dark fs-5 fw-bold">Carregando lista...</span>
    </div>
`);

/* 🎯 Função: Utilitárias e de formatação */
function capitalize(string) {
    return string.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
};

/* 📦 Função: Manipulação de dados */
function getDataFormAddBook() {
    const $nameBook = $("#input-name");
    const $authorBook = $("#input-author");
    const $categoryBook = $("#input-category");
    const $shelfBook = $("#input-shelf");

    /* Garante que preencha no front-end até dois caracteres no campo */
    $shelfBook.val($shelfBook.val().slice(0, 2));

    return {
        shelf: $shelfBook.val().trim().charAt(0).toUpperCase() + $shelfBook.val().slice(1),
        title: capitalize($nameBook.val().trim()),
        category: capitalize($categoryBook.val().trim()),
        author: capitalize($authorBook.val().trim()),
    };
};

/* 🔔 Função: Exibição de avisos */
function warnsToRequests(dataRequest, typeWarn, iconClassWarn) {
    $(".text-alert").html(`<i class="${iconClassWarn}"></i> ${dataRequest.message}`)
    $(".alert").addClass(`alert-${typeWarn} show`)

    if (intervalWarns) clearTimeout(intervalWarns);

    intervalWarns = setTimeout(() => {
        $(".text-alert").html("");
        $(".alert").removeClass(`alert-${typeWarn} show`);
    }, timeIntervalWarns);
};

/* 🔄 Função: Carrega lista dos livros */
(async () => {
    await loadList("warn-search");

    $("#btn-add-book, #btn-remove-book, #btn-reload-list, #btn-edit-book")
        .prop("disabled", false);

    $("#input-search").prop("readonly", false);

    /* Exceto se tiver conteúdo no cacheBooks isso pode funcionar, pois se não vai sobrescrever o aviso que virá de `loadList` e não iria aparecer pois ia executar isso */
    if (!cacheBooks.length == 0) {
        /* Remoção dos avisos de carregamento */
        $("#warn-search").hide();
        $("#warn-search").html("");
    }
})();

/* 📅 Evento: Alteração nos campos de pesquisa principal e no campo do modal de remoção de livros */
$("#input-search").on("change", () => { searchBook("list-books", "input-search", "warn-search") });
$("#input-remove").on("change", () => { searchBook("list-remove", "input-remove", "warn-remove") });

/* ➕ Função: Adicionar livro */
async function addBook() {
    /* Remover atributo do botão de adicionar livro */
    $("#btn-save-book").removeAttr("data-bs-dismiss")

    /* Obtenção dos dados do modal de adicionar livro */
    const { shelf, title, category, author } = getDataFormAddBook();

    /* Filtragem por elementos que possuem conteúdo vazio */
    const inputsEmpty = $("#modal-add input").filter((_, el) => { return el.value.trim() == ""; });

    /* Itera sobre os campos vazios */
    inputsEmpty.each((_, el) => {
        $(el).addClass("is-invalid")
        $(el).removeClass("is-valid")
    })

    if (!shelf || !title || !author || !category) return;

    /* Requisição API Bibliorinda para adicionar um livro */
    url = "https://api-bibliorinda.onrender.com/createBook";
    resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title, author, category, shelf }),
        headers: { "Content-type": "application/json" },
    });

    data = await resp.json();

    if (!resp.ok) {
        /* Remoção: Limpeza do conteúdo dos campos de adicionamento de livro */
        $("#modal-add input").each((_, el) => {
            $(el).removeClass("is-valid");
            $(el).val("");
        });

        /* Aviso: Não foi possível adicionar o livro */
        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    /* ID atual deste livro a ser adicionado */
    const idCurrentBook = await data.idCurrentBook;

    cacheBooks.push({ id: idCurrentBook, shelf, title, category, author });

    warnsToRequests(data, "success", "fa-solid fa-check-circle me-2");

    reloadList("list-books", "warn-search");

    $("#modal-add input").each((index, element) => {
        $(element).removeClass("is-valid");
        $(element).val("");
    });
};

/* 📅 -> ➕ Evento: Adicionar um livro na lista de livros */
$("#btn-save-book").on("click", async () => {
    addBook();
});

/* 📅 -> ➕ Evento: Alteração nos inputs do modal de adicionamento de livro */
$("#modal-add input").each((_, el) => {
    $(el).on("change", function () {
        const { shelf, title, category, author } = getDataFormAddBook();

        /* Condição: Se o campo NÃO estiver vazio */
        if ($(el).val().trim() !== "") {
            $(el).addClass("is-valid")
            $(el).removeClass("is-invalid")
        } else {
            /* Condição: Se o campo ESTIVER vazio */
            $(el).addClass("is-invalid")
            $(el).removeClass("is-valid")
        }

        /* Fazer verificação se o `shelf` tem número na segunda caracter, se tiver passar, se não tiver avisar a estrutura correta */
        if (isNaN(shelf.charAt(1)) || shelf.length < 2 || shelf.length > 2) {
            $(".shelf-invalid-feedback").text("A estrutura prateleira correta ex: A1");
            $("#input-shelf").addClass("is-invalid")
            $("#input-shelf").removeClass("is-valid")
        } 

        /* Condição: Se todos os campos foram preenchidos uma vez, mas depois foram apagados, voltar para o estado inicial do botão */
        if ($("#btn-save-book").attr("data-bs-dismiss")) {
            return $("#btn-save-book").removeAttr("data-bs-dismiss");
        }

        /* Condição: Se todos os campos obrigatórios terem conteúdo permitir o uso do botão com o efeito de fechamento dos modais */
        if (shelf && title && author && category) {
            $("#btn-save-book").attr("data-bs-dismiss", "modal");
        }
    });
})

/* 📅 -> ➕ Evento: Tecla Enter pressionada no modal de adicionamento de livro */
$("#modal-add").on("keypress", (e) => {
    if (e.keyCode == 13) {
        const modal_add = bootstrap.Modal.getInstance($("#modal-add"));
        const { shelf, title, category, author } = getDataFormAddBook();

        /* Verificar quais campos estão vazios e adicionar inválido neles */

        /* Filtragem por elementos que possuem conteúdo vazio */
        const inputsEmpty = $("#modal-add input").filter((index, element) => { return element.value.trim() == ""; });

        /* Itera sobre os campos vazios */
        inputsEmpty.each((index, element) => {
            $(element).addClass("is-invalid")
            $(element).removeClass("is-valid")
        })

        /* Fechar modal de adicionamento de livros se tiver todos os campos preenchidos */
        if (shelf && title && author && category) {
            addBook();

            /* Simula o fechamento do modal */
            modal_add.hide();
        }
    }
});

/* 📅 -> ➖ Evento: Abrir o modal de remover livro */
$("#btn-remove-book").on("click", () => {
    /* Desabilita por padrão o botão de jogar no lixo e limpar os livros */
    $("#btn-trash-books").prop("disabled", true);
    $("#btn-clean-books").prop("disabled", true);

    let text = "";

    /* Limpar os avisos da tela */
    $("#warn-remove").html("")
    $("#warn-remove").css("display", "none")

    if (cacheBooks.length === 0) {
        $("#warn-remove").html('<i class="fa-solid fa-magnifying-glass-plus fs-5 me-2"></i> <p class="mb-0 fw-bold fs-4 text-dark d-inline">Não há livros por aqui..</p>')
        $("#warn-remove").css("display", "block");

        return;
    }

    cacheBooks.slice(0, 10).forEach((element, index) => {
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

    /* 📅 -> ➖ Evento: Remoção de livro pelo atributo `data-ba-id` */
    $("#modal-remove").on("click", ".btn-remove-item", function () {

        /* Obtenção do id do elemento correspondente do botão de excluir */
        const idElement = $(this).prop("data-ba-id");

        booksInTrash.push(idElement);

        /* Remove a desabilitação dos botões de lixo e limpeza */
        $("#btn-trash-books").prop("disabled", false);
        $("#btn-clean-books").prop("disabled", false);

        /* Construindo a estrutura vísivel dos itens que serão apagados */
        let text = "<p class='fs-5 fw-bold'>Lista de possíveis deletados</p>";

        booksInTrash.forEach((bookTrash) => {
            const data = cacheBooks.find((el) => { return el.id == bookTrash });
            text += `Id: ${bookTrash} Título: ${data.title}<br>`;
        });

        $("#view-trash-book").html(text);
    });

    /* 📅 -> ➖ Evento: Apagar os livros que estão na lista de lixo */
    $("#btn-trash-books").on("click", async () => {
        /* Obtenção da instância do modal de remoção de livros */
        const modal_remove = bootstrap.Modal.getInstance($("#modal-remove"));

        /* Requisição API Bibliorinda para remover livros */
        url = "https://api-bibliorinda.onrender.com/deleteBook";
        resp = await fetch(url, {
            method: "DELETE",
            body: JSON.stringify({ booksInTrash }),
            headers: { "Content-type": "application/json" },
        });

        data = await resp.json();

        if (!resp.ok || data.message.includes("problema")) {
            /* 1° Condição - Aviso: Não foi possível remover os livros */
            /* 2° Condição - Aviso: Conflito de IDs de cache com o banco de dados */

            /* Esconde o modal */
            modal_remove.hide();

            return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
        }

        booksInTrash.forEach((bookIds) => {
            const idArray = cacheBooks.findIndex((el) => el.id == bookIds)
            cacheBooks.splice(idArray, 1);
        });

        warnsToRequests(data, "success", "fa-solid fa-check-circle me-2")

        $("#btn-trash-books").prop("disabled", true);
        $("#btn-clean-books").prop("disabled", true);

        booksInTrash = [];
        $("#view-trash-book").html("");
        modal_remove.hide();

        /* Atualiza a lista do modal de remoção e a lista principal dos livros */
        reloadList("list-remove", "warn-remove");
        reloadList("list-books", "warn-search");
    });

    /* 📅 -> ➖ Evento: Limpa a lista de lixo dos livros que iriam ser apagados */
    $("#btn-clean-books").on("click", () => {
        booksInTrash = [];

        /* Desativa o botão de apagar a lista de lixo dos livros, pois já foi clicado e apagado */
        $("#btn-clean-books").attr("disabled", "disabled");

        /* Limpa o conteúdo da visualização dos livros que iriam ser apagados */
        $("#view-trash-book").html("");
    });
});

/* 📅 -> 📝 Evento: Clique para abrir modal de edição de livros */
$("#btn-edit-book").on("click", () => {
    $("#warn-edit").hide();
    $("#btn-save-edit").prop("disabled", true);

    /* 📅 -> 📝 Evento: Clique para o botão de pesquisar ID para edição */
    $("#btn-search-edit").on("click", () => {
        $("#warn-edit").hide();

        $("#input-id-edit, #input-shelf-edit, #input-title-edit, #input-category-edit, #input-author-edit").val("");

        const $id = $("#input-edit").val();
        if (!$id) return;

        const data = cacheBooks.find((el) => el.id == $id);

        if (data) {
            const inputs = {
                "id": data.id,
                "shelf": data.shelf,
                "title": data.title,
                "category": data.category,
                "author": data.author
            };

            for (const input in inputs) {
                $(`#input-${input}-edit`).val(inputs[input]);
            };

            /* Permitir alteração nos campos */
            $("#input-shelf-edit, #input-title-edit, #input-category-edit, #input-author-edit").prop("readonly", false)

            return;
        }

        $("#warn-edit").show();
    });
});

/* 📅 -> ⛔ Evento: Botão de remover tudo da tabela de livros */
$("#btn-truncate-list").on("click", async () => {
    url = "https://api-bibliorinda.onrender.com/truncateBook"
    resp = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify({ password: 9214891 }),
        headers: { "Content-type": "application/json" },
    });

    data = await resp.json();

    if (!resp.ok) {
        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    warnsToRequests(data, "success", "fa-solid fa-check-circle me-2");

    /* Limpa os livros no cache */
    cacheBooks = [];

    reloadList("list-books");
});

/* 📅 -> 🔃 Evento: Reatualizar a lista */
$("#btn-reload-list").on("click", () => {
    reloadList("list-books", "warn-search")
});