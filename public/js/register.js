const API_URL = "http://127.0.0.1:8000/api";

$(document).ready(function () {

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

                $("#register-message").html(
                    `<p style="color:green;">${res.message}</p>`
                );

                // Simpan token ke localStorage
                localStorage.setItem("api_token", res.api_token);

                // Optional: redirect
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1000);
            },
            error: function (err) {

                let message = "Terjadi kesalahan";

                if (err.responseJSON && err.responseJSON.message) {
                    message = err.responseJSON.message;
                }

                $("#register-message").html(
                    `<p style="color:red;">${message}</p>`
                );
            }
        });

    });

});
