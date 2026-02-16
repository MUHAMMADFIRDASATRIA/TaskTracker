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
                    <div class="text-center text-slate-400 py-12">
                        <div class="flex flex-col items-center">
                            <div class="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                                <i data-lucide="inbox" size="40" class="text-slate-600"></i>
                            </div>
                            <p class="text-lg font-semibold text-slate-300 mb-2">Belum ada proyek</p>
                            <p class="text-sm text-slate-500">Mulai dengan membuat proyek baru</p>
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
   PROJECT CARD TEMPLATE - HORIZONTAL LIST LAYOUT
=========================== */
function projectCard(p) {
    const progress = p.progress || 0;
    const tasksInfo = p.tasksInfo || { total: 0, completed: 0 };
    
    // Status color mapping
    const statusColors = {
        'pending': { bg: 'from-slate-600 to-slate-700', text: 'text-slate-300', dot: 'bg-slate-500' },
        'in progress': { bg: 'from-cyan-600 to-blue-600', text: 'text-cyan-300', dot: 'bg-cyan-500' },
        'completed': { bg: 'from-emerald-600 to-teal-600', text: 'text-emerald-300', dot: 'bg-emerald-500' },
        'on hold': { bg: 'from-amber-600 to-orange-600', text: 'text-amber-300', dot: 'bg-amber-500' }
    };
    
    const statusInfo = statusColors[p.status?.toLowerCase()] || statusColors['pending'];
    
    // Progress color based on percentage
    let progressColor = 'from-rose-500 to-pink-600';
    if (progress >= 75) progressColor = 'from-emerald-500 to-teal-600';
    else if (progress >= 50) progressColor = 'from-cyan-500 to-blue-600';
    else if (progress >= 25) progressColor = 'from-amber-500 to-orange-600';
    
    return `
    <div class="card-dark rounded-xl border border-slate-700/50 shadow-lg overflow-hidden card-hover fade-in relative group">
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
        
        <!-- Card Content - Horizontal Layout -->
        <div class="relative z-10 p-4 flex items-center gap-4">
            
            <!-- Left: Icon & Status Indicator -->
            <div class="flex items-center gap-3 flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br ${statusInfo.bg} rounded-lg flex items-center justify-center text-white shadow-lg">
                    <i data-lucide="folder" size="20"></i>
                </div>
            </div>

            <!-- Center: Project Info -->
            <div class="flex-1 min-w-0 space-y-2">
                <!-- Title & Status & Deadline -->
                <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-base font-bold text-slate-100">${p.title}</h3>
                    <div class="flex items-center gap-2">
                        <div class="w-1 h-1 rounded-full ${statusInfo.dot}"></div>
                        <span class="text-xs font-semibold ${statusInfo.text} capitalize">
                            ${p.status || 'pending'}
                        </span>
                    </div>
                    ${p.tenggat ? `
                    <div class="flex items-center gap-1.5 text-slate-500 ml-auto">
                        <i data-lucide="calendar" size="12"></i>
                        <span class="text-xs font-medium">${p.tenggat}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Description -->
                <p class="text-sm text-slate-400 line-clamp-1">${p.description || 'Tidak ada deskripsi'}</p>
            </div>

            <!-- Center-Right: Progress Info -->
            <div class="hidden lg:flex items-center gap-4 flex-shrink-0 px-4 border-l border-slate-700/50">
                <!-- Circular Progress -->
                <div class="relative w-14 h-14">
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="3" fill="transparent" class="text-slate-700" />
                        <circle cx="28" cy="28" r="24" stroke="url(#grad-${p.id})" stroke-width="3" fill="transparent" 
                            stroke-dasharray="150.8" stroke-dashoffset="${150.8 - (150.8 * progress / 100)}" stroke-linecap="round" class="transition-all duration-500" />
                        <defs>
                            <linearGradient id="grad-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-xs font-bold ${statusInfo.text}">${progress}%</span>
                    </div>
                </div>
                
                <!-- Task Stats -->
                <div class="text-right">
                    <p class="text-xs text-slate-500 mb-0.5">Progress</p>
                    <p class="text-sm font-bold text-slate-300">${tasksInfo.completed}<span class="text-slate-500 font-normal">/${tasksInfo.total}</span></p>
                </div>
            </div>
            
            <!-- Right: Minimalist Action Menu -->
            <div class="flex items-center gap-1 flex-shrink-0 ml-2">
                <button onclick="viewTasks(${p.id})" class="w-7 h-7 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-all flex items-center justify-center" title="Lihat Detail">
                    <i data-lucide="eye" size="14"></i>
                </button>
                <button onclick="editProject(${p.id})" class="w-7 h-7 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-all flex items-center justify-center" title="Edit Proyek">
                    <i data-lucide="pencil" size="14"></i>
                </button>
                <button onclick="deleteProject(${p.id})" class="w-7 h-7 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded transition-all flex items-center justify-center" title="Hapus Proyek">
                    <i data-lucide="trash-2" size="14"></i>
                </button>
            </div>
        </div>
        
        <!-- Bottom: Progress Bar (Mobile & Tablet) -->
        <div class="lg:hidden px-4 pb-3">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-slate-500 font-medium">Progress</span>
                <span class="text-xs font-semibold ${statusInfo.text}">${progress}% · ${tasksInfo.completed}/${tasksInfo.total}</span>
            </div>
            <div class="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r ${progressColor} h-full transition-all duration-500" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
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
            if (xhr.status === 403) {
                alert("Anda tidak memiliki akses untuk menghapus proyek ini");
                loadProjects();
                return;
            }
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
   GET OPEN PROJECT ID (FROM DASHBOARD)
=========================== */
function getOpenProjectIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('open');
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
            console.log("Project Data:", res.data);
            
            const project = res.data;
            
            $("#edit_project_id").val(projectId);
            $("#edit_title").val(project.title);
            $("#edit_description").val(project.description);
            $("#edit_status").val(project.status);
            $("#edit_tenggat").val(project.tenggat);
        },
        error: function(err) {
            console.error("Load Project Error:", err.responseJSON);
            if (err.status === 403) {
                alert("Anda tidak memiliki akses ke proyek ini");
                window.location.href = "projects.html";
                return;
            }
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

        console.log("Update Project Data:", { projectId, title, description, status, tenggat });

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
                console.log("Update Project Success:", res);
                alert("Proyek berhasil diperbarui ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Update Project Error:", err.responseJSON);
                
                let message = "Gagal memperbarui proyek";
                if (err.status === 403) {
                    alert("Anda tidak memiliki akses untuk mengubah proyek ini");
                    window.location.href = "projects.html";
                    return;
                }
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
                console.log("Delete Project Success");
                alert("Proyek berhasil dihapus ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Delete Project Error:", err.responseJSON);
                if (err.status === 403) {
                    alert("Anda tidak memiliki akses untuk menghapus proyek ini");
                    window.location.href = "projects.html";
                    return;
                }
                alert("Gagal menghapus proyek");
            }
        });
    });
}

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    checkAuth();

    loadProfileHeader();

    const openProjectId = getOpenProjectIdFromUrl();
    if (openProjectId) {
        window.location.href = `tasks.html?project_id=${openProjectId}`;
        return;
    }
    
    if ($("#projectList").length) {
        loadProjects();
    }
    
    if ($("#editProjectForm").length) {
        loadProjectData();
        handleEditProjectForm();
        handleDeleteProjectButton();
    }
    
    $("#btnAddTask").on("click", function() {
        window.location.href = "create-project.html";
    });

    $("#createProjectForm").on("submit", function(e) {
        e.preventDefault();

        const title = $("#title").val();
        const description = $("#description").val();
        const status = $("#status").val();
        const tenggat = $("#tenggat").val();

        console.log("Create Project Data:", { title, description, status, tenggat });

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
                console.log("Create Project Success:", res);
                alert("Proyek berhasil dibuat ✅");
                window.location.href = "projects.html";
            },
            error: function(err) {
                console.error("Create Project Error:", err.responseJSON);
                
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