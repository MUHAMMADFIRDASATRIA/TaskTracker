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
                
                // Jika ada foto profile, tampilkan foto
                if (user.profile_photo && user.profile_photo.trim() !== "") {
                    $("#header-avatar")
                        .css({
                            "background-image": `url('${user.profile_photo}')`,
                            "background-size": "cover",
                            "background-position": "center"
                        })
                        .text("");
                } else {
                    // Jika tidak ada foto, tampilkan inisial
                    $("#header-avatar").text(user.name.charAt(0).toUpperCase());
                }
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
                        <div class="p-8 text-center">
                            <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-800/50 rounded-full mb-4 border border-slate-700/50">
                                <i data-lucide="inbox" size="24" class="text-slate-500"></i>
                            </div>
                            <p class="text-slate-400 text-sm font-medium mb-1">Belum ada tugas</p>
                            <p class="text-slate-500 text-xs">Tambahkan tugas pertama Anda untuk memulai</p>
                        </div>
                    `);
                    lucide.createIcons();
                    return;
                }

                tasks.forEach(task => {
                    container.append(renderTask(task));
                });

                // Reinitialize Lucide icons for dynamically added content
                lucide.createIcons();

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
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                loadTasks();
            },
            error: function (xhr) {
                console.error("Update Task Error:", xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses untuk mengubah tugas ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal memperbarui task");
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
       RENDER TASK - UPDATED
    ====================== */
    function renderTask(task) {
        const isCompleted = task.finish;
        
        // Priority Styling logic
        const priority = (task.priority || "Sedang").toLowerCase();
        const pStyles = {
            'tinggi': 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
            'sedang': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
            'rendah': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        };
        const pClass = pStyles[priority] || pStyles['sedang'];
        
        // Format status badge styling
        const statusText = isCompleted ? 'Selesai' : 'Sedang Berjalan';
        const statusClass = isCompleted 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';

        // Format date
        const dateStr = task.tenggat || '-';

        return `
        <div class="task-item group relative bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 transition-all hover:border-slate-600/50 hover:bg-slate-800/60">
            <div class="flex items-start gap-4">
                <!-- Checkbox -->
                <div class="shrink-0 mt-1">
                    <input type="checkbox" class="task-finish w-5 h-5 rounded border-2 border-slate-600 bg-slate-700/50 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer transition-all" data-id="${task.id}" ${isCompleted ? "checked" : ""}>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h4 class="font-semibold text-base text-slate-200 mb-1 ${isCompleted ? 'line-through opacity-60' : ''}">
                        ${task.title}
                    </h4>

                    <!-- Description -->
                    ${task.description ? `
                        <p class="text-sm text-slate-400 mb-3 leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}">
                            ${task.description}
                        </p>
                    ` : ''}

                    <!-- Meta Info Row -->
                    <div class="flex items-center gap-3 text-xs">
                        <div class="flex items-center gap-1.5 text-slate-500">
                            <i data-lucide="calendar" size="14"></i>
                            <span>${dateStr}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <i data-lucide="check-circle" size="14" class="${isCompleted ? 'text-emerald-400' : 'text-blue-400'}"></i>
                            <span class="px-2 py-0.5 rounded ${statusClass} text-xs font-medium">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Priority Badge & Actions -->
                <div class="shrink-0 flex items-start gap-2">
                    <!-- Priority Badge -->
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${pClass}">
                        ${priority}
                    </span>

                    <!-- Actions (show on hover) -->
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="btn-edit p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" data-id="${task.id}">
                            <i data-lucide="edit-3" size="13"></i>
                        </button>
                        <button class="btn-delete p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all" data-id="${task.id}">
                            <i data-lucide="trash-2" size="13"></i>
                        </button>
                    </div>
                </div>
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