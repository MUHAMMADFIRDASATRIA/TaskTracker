const API_URL = "http://127.0.0.1:8000/api";

/* ===========================
   LOAD PROFILE HEADER
=========================== */
function loadProfileHeader() {
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
            }
        }
    });
}

/* ===========================
   LOAD PROJECT LIST WITH PROGRESS
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
                    <div class="text-center text-slate-500 py-12">
                        <div class="flex flex-col items-center">
                            <i data-lucide="inbox" size="48" class="text-slate-300 mb-4"></i>
                            <p class="text-lg font-medium">Belum ada project</p>
                        </div>
                    </div>
                `);
                lucide.createIcons();
                return;
            }

            // Load progress untuk setiap project
            res.data.forEach(project => {
                loadTasksForProgress(project);
            });
            
            lucide.createIcons();
        },
        error: function (xhr) {
            if (xhr.status === 401) logout();
        }
    });
}

/* ===========================
   LOAD TASKS TO CALCULATE PROGRESS
=========================== */
function loadTasksForProgress(project) {
    $.ajax({
        url: `${API_URL}/users/project/${project.id}/tasks`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            const tasks = res.data ?? [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.finish).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // Tambah progress ke project object
            project.progress = progress;
            project.tasksInfo = { total: totalTasks, completed: completedTasks };

            // Render card dengan progress yang sudah dihitung
            $("#projectList").append(projectCard(project));
            lucide.createIcons();
        },
        error: function (xhr) {
            console.error("Gagal load tasks untuk project " + project.id);
            // Tetap render card dengan progress 0
            project.progress = 0;
            project.tasksInfo = { total: 0, completed: 0 };
            $("#projectList").append(projectCard(project));
            lucide.createIcons();
        }
    });
}

/* ===========================
   PROJECT CARD TEMPLATE
=========================== */
function projectCard(p) {
    const progress = p.progress || 0; // Default 0% jika tidak ada progress
    const tasksInfo = p.tasksInfo || { total: 0, completed: 0 };
    return `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm">
                <i data-lucide="folder" size="24"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-slate-900 truncate">${p.title}</h3>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-0.5">
                        <i data-lucide="calendar" size="11"></i> 
                        ${p.tenggat ? p.tenggat : 'Belum diset'}
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold capitalize">${p.status || 'pending'}</span>
                </div>
                <p class="text-xs text-slate-600 mt-0.5 line-clamp-1">${p.description || 'Tidak ada deskripsi'}</p>
            </div>
        </div>

        <!-- Progress Section -->
        <div class="bg-slate-50 rounded-lg p-3 space-y-1.5">
            <div class="flex justify-between items-center">
                <span class="text-xs font-semibold text-slate-600 uppercase tracking-wide">Progres</span>
                <span class="text-xs font-bold text-indigo-600">${progress}% (${tasksInfo.completed}/${tasksInfo.total})</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full transition-all duration-500" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
        </div>
        
        <div class="flex gap-1.5 pt-1">
            <button onclick="viewTasks(${p.id})" class="flex-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-1.5 px-2 font-semibold flex items-center justify-center gap-1 transition-colors">
                <i data-lucide="list" size="14"></i> <span class="hidden sm:inline">Lihat</span>
            </button>
            <button onclick="editProject(${p.id})" class="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg py-1.5 px-2 font-semibold flex items-center justify-center gap-1 transition-colors">
                <i data-lucide="edit-2" size="14"></i> <span class="hidden sm:inline">Edit</span>
            </button>
            <button onclick="deleteProject(${p.id})" class="flex-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg py-1.5 px-2 font-semibold flex items-center justify-center gap-1 transition-colors">
                <i data-lucide="trash-2" size="14"></i> <span class="hidden sm:inline">Hapus</span>
            </button>
        </div>
    </div>
    `;
}

/* ===========================
   VIEW TASKS
=========================== */
function viewTasks(projectId) {
    window.location.href = `tasks.html?project_id=${projectId}`;
}

/* ===========================
   CREATE PROJECT
=========================== */
function createProject() {
    window.location.href = "create-project.html";
}

/* ===========================
   EDIT PROJECT
=========================== */
function editProject(id) {
    window.location.href = `EditProjects.html?project_id=${id}`;
}

/* ===========================
   DELETE PROJECT
=========================== */
function deleteProject(id) {
    if (!confirm("Yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.")) return;

    $.ajax({
        url: `${API_URL}/users/project/${id}`,
        method: "DELETE",
        headers: getAuthHeader(),
        success: function () {
            alert("Proyek berhasil dihapus");
            loadProjects();
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            alert("Gagal menghapus proyek");
        }
    });
}

