$(document).ready(function () {
    checkAuth();

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('task_id');
    const projectId = urlParams.get('project_id');

    if (!taskId || !projectId) {
        alert("Task ID atau Project ID tidak ditemukan");
        window.location.href = "projects.html";
        return;
    }

    /* ===========================
       LOAD TASK DATA
    =========================== */
    function loadTaskData() {
        $.ajax({
            url: `${API_URL}/users/project/${projectId}/tasks`,
            method: "GET",
            headers: getAuthHeader(),
            success: function (res) {
                const tasks = res.data || [];
                const task = tasks.find(t => t.id == taskId);

                if (!task) {
                    alert("Task tidak ditemukan");
                    window.location.href = `tasks.html?project_id=${projectId}`;
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
                window.location.href = `tasks.html?project_id=${projectId}`;
            }
        });
    }

    /* ===========================
       HANDLE FORM SUBMIT
    =========================== */
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
            url: `${API_URL}/users/project/${projectId}/tasks/${taskId}`,
            method: "PUT",
            headers: getAuthHeader(),
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("Update Task Success:", res);
                
                // Show success modal
                $("#successModal").removeClass("hidden").addClass("flex");
                
                // Auto redirect after 2 seconds
                setTimeout(function() {
                    window.location.href = `tasks.html?project_id=${projectId}`;
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

    // Load task data on page load
    loadTaskData();
    
    // Initialize lucide icons
    lucide.createIcons();
});
