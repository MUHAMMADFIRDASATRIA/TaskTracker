<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

class DeleteController extends Controller
{
    private array $allowedModels = ['project', 'tasks', 'profile', 'members'];
    public function delete(Request $request, $model, $id)
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
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa menghapus project.'], 403);
        }

        $project->delete();
        return response()->json([
            'success'=>true,
            'message'=>'Project berhasil dihapus'
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
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa menghapus task.'], 403);
        }

        $task->delete();
        return response()->json([
            'success'=>true,
            'message'=>'Task berhasil dihapus'
        ]);
    }

    private function members (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');
        $projectId = $request->query('project_id');

        if (!$projectId) {
            return response()->json([
                'success' => false,
                'message' => 'project_id wajib diisi'
            ], 422);
        }

        $project = $user->projects()->where('projects.id', $projectId)->first();
        if (!$project) {
            return response()->json([
                'success'=>false,
                'message'=>'Project tidak ditemukan atau tidak memiliki akses'
            ], 404);
        }

        if ($project->pivot->role !== 'leader') {
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa menghapus member.'], 403);
        }

        $member = $project->members()->where('user_id', $id)->first();
        if (!$member) {
            return response()->json([
                'success'=>false,
                'message'=>'Member tidak ditemukan'
            ], 404);
        }

        if ((int) $member->user_id === (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Leader tidak bisa menghapus dirinya sendiri.'
            ], 400);
        }

        $member->delete();
        return response()->json([
            'success'=>true,
            'message'=>'Member berhasil dihapus'
        ]);
    }
}
