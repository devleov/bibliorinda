$("#btn-login").on("click", () => {
    login();
});

$(document).on("keydown", (e) => {
    if (e.keyCode == 13) {
        login();
    };
});

let intervalWarns;

async function login() {

    /* Pegando os dados dos campos de login */
    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        $(".text-alert").html('<i class="fa-solid fa-triangle-exclamation me-2"></i> Por favor, preencha todos os campos!');

        $(".alert").addClass("alert-warning")

        $(".alert").addClass("show");

        $("#email").addClass("is-invalid");
        $("#password").addClass("is-invalid");

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            $(".text-alert").text("")
            $(".alert").removeClass("show")
        }, 5000)

        return;
    };

    const resp = await fetch("/login/acess", {
        headers: { "Content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    const data = await resp.json();

    if (data.status == "failed") {
        $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + "O e-mail ou a senha estão incorretas.");

        $(".alert").addClass("alert-danger show");
        $(".alert").removeClass("alert-warning alert-success");

        $("#email").addClass("is-invalid");
        $("#password").addClass("is-invalid");

        if (intervalWarns) clearTimeout(intervalWarns);

        intervalWarns = setTimeout(() => {
            $(".text-alert").text("");
            $(".alert").removeClass("show");
        }, 5000);

        return;
    };

    /* Quando o login é efetuado */

    $(".text-alert").html('<i class="fa-solid fa-check-circle me-2"></i>' + "Login efetuado com sucesso!\nIndo para o dashboard..");

    $(".alert").addClass("alert-success show");
    $(".alert").removeClass("alert-warning alert-danger");

    $("#email").addClass("is-valid");
    $("#password").addClass("is-valid");
    $("#email").removeClass("is-invalid");
    $("#password").removeClass("is-invalid");

    if (intervalWarns) clearTimeout(intervalWarns);

    intervalWarns = setTimeout(() => {
        window.location.href = "/dashboard";
    }, 2000);
};