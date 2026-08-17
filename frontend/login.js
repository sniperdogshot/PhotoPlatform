const API_URL = "http://127.0.0.1:8000";

const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const error = document.getElementById("error");
const loginButton = document.getElementById("login-button");


// ========================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// ========================================

const existingToken = localStorage.getItem("access_token");

if (existingToken) {
    window.location.href = "admin.html";
}


// ========================================
// LOGIN
// ========================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    error.classList.add("hidden");
    error.textContent = "";

    loginButton.disabled = true;
    loginButton.textContent = "Entrando...";


    const formData = new URLSearchParams();

    formData.append(
        "username",
        email.value.trim()
    );

    formData.append(
        "password",
        password.value
    );


    try {

        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.detail ||
                "E-mail ou senha inválidos."
            );
        }


        console.log(
            "Login realizado com sucesso."
        );


        localStorage.setItem(
            "access_token",
            data.access_token
        );


        localStorage.setItem(
            "token_type",
            data.token_type
        );


        window.location.href = "admin.html";


    } catch (err) {

        console.error(
            "Erro no login:",
            err
        );


        error.textContent =
            err.message ||
            "Não foi possível fazer login.";


        error.classList.remove(
            "hidden"
        );


    } finally {

        loginButton.disabled = false;

        loginButton.textContent = "Entrar";

    }

});
