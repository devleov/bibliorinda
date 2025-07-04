const express = require("express");
const app = express();
const path = require("path");

const { engine } = require ("express-handlebars");

/* Credenciais de login */
const login = {
    status: "off",
    name: "Débora",
    email: "email",
    password: 123
};

/* Porta do servidor de desenvolvimento */
const port = 6070;

/* Configurando o handlebars como visualizador de template */
app.set("view engine", "hbs");
app.engine("hbs", engine({
    defaultLayout: "main",
    extname: ".hbs",
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function loginProtection(req, res, next) {
    if (login.status == "off") {
        res.redirect("/login");
    } else {
        next();
    };
};

app.get("/login", (req, res) => {
    res.render("login", {
        title: "Bibliorinda - Login",
        icon: "/img/login-icon.svg",
        css: "/css/pages/login/style.css",
        js: "/js/pages/login/script.js",
    });
});

app.get("/dashboard", loginProtection, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard - Bibliorinda",
        icon: "/img/dashboard-icon.svg",
        css: "/css/pages/dashboard/style.css",
        js: "/js/pages/dashboard/script.js",
        name: login.name,
    });
});

app.post("/logout", (req, res) => {
    try {
        login.status = "off";
        
        res.json({ status: "success"});
    } catch(err) {
        res.json({ status: "failed", err: err });
    };
});

app.post("/login/acess", (req, res) => {
    const { email, password } = req.body;
    
    if (login.status == "on") {
        res.json({ status: "already-logged-in" });

        return;
    };

    /* Mudando a variável de controle de login */
    login.status = "on";

    if (email == login.email && password == login.password) {
        res.json({ status: "success" });
    } else {
        res.json({ status: "failed" });
    };
});

app.listen(port, () => {
    console.log("Servidor rodando na porta: " + port);
});