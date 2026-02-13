// auth.js

// jika belum login → redirect
if (!localStorage.getItem("api_token")) {
    window.location.href = "/login.html";
}

// helper header auth
function getAuthHeader() {
    const token = localStorage.getItem("api_token");
    console.log("Auth Token:", token); // Debug
    return {
        Authorization: "Bearer " + token
    };
}
