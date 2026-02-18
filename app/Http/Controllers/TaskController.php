<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\project;
use App\Models\task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function showTasks(Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');
        $project = Project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();


        if (!$project)
        {
            return response()->json([
                'success'=>false,
                'message'=>'gada projectnya bro'
            ]);
        }

        $tasks = task::where('project_id', $projectId)->get();

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function createTask(Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');

        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
        return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'finish' => 'nullable|boolean'
        ]);

        $title = $request->input('title');
        $description = $request->input('description');
        $priority = $request->input('priority');
        $finish = $request->input('finish');

        $task = task::create([
            'project_id' => $projectId,
            'title' => $title,
            'description' => $description,
            'priority' => $priority,
            'finish' => $finish
        ]);

        // Auto-update project status
        $this->updateProjectStatus($projectId);

        return response()->json([
            'success'=>true,
            'data'=>$task
        ], 200);
    }

    public function updateTask(Request $request, $projectId, $taskId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $task = task::where('id', $taskId)
                ->where('project_id', $projectId)
                ->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki tasks di project ini'
            ], 403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'finish' => 'nullable|boolean'
        ]);
        
        $data = [];

        if ($request->filled('title'))
        {
            $data['title'] = $request->input('title');
        }

        if ($request->filled('description'))
        {
            $data['description'] = $request->input('description');
        }

        // Use has() instead of filled() for boolean fields
        // because filled() returns false when value is false
        if ($request->has('finish'))
        {
            $data['finish'] = filter_var($request->input('finish'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->filled('priority'))
        {
            $data['priority'] = $request->input('priority');
        }

        if ($request->filled('tenggat'))
        {
            $data['tenggat'] = $request->input('tenggat');
        }

        $task->update($data);

        // Auto-update project status
        $this->updateProjectStatus($projectId);

        return response()->json([
            'success'=>true,
            'message'=>'data berhasil diperbarui'
        ]);
    }

    public function deleteTask(Request $request, $projectId, $taskId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $task = task::where('id', $taskId)
                ->where('project_id', $projectId)
                ->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki tasks di project ini'
            ], 403);
        }

        $task->delete();

        // Auto-update project status
        $this->updateProjectStatus($projectId);

        return response()->json([
            'success' => true,
            'message' => 'berhasil menghapus task'
        ]);
    }

    /**
     * Update project status based on tasks
     * - pending: no tasks
     * - in progress: has tasks but not all completed
     * - completed: all tasks completed
     */
    private function updateProjectStatus($projectId)
    {
        $project = project::find($projectId);
        
        if (!$project) {
            return;
        }
        
        $totalTasks = task::where('project_id', $projectId)->count();
        
        if ($totalTasks === 0) {
            $project->status = 'pending';
        } else {
            $completedTasks = task::where('project_id', $projectId)
                                   ->where('finish', true)
                                   ->count();
            
            if ($completedTasks === $totalTasks) {
                $project->status = 'completed';
            } else {
                $project->status = 'progress';
            }
        }
        
        $project->save();
    }
}
