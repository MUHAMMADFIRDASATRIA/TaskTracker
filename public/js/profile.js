/* ===========================
   LOAD PROFILE
=========================== */
function loadProfile() {
    $.ajax({
        url: `${API_URL}/profile`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            console.log("Profile Response:", res);
            const user = res.data;

            // Header
            $("#header-name").text(user.name);
            $("#header-avatar").text(user.name.charAt(0).toUpperCase());

            // Display info
            $("#display-id").text(`#${user.id}`);
            $("#display-name").text(user.name);
            $("#display-email").text(user.email);

            // Form default value
            $("#name").val(user.name);
            $("#email").val(user.email);
        },
        error: function (xhr) {
            console.error("Profile Error:", xhr.status, xhr.responseText);

            if (xhr.status === 401) {
                logout();
            } else {
                alert("Gagal memuat data profil");
            }
        }
    });
}

/* ===========================
   UPDATE PROFILE
=========================== */
$("#profileForm").submit(function (e) {
    e.preventDefault();

    const data = {
        name: $("#name").val(),
        email: $("#email").val()
    };

    const password = $("#password").val();
    if (password) {
        data.password = password;
    }

    $.ajax({
        url: `${API_URL}/profile/edit`,
        method: "PUT",
        headers: getAuthHeader(),
        data: data,
        success: function (res) {
            alert("Profil berhasil diperbarui ✅");
            loadProfile();
            $("#password").val("");
        },
        error: function (xhr) {
            console.error(xhr.responseText);

            if (xhr.status === 422) {
                alert("Validasi gagal. Periksa input kamu.");
            } else if (xhr.status === 401) {
                logout();
            } else {
                alert("Gagal memperbarui profil ❌");
            }
        }
    });
});

/* ===========================
   DELETE ACCOUNT
=========================== */
$("#btn-delete-account").click(function () {
    if (!confirm("Yakin ingin menghapus akun secara permanen?")) return;

    $.ajax({
        url: `${API_URL}/profile`,
        method: "DELETE",
        headers: getAuthHeader(),
        success: function () {
            alert("Akun berhasil dihapus");
            logout();
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            alert("Gagal menghapus akun");
        }
    });
});

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    loadProfile();

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
});
