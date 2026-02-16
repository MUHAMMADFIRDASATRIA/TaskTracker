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
   LOAD DASHBOARD STATS
=========================== */
function loadDashboardStats() {
    $.ajax({
        url: `${API_URL}/users/project`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            const projects = res.data;
            
            // Calculate stats
            let totalProjects = projects.length;
            let totalTasks = 0;
            let completedTasks = 0;
            let pendingTasks = 0;
            
            // We'll need to fetch tasks for each project to get accurate counts
            // For now, let's render stats with project data
            renderStatsCards({
                totalProjects: totalProjects,
                activeProjects: projects.filter(p => p.status === 'in progress').length,
                totalTasks: totalTasks,
                completedTasks: completedTasks
            });
            
            // Load tasks for all projects
            loadAllTasks(projects);
        },
        error: function (xhr) {
            if (xhr.status === 401) logout();
        }
    });
}

/* ===========================
   LOAD ALL TASKS FROM ALL PROJECTS
=========================== */
function loadAllTasks(projects) {
    let allTasks = [];
    let completedRequests = 0;
    
    if (projects.length === 0) {
        renderTaskTable([]);
        return;
    }
    
    projects.forEach(project => {
        $.ajax({
            url: `${API_URL}/users/project/${project.id}/tasks`,
            method: "GET",
            headers: getAuthHeader(),
            success: function (res) {
                const tasks = res.data || [];
                // Add project info to each task
                tasks.forEach(task => {
                    task.projectTitle = project.title;
                    task.projectId = project.id;
                });
                allTasks = allTasks.concat(tasks);
            },
            error: function (xhr) {
                console.error("Failed to load tasks for project " + project.id);
            },
            complete: function() {
                completedRequests++;
                
                // When all requests complete
                if (completedRequests === projects.length) {
                    // Update stats with actual task data
                    const totalTasks = allTasks.length;
                    const completedTasks = allTasks.filter(t => t.finish).length;
                    const pendingTasks = totalTasks - completedTasks;
                    
                    renderStatsCards({
                        totalProjects: projects.length,
                        activeProjects: projects.filter(p => p.status === 'in progress').length,
                        totalTasks: totalTasks,
                        completedTasks: completedTasks,
                        pendingTasks: pendingTasks
                    });
                    
                    // Render task table (show recent 10 tasks)
                    renderTaskTable(allTasks.slice(0, 10));
                }
            }
        });
    });
}

