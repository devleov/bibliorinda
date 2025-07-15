/* Padrão: Desativar todos os botões do gerencimento do BD */
$("#btn-add-book").attr("disabled", "disabled");
$("#btn-remove-book").attr("disabled", "disabled");
$("#btn-reload-list").attr("disabled", "disabled");
$("#btn-edit-book").attr("disabled", "disabled");

/* Padrão: Desativar o campo de pesquisa principal */
$("#input-search").attr("readonly", "readonly");

/* Adição do aviso de carregamento */
$("#warn-search").css("display", "block");
$("#warn-search").html(`
    <div class="p-2 d-flex align-items-center">
        <div class="spinner-border me-2" role="status"></div>
        <span class="text-dark fs-5 fw-bold">Carregando lista...</span>
    </div>
`);

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

/* Função: Carregar a lista de livros & Atribui ao `cacheBooks` a lista de livros do banco de dados */
(async () => {
    await loadList("warn-search");

    /* Ativação de todos os botões do gerencimento do BD após obtenção da requisição de carregamento da lista */
    $("#btn-add-book").removeAttr("disabled");
    $("#btn-remove-book").removeAttr("disabled");
    $("#btn-reload-list").removeAttr("disabled");
    $("#btn-edit-book").removeAttr("disabled");

    /* Padrão: Desativar o campo de pesquisa principal */
    $("#input-search").removeAttr("readonly");

    /* Exceto se tiver conteúdo no cacheBooks isso pode funcionar, pois se não vai sobrescrever o aviso que virá de `loadList` e não iria aparecer pois ia executar isso */
    if (!cacheBooks.length == 0) {
        /* Remoção dos avisos de carregamento */
        $("#warn-search").css("display", "none");
        $("#warn-search").html("");
    }
})();

/* Evento: Clique no botão de modal de edição de livros */

$("#btn-edit-book").on("click", () => {

    $("#btn-save-edit").attr("disabled", "disabled");

});

/* Evento: Botão de truncar a tabela Livros */
$("#btn-truncate-list").on("click", async () => {
    url = "https://api-bibliorinda.onrender.com/truncateBook/9214891"
    resp = await fetch(url, {
        method: "POST",
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
    reloadList("list-books", "warn-search")
});

/* Padrão: Botão de salvar no modal de apagar livros como desligado, e o de cancelar a remoção pois não tem conteúdo dentro ainda da lista de remoção de livros */
$("#btn-trash-books").attr("disabled", "disabled");
$("#btn-clean-books").attr("disabled", "disabled")

/* Evento: Remoção de livro pelo atributo `data-ba-id` */
$("#modal-remove").on("click", ".btn-remove-item", function () {

    /* Obtenção do id do elemento correspondente do botão de excluir */
    const idElement = $(this).attr("data-ba-id");

    booksInTrash.push(idElement);

    $("#btn-trash-books").removeAttr("disabled");
    $("#btn-clean-books").removeAttr("disabled");

    /* Construindo a estrutura vísivel dos itens que serão apagados */
    let text = "<p class='fs-5 fw-bold'>Lista de possíveis deletados</p>";

    booksInTrash.forEach((bookTrash) => {
        /* Procura o nome do livro em relação ao id do que o cliente tá querendo apagar */
        const data = cacheBooks.find((element) => { return element.id == bookTrash });

        text += `Id: ${bookTrash} Título: ${data.title}<br>`;
    });

    $("#view-trash-book").html(text);
});

/* Evento: Limpa a lista de lixo dos livros que iriam ser apagados */
$("#btn-clean-books").on("click", () => {
    booksInTrash = [];

    /* Desativa o botão de apagar a lista de lixo dos livros, pois já foi clicado e apagado */
    $("#btn-clean-books").attr("disabled", "disabled");

    /* Limpa o conteúdo da visualização dos livros que iriam ser apagados */
    $("#view-trash-book").html("");
})

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

    /* Obtenção da instância do modal */
    const modal = bootstrap.Modal.getInstance($("#modal-remove"));

    if (!resp.ok || data.message.includes("problema")) {
        /* 1° Condição - Aviso: Não foi possível remover os livros */
        /* 2° Condição - Aviso: Conflito de IDs de cache com o banco de dados */

        /* Esconde o modal */
        modal.hide();

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

    /* Limpa a visualização de possíveis livros deletados */
    $("#view-trash-book").html("");

    /* Esconde o modal */
    modal.hide();

    /* Limpa os IDs dos livros foram apagados */
    booksInTrash = [];

    /* Desativa o botão de apagar livros, pois não há livros para apagar */
    $("#btn-trash-books").attr("disabled", "disabled");

    /* Atualiza a lista do modal remoção de livros */
    reloadList("list-remove", "warn-remove");
})

/* Evento: Clique no botão de abrir o modal de remover livro */
$("#btn-remove-book").on("click", () => {
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
});

/* Evento: Alteração nos inputs do modal de adicionamento de livro */
$("#modal-add input").each((index, element) => {
    $(element).on("change", function () {
        const { shelf, title, category, author } = getDataFormAddBook();

        /* Condição: Se o campo NÃO estiver vazio */
        if ($(element).val().trim() !== "") {
            $(element).addClass("is-valid")
            $(element).removeClass("is-invalid")
        } else {
            /* Condição: Se o campo ESTIVER vazio */
            $(element).addClass("is-invalid")
            $(element).removeClass("is-valid")
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

$("#modal-add").on("keypress", (e) => {
    if (e.keyCode == 13) {
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
            createBook();

            const modal_add = bootstrap.Modal.getInstance($("#modal-add"));
            modal_add.hide();
        }
    }
})

/* Evento: Adicionar um livro na lista de livros */
$("#btn-save-book").on("click", async () => {
    createBook();
});

/* Função: Criar livro */

async function createBook() {
    /* Remover atributo do botão de adicionar livro */
    $("#btn-save-book").removeAttr("data-bs-dismiss")

    /* Obtenção dos dados do modal de adicionar livro */
    const { shelf, title, category, author } = getDataFormAddBook();

    /* Filtragem por elementos que possuem conteúdo vazio */
    const inputsEmpty = $("#modal-add input").filter((index, element) => { return element.value.trim() == ""; });

    /* Itera sobre os campos vazios */
    inputsEmpty.each((index, element) => {
        $(element).addClass("is-invalid")
        $(element).removeClass("is-valid")
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
        $("#modal-add input").each((index, element) => {
            $(element).removeClass("is-valid");
            $(element).val("");
        });

        /* Aviso: Não foi possível adicionar o livro */
        return warnsToRequests(data, "danger", "fa-solid fa-xmark me-2");
    }

    /* ID atual deste livro a ser adicionado */
    const idCurrentBook = await data.idCurrentBook;

    /* Adição no cache o livro que foi adicionado no banco de dados */
    cacheBooks.push({ id: idCurrentBook, shelf, title, category, author });

    /* Avisar ao cliente que deu tudo certo na criação do livro */
    warnsToRequests(data, "success", "fa-solid fa-check-circle me-2");

    /* Atualizar lista no front end */
    reloadList("list-books", "warn-search");

    /* Remoção: Limpeza do conteúdo dos campos de adicionamento de livro */
    $("#modal-add input").each((index, element) => {
        $(element).removeClass("is-valid");
        $(element).val("");
    });
}