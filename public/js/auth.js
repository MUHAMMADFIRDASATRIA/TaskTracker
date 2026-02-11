// auth.js

// jika belum login → redirect
if (!localStorage.getItem("api_token")) {
    window.location.href = "/login.html";
}

// helper header auth
function getAuthHeader() {
    return {
        Authorization: "Bearer " + localStorage.getItem("api_token")
    };
}
