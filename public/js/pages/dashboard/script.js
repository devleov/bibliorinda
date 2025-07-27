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
        <span class="fs-5 fw-bold">Carregando lista...</span>
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

$("#btn-save-book").prop("disabled", true);

/* ➕ Função: Adicionar livro */
async function addBook() {
    /* Remover atributo do botão de adicionar livro */
    $("#btn-save-book").removeAttr("data-bs-dismiss");

    /* Obtenção dos dados do modal de adicionar livro */
    const { shelf, title, category, author } = getDataFormAddBook();

    if (!title || !author || !category) return;

    /* Requisição API Bibliorinda para adicionar um livro */
    url = "https://api-bibliorinda.onrender.com/createBook";
    resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title, author, category, shelf }),
        headers: { "Content-type": "application/json" },
    });

    data = await resp.json();

    if (!resp.ok) {
        if (data.message.includes("mesmo título")) {
            return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
        }

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
    $("#btn-save-book").prop("disabled", true);

    addBook();
});

/* 📅 -> ➕ Evento: Abertura de modal de adicionamento de livro */
$("#modal-add").on("shown.bs.modal", () => {
    $("#input-shelf").removeClass("is-invalid");
    $("#input-shelf").addClass("is-valid");
});

/* 📅 -> ➕ Evento: Alteração nos inputs do modal de adicionamento de livro */
$("#modal-add input").each((_, el) => {
    $(el).on("change", function () {
        const { shelf, title, category, author } = getDataFormAddBook();

        if (el.id === "input-shelf") {
            $("#input-shelf").addClass("is-valid");
            $("#input-shelf").removeClass("is-invalid");
        } else {
            /* Condição: Se o campo NÃO estiver vazio */
            if ($(el).val().trim() !== "") {
                $(el).addClass("is-valid")
                $(el).removeClass("is-invalid")
            } else {
                /* Condição: Se o campo ESTIVER vazio */
                $(el).addClass("is-invalid")
                $(el).removeClass("is-valid")
            }
        }

        /* Fazer verificação se o `shelf` tem número na segunda caracter, se tiver passar, se não tiver avisar a estrutura correta */
        if (!isNaN(shelf.charAt(0)) && shelf.length > 0 || isNaN(shelf.charAt(1)) && shelf.length > 0) {
            $(".shelf-invalid-feedback").text("A estrutura prateleira correta ex: A1");
            $("#input-shelf").addClass("is-invalid")
            $("#input-shelf").removeClass("is-valid")
        }

        /* Condição: Se todos os campos foram preenchidos uma vez, mas depois foram apagados, voltar para o estado inicial do botão */
        if ($("#btn-save-book").attr("data-bs-dismiss")) {
            $("#btn-save-book").prop("disabled", true);
            return $("#btn-save-book").removeAttr("data-bs-dismiss");
        }

        /* Condição: Se todos os campos obrigatórios terem conteúdo permitir o uso do botão com o efeito de fechamento dos modais */
        if (title && author && category) {
            $("#btn-save-book").prop("disabled", false)
            $("#btn-save-book").attr("data-bs-dismiss", "modal");
        }
    });
})

