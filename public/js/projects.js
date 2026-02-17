/* ===========================
   GLOBAL VARIABLES
=========================== */
let allProjects = []; // Store all projects for search filtering
let currentFilter = "all";
let currentSearch = "";

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
            const projects = res.data ?? [];
            allProjects = projects; // Store globally for search
            applyFilters();
        },
        error: function (xhr) {
            $("#projectList").html('<div class="py-20 text-center text-rose-500">Gagal memuat data proyek.</div>');
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
   PROJECT ROW TEMPLATE
=========================== */
function projectCard(p) {
    const progress = p.progress || 0;
    const tasks = p.tasksInfo || { total: 0, completed: 0 };
    
    // Status Badges
    const statusMap = {
        'pending': 'bg-slate-500/10 text-slate-500',
        'in progress': 'bg-cyan-500/10 text-cyan-500',
        'progress': 'bg-cyan-500/10 text-cyan-500',
        'completed': 'bg-emerald-500/10 text-emerald-500',
        'on hold': 'bg-amber-500/10 text-amber-500'
    };
    const sClass = statusMap[p.status?.toLowerCase()] || statusMap['pending'];

    return `
    <div class="project-row grid grid-cols-[1.5fr_1fr_1fr_0.5fr] gap-4 px-8 py-5 bg-transparent border-b border-slate-800/20 items-center fade-in hover:bg-slate-900/30 transition-all group">
        <!-- Identitas -->
        <div class="flex items-center gap-4 min-w-0">
            <div class="w-10 h-10 shrink-0 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                <i data-lucide="folder" size="18"></i>
            </div>
            <div class="min-w-0">
                <h3 class="text-sm font-bold text-slate-200 truncate mb-1">${p.title}</h3>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${sClass} border border-current opacity-70">
                        ${p.status || 'Pending'}
                    </span>
                    <span class="text-[10px] text-slate-600 font-medium truncate">${p.description || 'Tidak ada deskripsi proyek'}</span>
                </div>
            </div>
        </div>

        <!-- Progres -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span class="text-slate-500">${tasks.completed}/${tasks.total} Tugas</span>
                <span class="text-cyan-400">${progress}%</span>
            </div>
            <div class="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-600 to-blue-500 h-full transition-all duration-500" style="width: ${progress}%; box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);"></div>
            </div>
        </div>

        <!-- Deadline -->
        <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 text-slate-300">
                <i data-lucide="calendar" size="14" class="text-slate-600"></i>
                <span class="text-xs font-bold">${p.tenggat || 'N/A'}</span>
            </div>
            <span class="text-[10px] text-slate-600 font-medium uppercase tracking-widest ml-5">Tenggat Akhir</span>
        </div>

        <!-- Kontrol -->
        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="viewTasks(${p.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Buka Proyek">
                <i data-lucide="external-link" size="16"></i>
            </button>
            <button onclick="editProject(${p.id})" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all" title="Edit">
                <i data-lucide="settings" size="16"></i>
            </button>
        </div>
    </div>
    `;
}

/* ===========================
   SEARCH PROJECTS
=========================== */
function searchProjects(keyword) {
    currentSearch = keyword.toLowerCase().trim();
    applyFilters();
}

function normalizeStatus(status) {
    const value = (status || "").toLowerCase();
    if (value === "in progress") {
        return "progress";
    }
    return value;
}

function applyFilters() {
    const filtered = allProjects.filter(project => {
        const title = (project.title || "").toLowerCase();
        const description = (project.description || "").toLowerCase();
        const status = normalizeStatus(project.status);

        const matchSearch = !currentSearch
            || title.includes(currentSearch)
            || description.includes(currentSearch)
            || status.includes(currentSearch);

        const matchStatus = currentFilter === "all" || status === currentFilter;

        return matchSearch && matchStatus;
    });

    renderProjectList(filtered);
}

function renderProjectList(projects) {
    $("#projectList").empty();
    $("#project-count").text(`${projects.length} Proyek Ditemukan`);

    if (projects.length === 0) {
        $("#projectList").html(`
            <div class="py-24 text-center">
                <i data-lucide="search-x" size="48" class="text-slate-700 mx-auto mb-4"></i>
                <h3 class="text-lg font-bold text-slate-400">Tidak ada proyek yang cocok</h3>
                <p class="text-sm text-slate-600">Coba kata kunci lain atau kosongkan pencarian.</p>
            </div>
        `);
        lucide.createIcons();
        return;
    }

    projects.forEach(project => {
        loadTasksForProgress(project);
    });
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
            $("#edit_tenggat").val(project.tenggat);
            
            // Display status as badge (read-only)
            const statusMap = {
                'pending': { class: 'bg-slate-500/10 text-slate-400 border border-slate-500/20', label: 'Pending' },
                'in progress': { class: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', label: 'In Progress' },
                'completed': { class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', label: 'Completed' }
            };
            const status = project.status?.toLowerCase() || 'pending';
            const statusStyle = statusMap[status] || statusMap['pending'];
            $("#edit_status").removeClass().addClass(`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusStyle.class}`).text(statusStyle.label);
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
        const tenggat = $("#edit_tenggat").val();

        console.log("Update Project Data:", { projectId, title, description, tenggat });

        $.ajax({
            url: `${API_URL}/users/project/${projectId}/update`,
            method: "PUT",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                description: description,
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

    // Search functionality
    $("#searchProject").on("input", function() {
        const keyword = $(this).val();
        searchProjects(keyword);
    });

    $(".project-filter").on("click", function() {
        $(".project-filter").removeClass("tab-active").addClass("text-slate-500");
        $(this).addClass("tab-active").removeClass("text-slate-500");
        currentFilter = $(this).data("status") || "all";
        applyFilters();
    });

    $("#createProjectForm").on("submit", function(e) {
        e.preventDefault();

        const title = $("#title").val();
        const description = $("#description").val();
        const tenggat = $("#tenggat").val();

        console.log("Create Project Data:", { title, description, tenggat });

        $.ajax({
            url: `${API_URL}/users/project/create`,
            method: "POST",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify({
                title: title,
                description: description,
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