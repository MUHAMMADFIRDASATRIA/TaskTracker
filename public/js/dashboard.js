const API_URL = "http://127.0.0.1:8000/api";

/* ===========================
   LOAD DASHBOARD DATA
=========================== */
function loadDashboard() {
    $.ajax({
        url: `${API_URL}/users/project`,
        method: "GET",
        headers: getAuthHeader(),
        success: function (res) {
            renderStats(res.data);
            renderTable(res.data);
        },
        error: function (xhr) {
            if (xhr.status === 401) logout();
        }
    });
}

/* ===========================
   RENDER STATS
=========================== */
function renderStats(projects) {
    const total = projects.length;
    const done = projects.filter(p => p.status === "Done").length;
    const active = total - done;

    $("#stats-grid").html(`
        <div class="bg-white p-5 rounded-xl border">
            <p class="text-sm text-slate-500">Total Project</p>
            <p class="text-2xl font-bold mt-1">${total}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border">
            <p class="text-sm text-slate-500">Aktif</p>
            <p class="text-2xl font-bold mt-1">${active}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border">
            <p class="text-sm text-slate-500">Selesai</p>
            <p class="text-2xl font-bold mt-1">${done}</p>
        </div>
        <div class="bg-white p-5 rounded-xl border">
            <p class="text-sm text-slate-500">Prioritas</p>
            <p class="text-2xl font-bold mt-1">-</p>
        </div>
    `);
}

/* ===========================
   RENDER TABLE
=========================== */
function renderTable(projects) {
    const tbody = $("#task-table-body");
    tbody.empty();

    if (projects.length === 0) {
        tbody.html(`
            <tr>
                <td colspan="5" class="text-center py-6 text-slate-500">
                    Belum ada data
                </td>
            </tr>
        `);
        return;
    }

    projects.slice(0, 6).forEach(p => {
        tbody.append(tableRow(p));
    });
}

/* ===========================
   TABLE ROW TEMPLATE
=========================== */
function tableRow(p) {
    return `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 font-medium text-slate-800">
                ${p.title}
            </td>

            <!-- PRIORITAS DIKOSONGKAN -->
            <td class="px-6 py-4 text-slate-400 italic">
                -
            </td>

            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-xs
                    bg-indigo-100 text-indigo-600">
                    ${p.status}
                </span>
            </td>

            <td class="px-6 py-4 text-slate-500 text-sm">
                ${p.tenggat ?? "-"}
            </td>

            <td class="px-6 py-4 text-center">
                <button
                    onclick="openProject(${p.id})"
                    class="text-indigo-600 hover:underline text-sm">
                    Detail
                </button>
            </td>
        </tr>
    `;
}

/* ===========================
   OPEN PROJECT
=========================== */
function openProject(projectId) {
    window.location.href = `projects.html?open=${projectId}`;
}

/* ===========================
   INIT
=========================== */
$(document).ready(function () {
    loadDashboard();
});
