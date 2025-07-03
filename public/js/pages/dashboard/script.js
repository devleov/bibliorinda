/* Função: Carregar a lista de livros */
loadList();

/* Evento: Remoção de livro pelo atributo `data-ba-id` */
$("#modal-remove").on("click", ".btn-remove-item", function () {
    /* Obtenção do id do elemento correspondente do botão de excluir */
    const idElement = parseInt($(this).attr("data-ba-id"));

    /* Retorna a posição do item no array */
    const indexElement = livros.findIndex((element) => element.id == idElement);

    /* Remove o item da lista */
    livros.splice(indexElement, 1);

    /* Recarrega a lista para arrumar a lista no front-end */
    reloadList("list-remove");
})

/* Evento: Alteração no campo de pesquisa principal */
$("#input-search").on("change", () => {
    searchBook("list-books", "input-search", "warn-search")
});

/* Evento: Alteração no modal de remoção de livros */
$("#search-remove").on("change", () => {
    searchBook("list-remove", "search-remove", "warn-remove")
});

/* Evento: Reatualizar a lista */
$("#btn-reload-list").on("click", () => {
    reloadList("list-books", "warn-remove")
});

/* Função: Obtenção dos dados do modal de adicionar livro */
function getDataFormAddBook() {
    const $nameBook = $("#input-name");
    const $authorBook = $("#input-author");
    const $categoryBook = $("#input-category");
    const $shelfBook = $("#input-shelf");

    function capitalize(string) {
        return string.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    };

    return {
        id: livros.length ? livros[livros.length - 1].id + 1 : 1,
        shelf: $shelfBook.val().toUpperCase().trim(),
        name: capitalize($nameBook.val().trim()),
        category: capitalize($categoryBook.val().trim()),
        author: capitalize($authorBook.val().trim()),
    };
};

/* Evento: Dispara após abrir o modal de adicionar livro */
$("#btn-add-book").on("click", () => {
    /* Obtenção do ID do novo livro */
    const indexBook = livros.slice(-1)[0].id + 1;

    /* Preenche o campo do ID com o ID do novo livro fornecido */
    $("#book-id").text(indexBook)
})

/* Evento: Alteração nos inputs do modal de adicionamento de livro */
$("#modal-add input").each((index, element) => {
    $(element).on("change", function () {
        const { shelf, name, category, author } = getDataFormAddBook();

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
        if (name && author && category) {
            $("#btn-save-book").attr("data-bs-dismiss", "modal");
        }
    });
})

/* Evento: Adicionar um livro na lista de livros */
$("#btn-save-book").on("click", () => {
    /* Obtenção dos dados do modal de adicionar livro */
    const { id, shelf, name, category, author } = getDataFormAddBook();

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

    if (!name || !author || !category) return;

    livros.push({
        id: id,
        name: name,
        author: author,
        category: category,
        shelf: shelf,
    });

    /* Aviso após adicionar o livro */
    $(".alert").addClass("show")
    $(".text-alert").html(`O livro <b>${name}</b> foi adicionado!`)

    setTimeout(() => {
        $(".alert").removeClass("show")
        $(".text-alert").html("")
    }, 7000)

    /* Removendo todo o conteúdo dos inputs */
    $("#modal-add input").each((index, element) => {
        $(element).removeClass("is-valid")
        $(element).val("")
    })

    /* Atualizar lista */
    reloadList("list-books")
});