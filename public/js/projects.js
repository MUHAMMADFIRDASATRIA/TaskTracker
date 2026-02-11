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
}

/* ===========================
   PROJECT CARD TEMPLATE
=========================== */
function projectCard(p) {
    return `
    <div class="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
        <h3 class="text-lg font-semibold text-slate-800 mb-1">
            ${p.title}
        </h3>
        <p class="text-sm text-slate-500 mb-3">
            ${p.description ?? '-'}
        </p>

        <div class="flex justify-between items-center text-sm">
            <span class="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600">
                ${p.status}
            </span>

            <div class="flex gap-2">
                <button onclick="editProject(${p.id})"
                    class="text-indigo-600 hover:underline">
                    Edit
                </button>
                <button onclick="deleteProject(${p.id})"
                    class="text-red-600 hover:underline">
                    Hapus
                </button>
            </div>
        </div>

        <button onclick="openTasks(${p.id})"
            class="mt-4 w-full text-sm bg-slate-100
                   hover:bg-slate-200 rounded-lg py-2">
            Lihat Tasks →
        </button>
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
$("#btnAdd").click(function () {
    resetForm();
    $("#modalTitle").text("New Project");
    $("#projectModal").removeClass("hidden");
});

$("#saveProject").click(function () {
    const id = $("#project_id").val();
    const method = id ? "PUT" : "POST";
    const url = id
        ? `${API_URL}/users/project/${id}/update`
        : `${API_URL}/users/project/create`;

    $.ajax({
        url,
        method,
        headers: getAuthHeader(),
        data: {
            title: $("#title").val(),
            description: $("#description").val(),
            status: $("#status").val(),
            tenggat: $("#tenggat").val()
        },
        success: function () {
            closeModal();
            loadProjects();
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