/* ===========================
   GET PROJECT ID FROM URL
=========================== */
function getProjectIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('project_id');
}

/* ===========================
   LOAD PROJECT DATA (FOR EDIT PAGE)
=========================== */
function loadProjectData() {
    const projectId = getProjectIdFromUrl();
    
    if (!projectId) {
        alert("Project ID tidak ditemukan");
        window.location.href = "projects.html";
        return;
    }

    $.ajax({
        url: `${API_URL}/users/project/${projectId}`,
        method: "GET",
        headers: getAuthHeader(),
        success: function(res) {
            console.log("Project Data:", res.data); // Debug
            
            const project = res.data;
            
            // Set hidden input dengan project ID
            $("#edit_project_id").val(projectId);
            
            // Fill form dengan data project
            $("#edit_title").val(project.title);
            $("#edit_description").val(project.description);
            $("#edit_status").val(project.status);
            $("#edit_tenggat").val(project.tenggat);
        },
        error: function(err) {
            console.error("Load Project Error:", err.responseJSON); // Debug
            alert("Gagal memuat data proyek");
            window.location.href = "projects.html";
        }
    });
}

/* ===========================
   HANDLE EDIT PROJECT FORM SUBMIT
=========================== */
function handleEditProjectForm() {
    $("#editProjectForm").on("submit", function(e) {
        e.preventDefault();

        const projectId = $("#edit_project_id").val();
        const title = $("#edit_title").val();
        const description = $("#edit_description").val();
        const status = $("#edit_status").val();
        const tenggat = $("#edit_tenggat").val();

        console.log("Update Project Data:", { projectId, title, description, status, tenggat }); // Debug

        $.ajax({
            url: `${API_URL}/users/project/${projectId}/update`,
            method: "PUT",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                description: description,
                status: status,
                tenggat: tenggat
            }),
            success: function(res) {
                console.log("Update Project Success:", res); // Debug
                alert("Proyek berhasil diperbarui ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Update Project Error:", err.responseJSON); // Debug
                
                let message = "Gagal memperbarui proyek";
                if (err.responseJSON && err.responseJSON.message) {
                    message = err.responseJSON.message;
                } else if (err.responseJSON && err.responseJSON.errors) {
                    message = Object.values(err.responseJSON.errors).join(", ");
                }
                
                alert(message);
            }
        });
    });
}

/* ===========================
   HANDLE DELETE PROJECT (FROM EDIT PAGE)
=========================== */
function handleDeleteProjectButton() {
    $("#btnDeleteProject").on("click", function() {
        const projectId = $("#edit_project_id").val();
        
        if (!confirm("Yakin ingin menghapus proyek ini? Semua tugas akan dihapus permanen dan tidak dapat dipulihkan.")) {
            return;
        }

        $.ajax({
            url: `${API_URL}/users/project/${projectId}`,
            method: "DELETE",
            headers: getAuthHeader(),
            success: function() {
                console.log("Delete Project Success"); // Debug
                alert("Proyek berhasil dihapus ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Delete Project Error:", err.responseJSON); // Debug
                alert("Gagal menghapus proyek");
            }
        });
    });
}

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    // Load profile header di semua halaman (projects, edit, create)
    loadProfileHeader();
    
    // Jika di halaman projects.html - load project list
    if ($("#projectList").length) {
        loadProjects();
    }
    
    // Jika di halaman EditProjects.html - load project data dan setup form
    if ($("#editProjectForm").length) {
        loadProjectData();
        handleEditProjectForm();
        handleDeleteProjectButton();
    }
    
    // Button tambah task -> redirect ke halaman create project
    $("#btnAddTask").on("click", function() {
        window.location.href = "create-project.html";
    });

    // Handle form submit di create-project.html
    $("#createProjectForm").on("submit", function(e) {
        e.preventDefault();

        const title = $("#title").val();
        const description = $("#description").val();
        const status = $("#status").val();
        const tenggat = $("#tenggat").val();

        console.log("Create Project Data:", { title, description, status, tenggat }); // Debug

        $.ajax({
            url: `${API_URL}/users/project/create`,
            method: "POST",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                description: description,
                status: status,
                tenggat: tenggat
            }),
            success: function(res) {
                console.log("Create Project Success:", res); // Debug
                alert("Proyek berhasil dibuat ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Create Project Error:", err.responseJSON); // Debug
                
                let message = "Gagal membuat proyek";
                if (err.responseJSON && err.responseJSON.message) {
                    message = err.responseJSON.message;
                } else if (err.responseJSON && err.responseJSON.errors) {
                    message = Object.values(err.responseJSON.errors).join(", ");
                }
                
                alert(message);
            }
        });
    });
});