/* ===========================
   RENDER STATS CARDS
=========================== */
function renderStatsCards(stats) {
    const completionRate = stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0;
    
    const cards = [
        {
            title: "Total Proyek",
            value: stats.totalProjects,
            icon: "folder",
            gradient: "from-cyan-600 to-blue-600",
            iconBg: "bg-cyan-600/20",
            iconColor: "text-cyan-400",
            subtext: `${stats.activeProjects} aktif`
        },
        {
            title: "Total Tugas",
            value: stats.totalTasks,
            icon: "list-checks",
            gradient: "from-blue-600 to-purple-600",
            iconBg: "bg-blue-600/20",
            iconColor: "text-blue-400",
            subtext: "Semua tugas"
        },
        {
            title: "Tugas Selesai",
            value: stats.completedTasks,
            icon: "check-circle",
            gradient: "from-emerald-600 to-teal-600",
            iconBg: "bg-emerald-600/20",
            iconColor: "text-emerald-400",
            subtext: `${completionRate}% selesai`
        },
        {
            title: "Tugas Pending",
            value: stats.pendingTasks || (stats.totalTasks - stats.completedTasks),
            icon: "clock",
            gradient: "from-amber-600 to-orange-600",
            iconBg: "bg-amber-600/20",
            iconColor: "text-amber-400",
            subtext: "Perlu dikerjakan"
        }
    ];
    
    const html = cards.map((card, index) => `
        <div class="card-dark rounded-xl border border-slate-700/50 p-5 stat-card slide-in shadow-xl" style="animation-delay: ${index * 0.1}s;">
            <div class="flex items-center gap-4">
                <!-- Icon on the left -->
                <div class="p-2.5 ${card.iconBg} rounded-lg flex-shrink-0">
                    <i data-lucide="${card.icon}" size="20" class="${card.iconColor}"></i>
                </div>
                
                <!-- Content on the right -->
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">${card.title}</p>
                    <h3 class="text-2xl font-bold text-slate-100 mb-0.5">${card.value}</h3>
                    <p class="text-xs text-slate-400">${card.subtext}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    $("#stats-grid").html(html);
    lucide.createIcons();
}

/* ===========================
   RENDER TASK TABLE
=========================== */
function renderTaskTable(tasks) {
    if (tasks.length === 0) {
        $("#task-table-body").html(`
            <tr>
                <td colspan="5" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50">
                            <i data-lucide="inbox" size="32" class="text-slate-600"></i>
                        </div>
                        <p class="text-slate-400 font-medium">Belum ada tugas</p>
                        <p class="text-xs text-slate-500">Mulai dengan membuat proyek baru</p>
                    </div>
                </td>
            </tr>
        `);
        lucide.createIcons();
        return;
    }
    
    const rows = tasks.map(task => {
        // Priority colors
        const priorityColors = {
            'low': { bg: 'bg-slate-600/20', text: 'text-slate-400', dot: 'bg-slate-500' },
            'medium': { bg: 'bg-amber-600/20', text: 'text-amber-400', dot: 'bg-amber-500' },
            'high': { bg: 'bg-rose-600/20', text: 'text-rose-400', dot: 'bg-rose-500' }
        };
        
        const priority = task.priority?.toLowerCase() || 'low';
        const priorityStyle = priorityColors[priority];
        
        // Status
        const statusStyle = task.finish 
            ? { bg: 'bg-emerald-600/20', text: 'text-emerald-400', label: 'Selesai' }
            : { bg: 'bg-cyan-600/20', text: 'text-cyan-400', label: 'Pending' };
        
        return `
            <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                    <div>
                        <p class="font-semibold text-slate-200 text-sm mb-1">${task.title}</p>
                        <p class="text-xs text-slate-500">
                            <i data-lucide="folder" size="10" class="inline"></i>
                            ${task.projectTitle || 'Unknown Project'}
                        </p>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${priorityStyle.bg} border border-slate-700/30">
                        <div class="w-1.5 h-1.5 rounded-full ${priorityStyle.dot}"></div>
                        <span class="text-xs font-semibold ${priorityStyle.text} capitalize">${priority}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusStyle.bg} border border-slate-700/30">
                        <div class="w-1.5 h-1.5 rounded-full ${statusStyle.dot || 'bg-cyan-500'}"></div>
                        <span class="text-xs font-semibold ${statusStyle.text}">${statusStyle.label}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-1.5 text-slate-400">
                        <i data-lucide="calendar" size="12"></i>
                        <span class="text-xs">${task.tenggat || 'Tidak ada'}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="viewTaskDetail(${task.projectId}, ${task.id})" 
                                class="w-7 h-7 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded transition-all flex items-center justify-center" 
                                title="Lihat Detail">
                            <i data-lucide="eye" size="14"></i>
                        </button>
                        <button onclick="toggleTaskStatus(${task.projectId}, ${task.id}, ${task.finish})" 
                                class="w-7 h-7 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded transition-all flex items-center justify-center" 
                                title="Toggle Status">
                            <i data-lucide="${task.finish ? 'x-circle' : 'check-circle'}" size="14"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    $("#task-table-body").html(rows);
    lucide.createIcons();
}

/* ===========================
   VIEW TASK DETAIL
=========================== */
function viewTaskDetail(projectId, taskId) {
    window.location.href = `tasks.html?project_id=${projectId}`;
}

/* ===========================
   TOGGLE TASK STATUS
=========================== */
function toggleTaskStatus(projectId, taskId, currentStatus) {
    const newStatus = !currentStatus;
    
    $.ajax({
        url: `${API_URL}/users/project/${projectId}/task/${taskId}/update`,
        method: "PUT",
        headers: getAuthHeader(),
        contentType: "application/json",
        data: JSON.stringify({
            finish: newStatus
        }),
        success: function() {
            // Reload dashboard
            loadDashboardStats();
        },
        error: function(err) {
            console.error("Failed to update task status:", err);
            alert("Gagal mengubah status tugas");
        }
    });
}

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    checkAuth();
    loadProfileHeader();
    loadDashboardStats();
});