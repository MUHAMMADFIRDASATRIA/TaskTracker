$("#loginForm").submit(function (e) {
    e.preventDefault();

    $.ajax({
        url: "http://127.0.0.1:8000/api/login",
        method: "POST",
        data: {
            email: $("#email").val(),
            password: $("#password").val()
        },
        success: function (res) {
            localStorage.setItem("api_token", res.api_token);
            localStorage.setItem("exp_token", res.exp_token);

            window.location.href = "/dashboard.html";
        },
        error: function () {
            alert("Email atau password salah");
        }
    });
});
