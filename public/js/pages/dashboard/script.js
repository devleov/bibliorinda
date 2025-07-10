/* Inicialização: Variáveis de controle do sistema de livros */
let cacheBooks = [];
let intervalWarns = {};
let timeIntervalWarns = 5000;
let booksInTrash = [];

/* Inicialização: Variáveis de requisições */
let url = "";
let resp = {};
let data = {};

/* Função: Primeiras letras das palavras em maíusculas */
function capitalize(string) {
    return string.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
};

/* Função: Obtenção dos dados do modal de adicionar livro */
function getDataFormAddBook() {
    const $nameBook = $("#input-name");
    const $authorBook = $("#input-author");
    const $categoryBook = $("#input-category");
    const $shelfBook = $("#input-shelf");

    return {
        shelf: $shelfBook.val().toUpperCase().trim(),
        title: capitalize($nameBook.val().trim()),
        category: capitalize($categoryBook.val().trim()),
        author: capitalize($authorBook.val().trim()),
    };
};

/* Função: Estrutura para avisos em requisições */
// dataRequest -> resposta da requisição 
// typeWarn -> tipo do aviso (sucesso, aviso, informação, perigo)
// iconClassWarn -> ícone em classes que vai utilizar na mensagem de aviso

function warnsToRequests(dataRequest, typeWarn, iconClassWarn) {
    /* Preenche: Adiciona o texto no aviso */
    $(".text-alert")
        .html(`<i class="${iconClassWarn}"></i> ${dataRequest.message}`)

    /* Adição de Classe: Tipo de alerta e deixar vísivel */
    $(".alert")
        .addClass(`alert-${typeWarn} show`)

    /* Condição de Interrupção: Se houver intervalo existente */
    if (intervalWarns) clearTimeout(intervalWarns);

    /* Resetação: Limpa texto do alerta, e deixa o alerta invisível, após tempo permanecido vísivel */
    intervalWarns = setTimeout(() => {
        $(".text-alert").html("");
        $(".alert").removeClass(`alert-${typeWarn} show`);
    }, timeIntervalWarns);
};

/* Função: Carregar a lista de livros */
loadList("warn-search");

/* Função: Atribuir ao `cacheBooks` a lista de livros do banco de dados */
(async () => { await getAllBooks() });

/* Evento: Alteração nos campos de pesquisa principal */
$("#input-search").on("change", () => {
    searchBook("list-books", "input-search", "warn-search")
});

/* Evento: Alteração nos campos do modal de remoção de livros */
$("#input-remove").on("change", () => {
    searchBook("list-remove", "input-remove", "warn-remove")
});

/* Evento: Reatualizar a lista */
$("#btn-reload-list").on("click", () => {
    reloadList("list-books", "warn-remove")
});

/* Padrão: Botão de salvar no modal de apagar livros como desligado */
$("#btn-trash-books").attr("disabled", "disabled");

/* Evento: Remoção de livro pelo atributo `data-ba-id` */
$("#modal-remove").on("click", ".btn-remove-item", function () {

    /* Obtenção do id do elemento correspondente do botão de excluir */
    const idElement = $(this).attr("data-ba-id");

    booksInTrash.push(idElement);

    $("#btn-trash-books").removeAttr("disabled");

});

/* Evento: Clique no botão de salvar as alterações no modal de remoção de livro */
$("#btn-trash-books").on("click", async () => {

    /* Requisição API Bibliorinda para remover livros */
    url = "https://api-bibliorinda.onrender.com/deleteBook";
    resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ booksInTrash }),
        headers: { "Content-type": "application/json" },
    });

    data = await resp.json();

    if (!resp.ok || data.message.includes("problema")) {
        /* 1° Condição - Aviso: Não foi possível remover os livros */
        /* 2° Condição - Aviso: Conflito de IDs de cache com o banco de dados */

        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    /* APAGOU COM SUCESSO OS LIVROS DO BANCO DE DADOS */

    /* Itera sobre cada ID da lista, e procura o índice do elemento na lista de livros do cache e apaga */
    booksInTrash.forEach((bookIds) => {
        const idArray = cacheBooks.findIndex((element) => element.id == bookIds)
        /* Elimina o livro da lista de livros */
        cacheBooks.splice(idArray, 1);
    });

    /* Aviso: Remoção dos livros */
    warnsToRequests(data, "success", "fa-solid fa-check-circle me-2")

    /* Limpa os IDs dos livros foram apagados */
    booksInTrash = [];

    /* Desativa o botão de apagar livros, pois não há livros para apagar */
    $("#btn-trash-books").attr("disabled", "disabled");

    /* Atualiza a lista do modal remoção de livros */
    reloadList("list-remove");
})

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


/* Evento: Adicionar um livro na lista de livros */
$("#btn-save-book").on("click", async () => {
    /* Obtenção dos dados do modal de adicionar livro */
    const { shelf, title, category, author } = getDataFormAddBook();

    /* Filtragem por elementos que possuem conteúdo vazio */
    const inputsEmpty = $("#modal-add input").filter((index, element) => { return element.value.trim() == ""; });

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
    url = "https://api-bibliorinda.onrender.com/createBook";
    resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ title, author, category, shelf }),
        headers: { "Content-type": "application/json" },
    });

    const dataAddBook = await resp.json();

    if (!resp.ok) {
        /* Remoção: Limpeza do conteúdo dos campos de adicionamento de livro */
        $("#modal-add input").each((index, element) => {
            $(element).removeClass("is-valid");
            $(element).val("");
        });

        /* Aviso: Não foi possível adicionar o livro */
        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    /* SUCESSO APÓS ADICIONAR LIVRO NO BANCO DE DADOS */

    /* Remoção: Limpeza do conteúdo dos campos de adicionamento de livro */
    $("#modal-add input").each((index, element) => {
        $(element).removeClass("is-valid");
        $(element).val("");
    });

    /* ADICIONANDO LIVRO NO FRONT END (NA MEMÓRIA) */

    /* Requisição API Bibliorinda para obter próximo ID de livro */
    url = "https://api-bibliorinda.onrender.com/getIdNextBook";
    resp = await fetch(url)
    data = await resp.json();
    id = await data.idNextBook;

    /* Atualizar a lista cache da lista de livros */
    cacheBooks.push({ id, title, author, category, shelf });

    /* Aviso: Adicionou livro com sucesso */
    warnsToRequests(dataAddBook, "success", "fa-solid fa-xmark me-2");

    /* Requisição API Bibliorinda para atualizar o próximo ID de livro */
    url = "https://api-bibliorinda.onrender.com/updateIdNextBook";
    resp = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ idsToAdd: 1 }),
        headers: { "Content-type": "application/json" }
    });
    data = await resp.json()
    console.log(resp, data)

    setTimeout(() => {
        if (!resp.ok) {
            warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
        };
        
        warnsToRequests(data, "success", "fa-solid fa-check-circle me-2");
    }, 5000)

    /* Atualizar lista no front end */
    reloadList("list-books", "warn-search")
});