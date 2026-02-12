const API_URL = "http://127.0.0.1:8000/api";

$(document).ready(function () {
    const projectId = new URLSearchParams(window.location.search).get("project_id");

    if (!projectId) {
        alert("Project ID tidak ditemukan");
        return;
    }

function loadTasks() {

    /* =====================
       LOAD TASKS
    ===================== */
    $.ajax({
        url: `${API_URL}/users/project/${projectId}/tasks`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {

            const tasks = res.data ?? [];
            const container = $("#tasks-list-container");
            container.empty();

            const total = tasks.length;
            const finished = tasks.filter(t => t.finish == 1).length;
            const percent = total === 0 ? 0 : Math.round((finished / total) * 100);

            // HERO TASK INFO
            $("#hero-tasks-count").text(total);
            $("#hero-progress").text(`${percent}% selesai`);

            if (total === 0) {
                container.html(`
                    <div class="p-6 text-sm text-slate-400 text-center">
                        Belum ada task
                    </div>
                `);
                return;
            }

            tasks.forEach(task => {
                container.append(renderTask(task));
            });
        },
        error: function (xhr) {
            console.log(xhr.responseText);
            alert("Gagal mengambil tasks");
        }
    });

    /* =====================
       LOAD PROJECT DETAIL
    ===================== */
    $.ajax({
        url: `${API_URL}/users/project/${projectId}`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {

            const project = res.data;

            $("#project-name").text(project.title);
            $("#hero-title-main").text(project.title);

            $("#project-description").text(
                project.description && project.description.trim()
                    ? project.description
                    : "-"
            );

            // HERO TENGGAT
            $("#hero-deadline").text(
                project.tenggat ? project.tenggat : "-"
            );
        }
    });
}


    /* ======================
       CREATE TASK
    ====================== */
    function createTask(data) {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/create`,
            method: "POST",
            headers: getAuthHeader(),
            data,
            success: function () {
                loadTasks();
            }
        });
    }

    /* ======================
       UPDATE TASK
    ====================== */
    function updateTask(taskId, data) {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/${taskId}`,
            method: "PUT",
            headers: getAuthHeader(),
            data,
            success: function () {
                loadTasks();
            }
        });
    }

    /* ======================
       DELETE TASK
    ====================== */
    function deleteTask(taskId) {
        if (!confirm("Yakin hapus task ini?")) return;

        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/${taskId}`,
            method: "DELETE",
            headers: getAuthHeader(),
            success: function () {
                loadTasks();
            }
        });
    }

    /* ======================
       RENDER TASK
    ====================== */
    function renderTask(task) {
        return `
        <div class="p-4 flex justify-between items-start gap-4 border-b">
            <div>
                <p class="font-semibold text-slate-800">${task.title}</p>
                <p class="text-sm text-slate-500">${task.description ?? "-"}</p>
                <p class="text-xs text-slate-400 mt-1">
                    Status: ${task.finish ? "Selesai" : "Belum selesai"}
                </p>
            </div>
            <div class="flex gap-2">
                <button class="btn-edit text-indigo-600 text-sm" data-id="${task.id}">
                    Edit
                </button>
                <button class="btn-delete text-rose-600 text-sm" data-id="${task.id}">
                    Hapus
                </button>
            </div>
        </div>`;
    }

    /* ======================
       EVENTS
    ====================== */
    $("#tasks-list-container")
        .on("click", ".btn-delete", function () {
            deleteTask($(this).data("id"));
        })
        .on("click", ".btn-edit", function () {
            const taskId = $(this).data("id");
            const title = prompt("Judul baru:");
            if (!title) return;

            updateTask(taskId, { title });
        });

    /* ======================
       INIT
    ====================== */
    loadTasks();
});
