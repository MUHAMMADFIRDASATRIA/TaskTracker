const API_URL = "http://127.0.0.1:8000/api";

/* ==========================
   TOKEN MANAGEMENT
========================== */

function saveToken(token) {
    localStorage.setItem("api_token", token);
}

function getToken() {
    return localStorage.getItem("api_token");
}

function removeToken() {
    localStorage.removeItem("api_token");
}

function getAuthHeader() {
    return {
        Authorization: "Bearer " + getToken()
    };
}

/* ==========================
   AUTH CHECK (WAJIB)
========================== */

function checkAuth() {
    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
    }
}

/* ==========================
   HANDLE LOGIN
========================== */

function handleLogin() {
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        const email = $("#email").val();
        const password = $("#password").val();

        $.ajax({
            url: `${API_URL}/login`,
            method: "POST",
            data: {
                email: email,
                password: password
            },
            success: function (res) {
                if (res.success && res.api_token) {
                    saveToken(res.api_token);
                    window.location.href = "dashboard.html";
                } else {
                    alert("Login gagal");
                }
            },
            error: function (err) {
                const message = err.responseJSON?.message || "Login gagal. Silakan coba lagi.";
                alert(message);
            }
        });
    });
}

/* ==========================
   HANDLE REGISTER
========================== */

function handleRegister() {
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#name").val();
        const email = $("#email").val();
        const password = $("#password").val();

        $.ajax({
            url: `${API_URL}/register`,
            method: "POST",
            data: {
                name: name,
                email: email,
                password: password
            },
            success: function (res) {
                if (res.success && res.api_token) {
                    saveToken(res.api_token);
                    window.location.href = "dashboard.html";
                } else {
                    alert("Register gagal");
                }
            },
            error: function (err) {
                const message = err.responseJSON?.message || "Register gagal. Silakan coba lagi.";
                alert(message);
            }
        });
    });
}

/* ==========================
   LOGOUT
========================== */

function logout() {
    const token = getToken();
    
    if (token) {
        $.ajax({
            url: `${API_URL}/logout`,
            method: "POST",
            headers: getAuthHeader(),
            success: function () {
                removeToken();
                window.location.href = "login.html";
            },
            error: function () {
                // Tetap hapus token lokal meskipun request ke server gagal
                removeToken();
                window.location.href = "login.html";
            }
        });
    } else {
        window.location.href = "login.html";
    }
}

/* ==========================
   SETUP LOGOUT BUTTON
========================== */

$(document).ready(function () {
    $("#btnLogout").on("click", function (e) {
        e.preventDefault();
        logout();
    });
});
