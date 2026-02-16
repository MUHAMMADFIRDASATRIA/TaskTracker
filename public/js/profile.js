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

            // Load profile photo jika ada
            if (user.profile_photo && user.profile_photo.trim() !== "") {
                $("#profile-photo-preview")
                    .attr("src", user.profile_photo)
                    .removeClass("hidden");
                
                $("#profile-photo-placeholder").addClass("hidden");
                $("#remove-photo-btn").removeClass("hidden");
                
                // Update header avatar dengan foto
                $("#header-avatar").css({
                    "background-image": `url('${user.profile_photo}')`,
                    "background-size": "cover",
                    "background-position": "center"
                }).text("");
            } else {
                $("#profile-photo-preview").addClass("hidden");
                $("#profile-photo-placeholder").removeClass("hidden");
                $("#remove-photo-btn").addClass("hidden");
            }
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
   INIT - MUST BE FIRST
=========================== */
$(document).ready(function () {
    console.log("✅ Profile page loaded");
    console.log("API_URL:", API_URL);
    console.log("Auth Token:", getToken() ? "EXISTS" : "MISSING");

    // Load profile data
    loadProfile();

    // Initialize lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    /* ===========================
       HANDLE PHOTO PREVIEW
    =========================== */
    $(document).on("change", "#profile-photo-input", function (e) {
        const file = this.files[0];
        
        if (!file) return;
        
        // Validasi tipe file
        const validTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("❌ Hanya file JPG, JPEG, atau PNG yang diperbolehkan");
            this.value = "";
            return;
        }
        
        // Validasi ukuran file (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("❌ Ukuran file terlalu besar (maksimal 2MB)");
            this.value = "";
            return;
        }
        
        // Baca file dan tampilkan preview
        const reader = new FileReader();
        reader.onload = function (event) {
            const $preview = $("#profile-photo-preview");
            const $placeholder = $("#profile-photo-placeholder");
            const $container = $("#profile-photo-container");
            
            // Update preview
            $preview.attr("src", event.target.result).removeClass("hidden");
            $placeholder.addClass("hidden");
            $("#remove-photo-btn").removeClass("hidden");
            
            // Tambah visual feedback
            $container.addClass("ring-2 ring-cyan-400/50");
            
            // Tampilkan informasi file
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            console.log(`✅ Foto dipilih: ${file.name} (${sizeMB}MB)`);
        };
        reader.readAsDataURL(file);
    });

    /* ===========================
       HANDLE REMOVE PHOTO
    =========================== */
    $(document).on("click", "#remove-photo-btn", function (e) {
        e.preventDefault();
        
        $("#profile-photo-input").val("");
        $("#profile-photo-preview")
            .attr("src", "")
            .addClass("hidden");
        
        $("#profile-photo-placeholder").removeClass("hidden");
        $("#remove-photo-btn").addClass("hidden");
        $("#profile-photo-container").removeClass("ring-2 ring-cyan-400/50");
    });

    /* ===========================
       UPDATE PROFILE
    =========================== */
    $(document).on("submit", "#profileForm", function (e) {
        e.preventDefault();

        // Validasi input
        const name = $.trim($("#name").val());
        const email = $.trim($("#email").val());
        
        if (!name) {
            alert("❌ Nama lengkap tidak boleh kosong");
            return;
        }
        
        if (!email) {
            alert("❌ Email tidak boleh kosong");
            return;
        }
        
        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("❌ Format email tidak valid");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);

        const password = $.trim($("#password").val());
        if (password) {
            if (password.length < 8) {
                alert("❌ Password minimal 8 karakter");
                return;
            }
            formData.append("password", password);
        }

        const photo = $("#profile-photo-input")[0].files[0];
        if (photo) {
            formData.append("profile_photo", photo);
        }

        // Disable button saat loading
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalBtnHTML = $submitBtn.html();
        $submitBtn.prop("disabled", true).html('<svg class="animate-spin h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...');

        $.ajax({
            url: `${API_URL}/profile/edit`,
            method: "PUT",
            headers: getAuthHeader(),
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                console.log("Profile updated successfully:", res);
                alert("✅ Profil berhasil diperbarui!");
                
                // Update UI dengan data dari response
                if (res.data) {
                    const userData = res.data;
                    
                    // Update header
                    $("#header-name").text(userData.name);
                    $("#header-avatar").text(userData.name.charAt(0).toUpperCase());
                    
                    // Update display info
                    $("#display-id").text(`#${userData.id}`);
                    $("#display-name").text(userData.name);
                    $("#display-email").text(userData.email);
                    
                    // Update preview foto jika ada
                    if (userData.profile_photo) {
                        $("#profile-photo-preview")
                            .attr("src", userData.profile_photo)
                            .removeClass("hidden");
                        
                        $("#profile-photo-placeholder").addClass("hidden");
                        $("#remove-photo-btn").removeClass("hidden");
                        
                        // Update header avatar dengan foto
                        $("#header-avatar").css({
                            "background-image": `url('${userData.profile_photo}')`,
                            "background-size": "cover",
                            "background-position": "center"
                        }).text("");
                    }
                }
                
                // Clear form
                $("#password").val("");
                $("#profile-photo-input").val("");
                $("#profile-photo-container").removeClass("ring-2 ring-cyan-400/50");
                
                // Reinitialize icons
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            },
            error: function (xhr) {
                console.error("Update profile error:", xhr);
                console.error("Response text:", xhr.responseText);
                
                let errorMessage = "❌ Gagal memperbarui profil";
                
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.message) {
                        errorMessage = "❌ " + response.message;
                    }
                    if (response.errors) {
                        const errors = Object.values(response.errors);
                        errorMessage = "❌ " + errors.join(", ");
                    }
                } catch (e) {
                    if (xhr.status === 422) {
                        errorMessage = "❌ Data tidak valid. Periksa kembali input Anda.";
                    } else if (xhr.status === 401) {
                        logout();
                        return;
                    } else if (xhr.status === 413) {
                        errorMessage = "❌ Ukuran file terlalu besar";
                    } else if (xhr.status === 415) {
                        errorMessage = "❌ Tipe file tidak didukung";
                    }
                }
                
                alert(errorMessage);
            },
            complete: function () {
                // Enable button kembali
                $submitBtn.prop("disabled", false).html(originalBtnHTML);
                lucide.createIcons();
            }
        });
    });

    /* ===========================
       DELETE ACCOUNT
    =========================== */
    $(document).on("click", "#btn-delete-account", function (e) {
        e.preventDefault();
        
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
});

    
