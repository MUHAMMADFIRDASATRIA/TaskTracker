const API_URL = "http://127.0.0.1:8000/api";

$(document).ready(function () {

    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#name").val();
        const email = $("#email").val();
        const password = $("#password").val();

        console.log("Register Data:", { name, email, password }); // Debug

        $.ajax({
            url: `${API_URL}/register`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                name: name,
                email: email,
                password: password
            }),
            success: function (res) {
                console.log("Register Success:", res); // Debug

                $("#register-message").html(
                    `<div class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">${res.message}</div>`
                );

                // Simpan token ke localStorage
                localStorage.setItem("api_token", res.api_token);

                // Redirect ke dashboard
                setTimeout(() => {
                    window.location.href = "/dashboard.html";
                }, 1500);
            },
            error: function (err) {
                console.error("Register Error:", err.responseJSON); // Debug

                let message = "Terjadi kesalahan";

                if (err.responseJSON && err.responseJSON.message) {
                    message = err.responseJSON.message;
                } else if (err.responseJSON && err.responseJSON.errors) {
                    message = Object.values(err.responseJSON.errors).join(", ");
                }

                $("#register-message").html(
                    `<div class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">${message}</div>`
                );
            }
        });

    });

});
