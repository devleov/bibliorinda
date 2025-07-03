$("#btn-login").on("click", () => {
    login();
});

$(document).on("keydown", (e) => {
    if (e.keyCode == 13) {
        login()
    };
});

async function login() {
    const email = $("#email").val()
    const password = $("#password").val()

    if (!email || !password) {
        $(".text-alert").text("Há algum campo vazio!")
        $(".alert").addClass("show")
        $("#email").addClass("is-invalid")
        $("#password").addClass("is-invalid")

        return;
    }

    const resp = await fetch("/login/acess", {
        headers: { "Content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ email, password })
    })

    if (resp.ok) {
        const data = await resp.json()

        if (data.status == "failed") {
            $(".text-alert").text("O e-mail ou a senha estão incorretas.")
            $(".alert").addClass("show")
            $("#email").addClass("is-invalid")
            $("#password").addClass("is-invalid")

            setTimeout(() => {
                $(".text-alert").text("")
                $(".alert").removeClass("show")
            }, 12000)
        } else if (data.status == "already-logged-in") {
            $(".text-alert").text("Você já está logado.\nIndo para dashboard em 5 segundos")
            $(".alert").removeClass("alert-danger")
            $(".alert").addClass("alert-warning")
            $(".alert").addClass("show")

            setTimeout(() => {
                $(".text-alert").text("")
                $(".alert").addClass("alert-danger")
                $(".alert").removeClass("alert-warning")
                $(".alert").removeClass("show")

                setTimeout(() => {
                    window.location.href = "/dashboard"
                }, 2000)
            }, 8000)
        } else {

            $(".alert-text").text("")
            $(".alert").removeClass("show")
            $("#email").removeClass("is-invalid")
            $("#password").removeClass("is-invalid")

            window.location.href = "/dashboard"
        }
    }
}