$(document).ready(function () {
    checkAuth();

    /* ======================
       GET PROJECT ID
    ====================== */
    const projectId = new URLSearchParams(window.location.search).get("project_id");
    let projectDeadline = "-";
    let totalTasks = 0;
    let completedTasks = 0;
    let projectProgress = 0;

    

    function updateProjectUI(total, completed, deadlineStr) {
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        const pendingTasks = total - completed;
        const computedStatus = total === 0
            ? "Pending"
            : completed === total
                ? "Completed"
                : "Progress";

        $("#hero-percentage").text(`${percentage}%`);
        $("#stat-completed").text(completed);
        $("#stat-pending").text(pendingTasks);
        $("#badge-total").text(`${total} Tugas`);
        $("#badge-status").text(computedStatus);

        const normalizedDeadline =
            deadlineStr && deadlineStr !== "-"
                ? String(deadlineStr).replace("T", " ").replace(".000000Z", "")
                : "-";

        if (normalizedDeadline !== "-") {
            const [datePart, timePart = ""] = normalizedDeadline.split(" ");
            $("#badge-deadline").text(datePart || normalizedDeadline);
            $("#stat-deadline").text(
                timePart ? `${datePart} ${timePart}` : (datePart || normalizedDeadline)
            );
        } else {
            $("#badge-deadline").text("-");
            $("#stat-deadline").text("-");
        }

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

                $("#hero-title-main").text(project.title);
                $("#badge-status").text(project.status ?? "pending")

                $("#project-description").text(
                    project.description && project.description.trim()
                        ? project.description
                        : "-"
                );
                projectDeadline = project.tenggat ?? "-";
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
                if (user && user.name && $("#header-name").length) {
                    $("#header-name").text(user.name);
                }

                if (!$("#header-avatar").length) {
                    return;
                }

                if (user && user.profile_photo && user.profile_photo.trim() !== "") {
                    $("#header-avatar")
                        .css({
                            "background-image": `url('${user.profile_photo}')`,
                            "background-size": "cover",
                            "background-position": "center",
                            "background-repeat": "no-repeat"
                        })
                        .text("");
                } else {
                    const initial = user && user.name ? user.name.charAt(0).toUpperCase() : "U";
                    $("#header-avatar")
                        .css("background-image", "none")
                        .text(initial);
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

                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const sortedTasks = tasks
                    .slice()
                    .sort((a, b) => {
                        const aDone = a.finish ? 1 : 0;
                        const bDone = b.finish ? 1 : 0;

                        if (aDone !== bDone) {
                            return aDone - bDone;
                        }

                        const aPriority = (a.priority || "medium").toLowerCase();
                        const bPriority = (b.priority || "medium").toLowerCase();
                        const aRank = priorityOrder[aPriority] ?? 1;
                        const bRank = priorityOrder[bPriority] ?? 1;

                        if (aRank !== bRank) {
                            return aRank - bRank;
                        }

                        return (b.id || 0) - (a.id || 0);
                    });

                sortedTasks.forEach(task => {
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
        const priority = $("#priority").val();

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
                finish: finish,
                priority: priority
            },
            success: function () {

                $("#createTaskForm")[0].reset();
                alert("Task berhasil ditambahkan");

                window.location.href = `tasks.html?project_id=${projectId}`;
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
    function updateTask(taskId, data, shouldRefreshPage = false) {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks/${taskId}`,
            method: "PUT",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                if (shouldRefreshPage) {
                    window.location.reload();
                    return;
                }
                    loadTasks();
                    loadProject();
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
        const priorityKey = (task.priority || "medium").toLowerCase();
        const priorityMeta = {
            high: {
                label: "High",
                pill: "bg-gradient-to-r from-rose-600/30 to-rose-500/10 text-rose-200 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
                dot: "bg-rose-400"
            },
            medium: {
                label: "Medium",
                pill: "bg-gradient-to-r from-amber-500/30 to-amber-400/10 text-amber-200 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
                dot: "bg-amber-400"
            },
            low: {
                label: "Low",
                pill: "bg-gradient-to-r from-emerald-500/30 to-emerald-400/10 text-emerald-200 border border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
                dot: "bg-emerald-400"
            }
        };
        const priority = priorityMeta[priorityKey] || priorityMeta.medium;
        
        // Format status badge styling
        const statusText = isCompleted ? 'Selesai' : 'Sedang Berjalan';
        const statusClass = isCompleted 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';

        // Format date
        const dateStr = task.tenggat || '-';

        return `
        <div class="task-item group relative bg-slate-800/40 border border-slate-700/50 rounded-lg p-2 transition-all hover:border-slate-600/50 hover:bg-slate-800/60">
            <div class="flex items-start gap-2">
                <!-- Checkbox -->
                <div class="shrink-0 mt-0.5">
                    <input type="checkbox" class="task-finish w-4 h-4 rounded border-2 border-slate-600 bg-slate-700/50 checked:bg-cyan-500 checked:border-cyan-500 cursor-pointer transition-all" data-id="${task.id}" ${isCompleted ? "checked" : ""}>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h4 class="font-semibold text-sm text-slate-200 mb-0.5 ${isCompleted ? 'line-through opacity-60' : ''}">
                        ${task.title}
                    </h4>

                    <!-- Description -->
                    ${task.description ? `
                        <p class="text-xs text-slate-400 mb-1.5 leading-relaxed ${isCompleted ? 'line-through opacity-50' : ''}">
                            ${task.description}
                        </p>
                    ` : ''}

                    <!-- Meta Info Row -->
                    <div class="flex items-center gap-2 text-[11px]">
                        <div class="flex items-center gap-1">
                            <i data-lucide="check-circle" size="12" class="${isCompleted ? 'text-emerald-400' : 'text-blue-400'}"></i>
                            <span class="px-1.5 py-0.5 rounded ${statusClass} text-[10px] font-medium">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Priority Badge & Actions -->
                <div class="shrink-0 flex items-start gap-1">
                    <!-- Priority Badge -->
                    <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight ${priority.pill}">
                        <span class="inline-flex items-center gap-1">
                            <span class="w-1 h-1 rounded-full ${priority.dot}"></span>
                            ${priority.label}
                        </span>
                    </span>

                    <!-- Actions (show on hover) -->
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="btn-edit p-0.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" data-id="${task.id}">
                            <i data-lucide="edit-3" size="12"></i>
                        </button>
                        <button class="btn-delete p-0.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all" data-id="${task.id}">
                            <i data-lucide="trash-2" size="12"></i>
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
       LOAD TASK FOR EDITING
    ====================== */
    function loadTaskData(editTaskId, editProjectId) {
        $.ajax({
            url: `${API_URL}/users/project/${editProjectId}/tasks`,
            method: "GET",
            headers: getAuthHeader(),
            success: function (res) {
                const tasks = res.data || [];
                const task = tasks.find(t => t.id == editTaskId);

                if (!task) {
                    alert("Task tidak ditemukan");
                    return;
                }

                // Populate form
                $("#task_id").val(task.id);
                $("#task_title").val(task.title);
                $("#notes").val(task.description);
                $("#deadline").val(task.tenggat);
                $("#priority").val(task.priority || "medium");
                $("#finish").prop("checked", task.finish);
                
                // Update badge
                $("#task-id-badge").text(`#TASK-${task.id}`);
            },
            error: function (xhr) {
                console.error("Load Task Error:", xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses ke task ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal memuat data task");
            }
        });
    }

    /* ======================
       HANDLE EDIT TASK FORM SUBMIT
    ====================== */
    $("#editTaskForm").on("submit", function (e) {
        e.preventDefault();

        const title = $("#task_title").val().trim();
        const description = $("#notes").val().trim();
        const tenggat = $("#deadline").val();
        const finish = $("#finish").is(":checked");
        const priority = $("#priority").val();

        if (!title) {
            alert("Judul task tidak boleh kosong");
            return;
        }

        const data = {
            title: title,
            description: description,
            finish: finish,
            priority: priority
        };

        if (tenggat) {
            data.tenggat = tenggat;
        }

        $.ajax({
            url: `${API_URL}/users/project/${editProjectId}/tasks/${editTaskId}`,
            method: "PUT",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("Update Task Success:", res);
                
                // Show success modal
                $("#successModal").removeClass("hidden").addClass("flex");
                $("#btn-back-to-list").on("click", function() {
                    window.location.href = `tasks.html?project_id=${editProjectId}`;
                });
                
                // Auto redirect after 2 seconds
                setTimeout(function() {
                    window.location.href = `tasks.html?project_id=${editProjectId}`;
                }, 2000);
            },
            error: function (xhr) {
                console.error("Update Task Error:", xhr.responseText);
                if (xhr.status === 403) {
                    alert("Anda tidak memiliki akses untuk mengubah task ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal memperbarui task");
            }
        });
    });

    /* ======================
       CHECK IF ON EDIT PAGE AND LOAD DATA
    ====================== */
    const urlParams = new URLSearchParams(window.location.search);
    const editTaskId = urlParams.get('task_id');
    const editProjectId = urlParams.get('project_id') || projectId;

    if (editTaskId && editProjectId) {
        // On edit page, load task data
        loadTaskData(editTaskId, editProjectId);
    }

    /* ======================
       INIT
    ====================== */
    loadProject();
    loadTasks();

});