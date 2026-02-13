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
   CHECK AUTH
========================== */

function checkAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

/* ==========================
   REGISTER
========================== */

function handleRegister() {

    $("#register-form").on("submit", function (e) {
        e.preventDefault();

        $.ajax({
            url: `${API_URL}/register`,
            method: "POST",
            data: {
                name: $("#name").val(),
                email: $("#email").val(),
                password: $("#password").val()
            },
            success: function (res) {
                saveToken(res.api_token);
                window.location.href = "dashboard.html";
            },
            error: function (err) {
                alert("Register gagal");
            }
        });
    });

}

/* ==========================
   LOGIN
========================== */

function handleLogin() {

    $("#login-form").on("submit", function (e) {
        e.preventDefault();

        $.ajax({
            url: `${API_URL}/login`,
            method: "POST",
            data: {
                email: $("#email").val(),
                password: $("#password").val()
            },
            success: function (res) {
                saveToken(res.api_token);
                window.location.href = "dashboard.html";
            },
            error: function () {
                alert("Login gagal");
            }
        });
    });

}

/* ==========================
   LOGOUT
========================== */

function logout() {
    $.ajax({
        url: `${API_URL}/logout`,
        method: "POST",
        headers: getAuthHeader(),
        complete: function () {
            removeToken();
            window.location.href = "login.html";
        }
    });
}

/* ==========================
   GLOBAL 401 HANDLER
========================== */

$(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status === 401) {
        removeToken();
        window.location.href = "login.html";
    }
});
