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
