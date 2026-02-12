const API_URL = "http://127.0.0.1:8000/api";

/* ===========================
   LOAD PROJECT LIST
=========================== */
function loadProjects() {
    $.ajax({
        url: `${API_URL}/users/project`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            $("#projectList").empty();

            if (res.data.length === 0) {
                $("#projectList").html(`
                    <div class="col-span-full text-center text-slate-500">
                        Belum ada project
                    </div>
                `);
                return;
            }

            res.data.forEach(project => {
                $("#projectList").append(projectCard(project));
            });
        },
        error: function (xhr) {
            if (xhr.status === 401) logout();
        }
    });

    $.ajax({
        url: `${API_URL}/profile`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            const user = res.data;
            $("#header-name").text(user.name);
            $("#header-avatar").text(user.name.charAt(0).toUpperCase());
        }
    });
}

/* ===========================
   PROJECT CARD TEMPLATE
=========================== */
function projectCard(p) {
    return `
    <div class="bg-white rounded-2xl shadow-xl hover:shadow-indigo-200 transition-all border border-slate-200 p-6 flex flex-col gap-3">
        <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow">
                <i data-lucide="folder" size="22"></i>
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-800">${p.title}</h3>
                <p class="text-xs text-slate-400 mt-1">ID: #${p.id}</p>
            </div>
        </div>
        <p class="text-sm text-slate-500 mb-2">${p.description ?? '-'}</p>
        <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">${p.status}</span>
            <span class="px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">
                <i data-lucide="calendar" size="14" class="inline-block mr-1"></i>
                Tenggat: ${p.tenggat ? p.tenggat : '-'}
            </span>
        </div>
        <div class="flex gap-2 mt-3">
            <button onclick="openTasks(${p.id})" class="w-full text-sm bg-slate-100 hover:bg-slate-200 rounded-xl py-2 font-semibold flex items-center justify-center gap-2">
                <i data-lucide="list" size="16"></i> Lihat Tasks
            </button>
            <a href="EditProjects.html" onclick="editProject(${p.id})" class="text-indigo-600 hover:bg-indigo-50 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
                <i data-lucide="edit" size="16"></i> Edit
            </a>
            <button onclick="deleteProject(${p.id})" class="text-rose-600 hover:bg-rose-50 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
                <i data-lucide="trash-2" size="16"></i> Hapus
            </button>
        </div>
    </div>
    `;
}

/* ===========================
   OPEN TASK PAGE
=========================== */
function openTasks(projectId) {
    window.location.href = `tasks.html?project_id=${projectId}`;
}

/* ===========================
   ADD PROJECT
=========================== */
$("#createProjectForm").on("submit", function (e) {
    e.preventDefault(); // ⛔ cegah reload halaman

    $.ajax({
        url: `${API_URL}/users/project/create`,
        method: "POST",
        headers: getAuthHeader(),
        data: {
            title: $("#title").val(),
            description: $("#description").val(),
            tenggat: $("#tenggat").val(),
            status: $("#status").val()
        },
        success: function () {
            alert("Project berhasil dibuat 🎉");
            window.location.href = "projects.html";
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            alert("Gagal membuat project");
        }
    });
});

/* ===========================
   EDIT PROJECT
=========================== */
function editProject(id) {
    $.ajax({
        url: `${API_URL}/users/project`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            const project = res.data.find(p => p.id === id);

            $("#project_id").val(project.id);
            $("#title").val(project.title);
            $("#description").val(project.description);
            $("#status").val(project.status);
            $("#tenggat").val(project.tenggat);

            $("#modalTitle").text("Edit Project");
            $("#projectModal").removeClass("hidden");
        }
    });
}

/* ===========================
   DELETE PROJECT
=========================== */
function deleteProject(id) {
    if (!confirm("Yakin hapus project ini?")) return;

    $.ajax({
        url: `${API_URL}/users/project/${id}`,
        method: "DELETE",
        headers: getAuthHeader(),
        success: function () {
            loadProjects();
        }
    });
}

/* ===========================
   MODAL HELPER
=========================== */
function closeModal() {
    $("#projectModal").addClass("hidden");
}

function resetForm() {
    $("#project_id").val("");
    $("#title").val("");
    $("#description").val("");
    $("#status").val("");
    $("#tenggat").val("");
}

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    loadProjects();
});
