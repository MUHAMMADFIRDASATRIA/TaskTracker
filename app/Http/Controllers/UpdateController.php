<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UpdateController extends Controller
{
    private array $allowedModels = ['project', 'tasks', 'profile'];
    public function update(Request $request, $model, $id)
    {
        if(!in_array($model, $this->allowedModels)){
            return response()->json([
                'success'=>false,
                'message'=>'model tidak valid'
            ],400);
        }

        return $this->{$model}($request, $id);
    }

    private function project (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');

        $project = $user->projects()->where('projects.id', $id)->first();
        if (!$project) {
            return response()->json([
                'success'=>false,
                'message'=>'Project tidak ditemukan atau tidak memiliki akses'
            ], 404);
        }

        if ($project->pivot->role !== 'leader') {
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa mengedit project.'], 403);
        }

        $data = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'tenggat' => 'date',
            'status' => 'nullable|in:pending,ongoing,completed'
        ]);

        $project->update($data);
        return response()->json([
            'success'=>true,
            'data'=>$project
        ]);
    }

    private function tasks (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');

        $task = $user->tasks()->where('tasks.id', $id)->first();
        if (!$task) {
            return response()->json([
                'success'=>false,
                'message'=>'Task tidak ditemukan atau tidak memiliki akses'
            ], 404);
        }

        $projectMember = $user->projects()->where('projects.id', $task->project_id)->first();
        if (!$projectMember || $projectMember->pivot->role !== 'leader') {
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa mengedit task.'], 403);
        }

        $data = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'finish' => 'nullable|boolean'
        ]);

        $task->update($data);
        return response()->json([
            'success'=>true,
            'data'=>$task
        ]);
    }

    public function profile (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');

        $data = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'string|min:6',
            'profile_photo' => 'string|url'
        ]);

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);
        return response()->json([
            'success'=>true,
            'data'=>$user
        ]);
    }
}
