const API_URL = "http://127.0.0.1:8000/api";

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
   INIT
=========================== */
$(document).ready(function () {
    loadProjects();
    
    // Button tambah task -> redirect ke halaman create project
    $("#btnAddTask").on("click", function() {
        window.location.href = "create-project.html";
    });
});