/* 📅 -> ➕ Evento: Tecla Enter pressionada no modal de adicionamento de livro */
$("#modal-add").on("keypress", (e) => {
    /* Para dar certo a execução precisa ser a tecla Enter e o botão de salvar e apagar precisa estar desativado */
    if (e.keyCode == 13 && !$("#btn-save-book").prop("disabled")) {
        $("#btn-save-book").prop("disabled", true);

        const modal_add = bootstrap.Modal.getInstance($("#modal-add"));
        const { title, category, author } = getDataFormAddBook();

        /* Verificar quais campos estão vazios e adicionar inválido neles */

        /* Filtragem por elementos que possuem conteúdo vazio */
        const inputsEmpty = $("#modal-add input").filter((index, element) => { return element.value.trim() == ""; });

        /* Itera sobre os campos vazios */
        inputsEmpty.each((index, element) => {
            $(element).addClass("is-invalid")
            $(element).removeClass("is-valid")
        })

        /* Fechar modal de adicionamento de livros se tiver todos os campos preenchidos */
        if (title && author && category) {
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
        $("#warn-remove").html('<p class="mb-0 fw-bold fs-4">Não há livros por aqui..</p>')
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
                    <button data-ba-id="${element.id}" class="btn-remove-item btn btn-outline-secondary p-2"><i class="fa-solid fa-xmark"></i></button>
                </td>
            </tr>
        `;
    });

    $("#list-remove").html(text);

});

/* 📅 -> ➖ Evento: Adição de livro para remoção pelo atributo `data-ba-id` */
$("#modal-remove").on("click", ".btn-remove-item", function () {

    /* Obtenção do id do elemento correspondente do botão de excluir */
    const idElement = $(this).attr("data-ba-id");

    /* Se o id já incluir dentro do `booksInTrash` então ignorar */
    if (booksInTrash.includes(idElement)) return;

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
    $("#btn-trash-books").prop("disabled", true);

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

/* 📝 Variáveis de controle dos dados preenchidos */
let valueBook = {
    "input-id-edit": "",
    "input-shelf-edit": "",
    "input-title-edit": "",
    "input-category-edit": "",
    "input-author-edit": "",
};

$("#btn-save-edit").prop("disabled", true);

/* 📅 -> 📝 Evento: Clique para abrir modal de edição de livros */
$("#btn-edit-book").on("click", () => {
    $("#warn-edit").hide();
});

/* 📅 -> 📝 Evento: Alteração no campo de colocar o ID */
$("#input-edit").on("input", function () {
    if ($(this).val()) return $("#btn-search-edit").prop("disabled", false);

    $("#btn-search-edit").prop("disabled", true);
})

/* 📅 -> 📝 Evento: Clique para o botão de pesquisar ID para edição */
$("#btn-search-edit").on("click", () => {
    $("#warn-edit").hide();

    $("#input-id-edit, #input-shelf-edit, #input-title-edit, #input-category-edit, #input-author-edit").val("");

    const $id = $("#input-edit").val();
    if (!$id) return;

    const data = cacheBooks.find((el) => el.id == $id);

    if (data) {
        /* Criando objeto com os dados preenchidos do livro correspondente antes da edição */
        const valueFilled = {
            "id": data.id,
            "shelf": data.shelf,
            "title": data.title,
            "category": data.category,
            "author": data.author
        };

        /* Quando for preencher os valores nos campos, atribuir também os valores as variáveis correspondentes */
        for (const nameInput in valueFilled) {
            $(`#input-${nameInput}-edit`).val(valueFilled[nameInput]);
            valueBook[`input-${nameInput}-edit`] = valueFilled[nameInput];
        };

        /* Permitir alteração nos campos */
        $("#input-shelf-edit, #input-title-edit, #input-category-edit, #input-author-edit").prop("readonly", false)

        return;
    }

    $("#warn-edit").show();
});

/* 📅 -> 📝 Evento: Desfoque nos inputs de edição de campo */
$("#inputs-edit input").on("blur", () => {
    /* Controlador de conteúdo nos inputs de edição */
    let hasChange = false;

    /* Percorrendo os inputs que foram alterados e os preenchidos */
    $("#inputs-edit input").each((_, currentValue) => {
        if (hasChange) return;

        if (currentValue.id === "input-shelf-edit") {
            if (!isNaN($(currentValue).val().charAt(0)) && $(currentValue).val().length > 0 || isNaN($(currentValue).val().charAt(1)) && $(currentValue).val().length > 0 || $(currentValue).val().length > 0 && $(currentValue).val().length < 2) {
                $(".shelf-edit-invalid-feedback").text("A estrutura prateleira correta ex: A1");
                $("#input-shelf-edit").addClass("is-invalid")
                $("#input-shelf-edit").removeClass("is-valid")

                return;
            }

            $(".shelf-edit-invalid-feedback").text("");
            $("#input-shelf-edit").removeClass("is-invalid")
        }

        /* Se o valor atual não é igual ao valor preenchido */
        if ($(currentValue).val().toLowerCase() != new String(valueBook[currentValue.id]).toLowerCase()) {
            /* Há alteração nos inputs */
            return hasChange = true;
        }

        hasChange = false;
    });

    if (hasChange) {
        $("#btn-save-edit").attr("data-bs-dismiss", "modal");
        return $("#btn-save-edit").prop("disabled", false);
    }

    $("#btn-save-edit").removeAttr("data-bs-dismiss");
    $("#btn-save-edit").prop("disabled", true);
});

