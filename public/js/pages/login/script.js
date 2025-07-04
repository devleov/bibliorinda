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

    if (resp.ok) {
        const data = await resp.json();

        if (data.status == "failed") {
            $(".text-alert").html('<i class="fa-solid fa-xmark me-2"></i>' + "O e-mail ou a senha estão incorretas.");

            $(".alert").addClass("alert-danger");
            $(".alert").removeClass("alert-warning");
            $(".alert").removeClass("alert-success");

            $(".alert").addClass("show");

            $("#email").addClass("is-invalid");
            $("#password").addClass("is-invalid");

            if (intervalWarns) clearTimeout(intervalWarns);

            intervalWarns = setTimeout(() => {
                $(".text-alert").text("");
                $(".alert").removeClass("show");
            }, 5000);
        } else if (data.status == "already-logged-in") {
            $(".text-alert").html('<i class="fa-solid fa-triangle-exclamation me-2"></i>' + "Você já está logado.\nIndo para o dashboard..");

            $(".alert").addClass("alert-warning");
            $(".alert").removeClass("alert-danger");
            $(".alert").removeClass("alert-success");

            $(".alert").addClass("show");

            if (intervalWarns) clearTimeout(intervalWarns);

            intervalWarns = setTimeout(() => {
                $(".text-alert").text("");
                $(".alert").removeClass("alert-warning");
                $(".alert").removeClass("show");

                window.location.href = "/dashboard";
            }, 5000)
        } else {
            $(".text-alert").html('<i class="fa-solid fa-check-circle me-2"></i>' + "Login efetuado com sucesso!\nIndo para o dashboard..");

            $(".alert").addClass("alert-success");
            $(".alert").removeClass("alert-warning");
            $(".alert").removeClass("alert-danger");

            $(".alert").addClass("show");

            $("#email").addClass("is-valid");
            $("#password").addClass("is-valid");
            $("#email").removeClass("is-invalid");
            $("#password").removeClass("is-invalid");

            if (intervalWarns) clearTimeout(intervalWarns);

            intervalWarns = setTimeout(() => {
                $(".alert-text").text("");
                $(".alert").removeClass("show");

                window.location.href = "/dashboard";
            }, 5000);
        }
    }
}