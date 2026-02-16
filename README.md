# TaskTracker - Sistem Manajemen Proyek & Tugas

🚀 **TaskTracker** adalah aplikasi web modern untuk mengelola proyek dan tugas harian Anda dengan antarmuka yang intuitif dan responsif.

---

## 🎯 Tentang Proyek

TaskTracker adalah sistem manajemen pekerjaan yang dirancang untuk membantu tim dan individu:

- ✅ Membuat dan mengelola proyek
- ✅ Membuat tugas dalam proyek
- ✅ Mengedit profil pengguna
- ✅ Upload foto profil dengan preview real-time
- ✅ Manajemen akun dan keamanan

---

## 🛠️ Teknologi yang Digunakan

### **Frontend**

| Technology       | Deskripsi                                           | Link                                         |
| ---------------- | --------------------------------------------------- | -------------------------------------------- |
| **HTML5**        | Markup semantik untuk struktur halaman              | [w3schools](https://www.w3schools.com/html/) |
| **Tailwind CSS** | Framework CSS utility-first untuk styling responsif | [tailwindcss.com](https://tailwindcss.com)   |
| **jQuery**       | Library JavaScript untuk manipulasi DOM dan AJAX    | [jquery.com](https://jquery.com)             |
| **Lucide Icons** | Icon library modern dan ringan                      | [lucide.dev](https://lucide.dev)             |

### **Backend**

| Technology  | Deskripsi                                 |
| ----------- | ----------------------------------------- |
| **Laravel** | Framework PHP untuk API dan logika bisnis |
| **PHP**     | Bahasa pemrograman server-side            |
| **MySQL**   | Database relasional                       |

### **Development Tools**

- **Vite** - Module bundler modern
- **Composer** - Package manager PHP
- **npm** - Package manager JavaScript
- **PHPUnit** - Testing framework

---

## 📁 Struktur Project

```
authsistem/
├── public/               # Files publik (HTML, JS, CSS)
│   ├── index.html       # Landing page
│   ├── login.html       # Halaman login
│   ├── register.html    # Halaman registrasi
│   ├── dashboard.html   # Dashboard utama
│   ├── profile.html     # Profil pengguna ⭐ (dengan upload foto)
│   ├── projects.html    # Manajemen proyek
│   ├── tasks.html       # Manajemen tugas
│   ├── js/
│   │   ├── auth.js      # Autentikasi & token management
│   │   ├── profile.js   # ⭐ Upload & preview foto profil (jQuery)
│   │   ├── projects.js  # CRUD proyek
│   │   ├── tasks.js     # CRUD tugas
│   │   └── ...
│   ├── storage/         # Penyimpanan foto & file
│   └── robots.txt
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AuthController.php
│   │       └── ProfileController.php ⭐ (Handle upload foto)
│   └── Models/
│       ├── User.php     # ⭐ Model dengan accessor profile_photo
│       ├── Project.php
│       └── Task.php
├── routes/
│   └── api.php          # API routes
├── database/
│   ├── migrations/      # Database schema
│   └── seeders/         # Database seeding
└── resources/
    ├── css/
    ├── js/
    └── views/           # Blade templates (jika diperlukan)
```

---

## ⭐ Fitur Utama

### 1. **Autentikasi & Keamanan**

- Login dengan email & password
- Register akun baru
- Token-based authentication
- Logout & session management

### 2. **Manajemen Profil** 🎨

- **View & Edit Profile**
    - Ubah nama dan email
    - Ganti password
    - Upload foto profil dengan preview real-time

- **Teknologi Upload Foto:**

    ```javascript
    // jQuery handling
    - FileReader API untuk preview lokal
    - FormData untuk multipart upload
    - Validasi tipe file (JPG, JPEG, PNG)
    - Validasi ukuran file (max 2MB)
    - AJAX PUT request dengan headers auth
    ```

- **Backend Processing:**
    ```php
    // Laravel & PHP
    - Storage facade untuk simpan file
    - Konversi path → URL accessor
    - Soft delete foto lama
    - Return URL foto di response
    ```

### 3. **Manajemen Proyek**

- Buat, baca, ubah, hapus proyek
- List proyek dengan filter

### 4. **Manajemen Tugas**

- Buat tugas dalam proyek
- Update status tugas
- Hapus tugas

---

## 🚀 Quick Start

### Instalasi

```bash
# Clone repository
git clone <repo-url>
cd authsistem

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan storage:link

# Run development server
php artisan serve

# Build frontend assets
npm run dev
```

### API Endpoints

```
POST   /api/login              - Login user
POST   /api/register           - Register user
GET    /api/profile            - Get profile user
PUT    /api/profile/edit       - Edit profile & upload foto ⭐
DELETE /api/profile            - Delete account

GET    /api/projects           - List proyek
POST   /api/projects           - Buat proyek
PUT    /api/projects/{id}      - Edit proyek
DELETE /api/projects/{id}      - Hapus proyek

GET    /api/tasks              - List tugas
POST   /api/tasks              - Buat tugas
PUT    /api/tasks/{id}         - Edit tugas
DELETE /api/tasks/{id}         - Hapus tugas
```

---

## 💡 Contoh Penggunaan jQuery untuk Upload Foto

```javascript
// 1. Preview foto sebelum upload
$("#profile-photo-input").on("change", function (e) {
    const file = this.files[0];

    // Validasi
    if (file.size > 2 * 1024 * 1024) {
        alert("File terlalu besar!");
        return;
    }

    // Preview dengan FileReader
    const reader = new FileReader();
    reader.onload = function (event) {
        $("#profile-photo-preview")
            .attr("src", event.target.result)
            .removeClass("hidden");
    };
    reader.readAsDataURL(file);
});

// 2. Upload dengan AJAX
$("#profileForm").submit(function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", $("#name").val());
    formData.append("profile_photo", $("#profile-photo-input")[0].files[0]);

    $.ajax({
        url: "/api/profile/edit",
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        data: formData,
        processData: false,
        contentType: false,
        success: function (res) {
            // Update preview dengan URL dari server
            $("#profile-photo-preview").attr("src", res.data.profile_photo);
        },
    });
});
```

---

## 🎨 Styling dengan Tailwind CSS

Semua halaman menggunakan **Tailwind CSS** untuk styling:

```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Dark Theme dengan Gradients -->
    <div class="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
        <!-- Hover & Transition Effects -->
        <button
            class="hover:from-cyan-400 hover:to-blue-500 transition-all"
        ></button>
    </div>
</div>
```

**Fitur Tailwind yang Digunakan:**

- ✅ Responsive Design (mobile-first)
- ✅ Dark theme (bg-slate-900, slate-800)
- ✅ Gradient backgrounds
- ✅ Animations & transitions
- ✅ Flexbox & Grid layouts
- ✅ Custom scrollbar styling
- ✅ Shadow & blur effects

---

## 📝 HTML Best Practices

Setiap halaman HTML mengikuti best practices:

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>

    <!-- CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Dependencies -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-900 text-slate-100">
    <!-- Semantic HTML5 -->
    <header class="...">
    <main class="...">
    <aside class="...">
    <footer class="...">

    <!-- Scripts -->
    <script src="js/auth.js"></script>
    <script src="js/profile.js"></script>
</body>
</html>
```

---

## 🔐 Security Features

- ✅ **Token-based Authentication** - Bearer token di headers
- ✅ **File Validation** - Validasi tipe & ukuran di client & server
- ✅ **Password Hashing** - Laravel Hash facade
- ✅ **CORS Protection** - API security
- ✅ **Input Validation** - Server-side validation

---

## 📚 Dokumentasi Referensi

### jQuery

- [jQuery Documentation](https://jquery.com)
- [jQuery AJAX](https://api.jquery.com/jquery.ajax/)
- [jQuery DOM Manipulation](https://api.jquery.com/category/manipulation/)

### Tailwind CSS

- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind Components](https://tailwindcss.com/components)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)

### HTML5

- [MDN HTML Reference](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [HTML5 Semantics](https://www.w3schools.com/html/html5_semantic_elements.asp)
- [Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Laravel API

- [Laravel Documentation](https://laravel.com/docs)
- [Eloquent ORM](https://laravel.com/docs/eloquent)
- [Storage Facade](https://laravel.com/docs/filesystem)

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📄 License

Proyek ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail.

---

## 👨‍💻 Author

**TaskTracker Team**

Dibuat dengan ❤️ menggunakan Laravel, jQuery, dan Tailwind CSS

---

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
