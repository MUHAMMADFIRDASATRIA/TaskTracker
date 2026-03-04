<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShowController extends Controller
{
    private array $allowedModels = ['project', 'tasks', 'profile', 'invitations', 'members'];

    public function showList(Request $request, $model)
    {
        if (!$this->isModelAllowed($model)) {
            return $this->errorResponse('model tidak valid', 400);
        }

        $user = $this->authUser($request);
        if (!$user) {
            return $this->errorResponse('Unauthorized', 401);
        }

        return $this->{$model}($request, $user);
    }

    private function project (Request $request, $user)
    {
        $search = $request->input('search');

        $projects = $user->projects()
            ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    private function tasks (Request $request, $user)
    {
        $projectId = $request->query('project_id');
        $search = $request->input('search');

        $tasks = $user->projects()
            ->when($projectId, fn($q) => $q->where('projects.id', $projectId))
            ->with(['tasks' => fn($q) => $q->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))])
            ->get()
            ->pluck('tasks')
            ->flatten();

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    private function profile (Request $request, $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo' => $user->profile_photo
            ]
        ], 201);
    }

    private function invitations(Request $request, $user)
    {
        $invitations = DB::table('project_invitations as pi')
            ->join('projects as p', 'p.id', '=', 'pi.project_id')
            ->join('users as u', 'u.id', '=', 'pi.invited_by')
            ->where('pi.invited_user_id', $user->id)
            ->where('pi.type', 'direct')
            ->where('pi.status', 'pending')
            ->select(
                'pi.id',
                'p.title as project_title',
                'p.id as project_id',
                'u.name as invited_by_name',
                'pi.created_at'
            )
            ->orderByDesc('pi.created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $invitations
        ]);
    }

    private function members(Request $request, $user)
    {
        $projectId = $request->query('project_id');

        if (!$projectId) {
            return $this->errorResponse('project_id wajib diisi', 422);
        }

        $project = $user->projects()->where('projects.id', $projectId)->first();

        if (!$project) {
            return $this->errorResponse('Project tidak ditemukan atau tidak memiliki akses', 404);
        }

        $members = $project->members()->with('user')->get();

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    private function isModelAllowed(string $model): bool
    {
        return in_array($model, $this->allowedModels, true);
    }

    private function authUser(Request $request)
    {
        return $request->attributes->get('auth_user');
    }
    
    private function errorResponse(string $message, int $status)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $status);
    }
}
