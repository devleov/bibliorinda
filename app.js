require("dotenv").config()

const express = require("express");
const app = express();
const path = require("path");

const jwt = require("jsonwebtoken");

const { engine } = require("express-handlebars");

/* Porta do servidor de desenvolvimento */
const port = process.env.PORT || 6070;

/* Configurando o handlebars como visualizador de template */
app.set("view engine", "hbs");
app.engine("hbs", engine({
    defaultLayout: "main",
    extname: ".hbs",
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

function protectionRouter(req, res, next) {
    /* Se o caminho for o /login e estiver logado então verificar a validação do token, se tudo estiver certo ir para o dashboard, caso contrário, deixar ir para o login, agora se não tiver o token, significa que não está logado, logo, deixará ir para o login. Agora se não tiver o token em qualquer outra rota então redirecionar para o /login. Agora se o usuário não estiver na rota de /login e tiver o token, verificar o token, se for válido deixar passar, se não for retornar para a página de login. */

    const token = req.cookies.tokenLogin;

    /* Se tentar ir para o login e está logado verificar validação ? /dashboard : /login */
    if (req.path === "/login") {
        if (token) {
            try {
                jwt.verify(token, process.env.TOKEN_LOGIN)

                return res.redirect("/dashboard")
            } catch (err) {
                return next();
            }
        }

        /* Se tentar ir para o /login, mas não tem token, deixar ir para o /login */
        return next();
    }

    if (!token) {
        return res.redirect("/login")
    }

    /* Se o usuário estiver em qualquer outra rota exceto a de /login, e tiver token, então validar o token ? next() : erro */

    try {
        jwt.verify(token, process.env.TOKEN_LOGIN)

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido ou expirado!" })
    }

};

app.get("/login", protectionRouter, (req, res) => {
    res.render("login", {
        title: "Bibliorinda - Login",
        icon: "/img/login-icon.svg",
        css: "/css/pages/login/style.css",
        js: "/js/pages/login/script.js",
    });
});

app.post("/login/acess", (req, res) => {
    const { email, password } = req.body;

    /* Se o email e a senha for igual a email/senha correta */
    if (email == process.env.EMAIL_LOGIN && password == process.env.PASSWORD_LOGIN) {
        /* Criar token */
        const token = jwt.sign({ email, password }, process.env.TOKEN_LOGIN, { expiresIn: "1h" });

        /* Salvando o cookie */
        res.cookie("tokenLogin", token, {
            maxAge: 60 * 60 * 1000, /* 1h de duração por cookie */
            httpOnly: true, /* O cookie só é acessível pelo servidor */
            secure: true, /* Só em produção */
            sameSite: "strict" /* Só envia o cookie no mesmo domínio */
        });

        res.json({ status: "success" });
    } else {
        res.json({ status: "failed" });
    };
});

app.get("/dashboard", protectionRouter, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard - Bibliorinda",
        icon: "/img/dashboard-icon.svg",
        css: "/css/pages/dashboard/style.css",
        js: "/js/pages/dashboard/script.js",
        name: "Débora",
    });
});

app.post("/logout", (req, res) => {
    try {
        /* Limpa cookie de logout */
        res.clearCookie("tokenLogin");

        res.json({ status: "success", message: "Você deslogou com sucesso!" });
    } catch (err) {
        res.json({ status: "failed", message: "Não foi possível deslogar!", err });
    };
});

app.listen(port, () => {
    console.log("Servidor rodando na porta: " + port);
});