/* 📅 -> 📝 Evento: Salvar as alterações da edição */
$("#btn-save-edit").on("click", async () => {
    $("#btn-save-edit").prop("disabled", true);
    $("#btn-save-edit").removeAttr("data-bs-dismiss");

    const modal_edit = bootstrap.Modal.getInstance($("#modal-edit"));

    const output_id = $("#input-id-edit").val();
    const output_shelf = $("#input-shelf-edit").val();
    const output_title = $("#input-title-edit").val();
    const output_category = $("#input-category-edit").val();
    const output_author = $("#input-author-edit").val();

    /* Requisição API Bibliorinda para editar livros */
    url = "https://api-bibliorinda.onrender.com/updateBook";
    resp = await fetch(url, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id: output_id, shelf: output_shelf, title: output_title, category: output_category, author: output_author }),
    });
    data = await resp.json();

    if (!resp.ok) {
        $("#input-edit").val("");
        $("#inputs-edit input").each((index, element) => {
            $(element).val("");
        });

        modal_edit.hide();
        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    warnsToRequests(data, "success", "fa-solid fa-check-circle me-2");

    /* Atualizando no cache */
    const id = cacheBooks.findIndex((el) => el.id === valueBook["input-id-edit"])
    cacheBooks[id].shelf = output_shelf;
    cacheBooks[id].title = output_title;
    cacheBooks[id].category = output_category;
    cacheBooks[id].author = output_author;

    $("#input-edit").val("");
    $("#inputs-edit input").each((index, element) => {
        $(element).val("");
    });

    reloadList("list-books", "warn-search");
});

$("#btn-clean-external").prop("disabled", true);

/* 📅 -> 🏦 Evento: Alteração no tipo de pesquisa de pesquisar na api externa */
$("#select-search-external").on("change", () => {
    $("#input-search-external").prop("disabled", false);
});

/* 📅 -> 🏦 Evento: Alteração no campo de pesquisa de pesquisar na api externa */
$("#input-search-external").on("change", () => {
    if (!$("#input-search-external").val()) return $("#btn-search-external").prop("disabled", true);

    $("#btn-search-external").prop("disabled", false);
});

/* Evento: Clique no botão de pesquisar livro na api externa */
$("#btn-search-external").on("click", async () => {
    const typeSearch = $("#select-search-external").val();
    const valueSearch = $("#input-search-external").val();

    /* Requisição API OpenLibrary para os livros */
    const endpoint = new URL(`https://openlibrary.org/search.json?${typeSearch}=${valueSearch}&lang=pt&limit=10`);
    resp = await fetch(endpoint, {
        method: "GET",
        headers: { "User-Agent": "Bibliorinda/1.0 (leonarzy@gmail.com)" },
    });
    data = await resp.json();

    $("#list-external").html("");
    $("#warn-external").css("display", "none");

    $("#btn-clean-external").prop("disabled", false);

    const dataFiltred = await data.docs.filter((book) => book.language && book.language.includes("por")).slice(0, 10);

    if (data.docs.length === 0 || dataFiltred.length === 0) {
        return $("#warn-external").css("display", "block");
    }

    const valueData = [];

    for (let i = 0; i < dataFiltred.length; i++) {
        valueData.push({
            title: dataFiltred[i].title,
            author: dataFiltred[i].author_name > 1 ? dataFiltred[i].author_name.join(" e ") : dataFiltred[i].author_name[0],
        });
    };

    let text = "";

    $(valueData).each((_, el) => {
        text += `
            <tr>
                <td class="w-50">${el.title}</td>
                <td>${el.author}</td>
                <td><button class="btn-add-external btn btn-outline-secondary p-2"><i class="fa-solid fa-plus"></i></button></td>
            </tr>
        `;
    })

    $("#list-external").html(text)
});

$("#modal-external").on("click", ".btn-add-external", function () {
    const ancestral = this.closest("tr");
    const childrens = ancestral.children;

    const modal_external = bootstrap.Modal.getInstance($("#modal-external"));
    modal_external.hide();

    const title = $(childrens[0]).text();
    const author = $(childrens[1]).text();

    const modal_add = new bootstrap.Modal($("#modal-add")) || bootstrap.Modal.getInstance($("#modal-add"));
    modal_add.show();

    $("#input-name").val(title);
    $("#input-author").val(author);

    $("#input-name").removeClass("is-invalid");
    $("#input-name").addClass("is-valid");
    $("#input-author").removeClass("is-invalid");
    $("#input-author").addClass("is-valid");
});

$("#btn-clean-external").on("click", () => {
    $("#input-search-external").val("");
    $("#select-search-external").val("");
    $("#btn-clean-external").prop("disabled", true);
    $("#btn-search-external").prop("disabled", true);
    $("#list-external").html("");
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