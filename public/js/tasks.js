$(document).ready(function () {
    checkAuth();

    /* ======================
       GET PROJECT ID
    ====================== */
    const projectId = new URLSearchParams(window.location.search).get("project_id");
    let projectDeadline = "-";
    let totalTasks = 0;
    let completedTasks = 0;

    function updateProjectUI(total, completed, deadlineStr) {
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        const pendingTasks = total - completed;

        $("#hero-percentage").text(`${percentage}%`);
        $("#stat-completed").text(completed);
        $("#stat-pending").text(pendingTasks);
        $("#stat-deadline").text(deadlineStr);
        $("#badge-deadline").text(deadlineStr);
        $("#badge-total").text(`${total} Tugas`);

        const circle = document.getElementById("progress-ring");
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    if (!projectId) {
        alert("Project ID tidak ditemukan");
        return;
    }

    $("#btn-add-task").attr(
        "href",
        `createTask.html?project_id=${projectId}`
    );


    /* ======================
       LOAD PROJECT DETAIL
    ====================== */
    function loadProject() {
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
                projectDeadline = project.tenggat ?? "-";
                $("#badge-status").text(project.status ?? "-");
                updateProjectUI(totalTasks, completedTasks, projectDeadline);
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses ke proyek ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal mengambil detail project");
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
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 401) {
                    logout();
                } else {
                    alert("Gagal memuat data profil");
                }
            }
        });
    }


    /* ======================
       LOAD TASKS
    ====================== */
    function loadTasks() {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks`,
            method: "GET",
            headers: getAuthHeader(),
            success: function (res) {

                const tasks = res.data ?? [];
                const container = $("#tasks-list-container");

                container.empty();

                if (tasks.length === 0) {
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

                totalTasks = tasks.length;
                completedTasks = tasks.filter(t => t.finish).length;
                updateProjectUI(totalTasks, completedTasks, projectDeadline);
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses ke tugas proyek ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal mengambil tasks");
            }
        });
    }


    /* ======================
       CREATE TASK
    ====================== */
    $("#createTaskForm").on("submit", function (e) {
        e.preventDefault();

        const title = $("#task_title").val().trim();
        const notes = $("#notes").val();
        const finish = $("#finish").is(":checked");

        if (!title) {
            alert("Judul task wajib diisi");
            return;
        }

        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/create`,
            method: "POST",
            headers: getAuthHeader(),
            data: {
                title: title,
                description: notes,
                finish: finish
            },
            success: function () {

                $("#createTaskForm")[0].reset();
                alert("Task berhasil ditambahkan");

                loadTasks(); // reload task saja
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses untuk menambahkan tugas di proyek ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal menambahkan task");
            }
        });
    });


    /* ======================
       UPDATE TASK
    ====================== */
    function updateTask(taskId, data) {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/${taskId}`,
            method: "PUT",
            headers: getAuthHeader(),
            data: data,
            success: function () {
                loadTasks();
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses untuk mengubah tugas ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal update task");
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
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses untuk menghapus tugas ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal hapus task");
            }
        });
    }


    /* ======================
       RENDER TASK
    ====================== */
    function renderTask(task) {
        return `
        <div class="p-4 flex items-start gap-4">
            <div class="pt-1">
                <input type="checkbox" class="task-finish h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" data-id="${task.id}" ${task.finish ? "checked" : ""}>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-800">${task.title}</p>
                <p class="text-sm text-slate-500">
                    ${task.description ? task.description : "-"}
                </p>
                <p class="text-xs text-slate-400 mt-1">
                    ${task.finish ? "Selesai" : "Belum selesai"}
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
        .on("change", ".task-finish", function () {
            const taskId = $(this).data("id");
            const finish = $(this).is(":checked");

            updateTask(taskId, { finish: finish });
        })
        .on("click", ".btn-delete", function () {
            deleteTask($(this).data("id"));
        })
        .on("click", ".btn-edit", function () {
            const taskId = $(this).data("id");
            window.location.href = `EditTask.html?task_id=${taskId}&project_id=${projectId}`;
        });


    /* ======================
       INIT
    ====================== */
    loadProject();
    loadTasks();

});
