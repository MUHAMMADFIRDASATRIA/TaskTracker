<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShowController extends Controller
{
    private array $allowedModels = ['project', 'tasks', 'profile', 'invitations', 'members'];
    public function showList(Request $request, $model)
    {
        if(!in_array($model, $this->allowedModels)){
            return response()->json([
                'success'=>false,
                'message'=>'model tidak valid'
            ],400);
        }

        return $this->{$model}($request);
    }

    private function project (Request $request)
    {
        $user = $request->attributes->get('auth_user');
        $search = $request->input('search');

        $projects = $user->projects()
            ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
            ->get();

        return $this->success($projects);
    }

    private function tasks (Request $request)
    {
        $user = $request->attributes->get('auth_user');
        $projectId = $request->query('project_id');
        $search = $request->input('search');

        $tasks = $user->projects()
            ->when($projectId, fn($q) => $q->where('projects.id', $projectId))
            ->with(['tasks' => fn($q) => $q->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))])
            ->get()
            ->pluck('tasks')
            ->flatten();

        return $this->success($tasks);
    }

    private function profile (Request $request)
    {
        $user = $request->attributes->get('auth_user');

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

    private function invitations(Request $request)
    {
        $user = $request->attributes->get('auth_user');

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

        return $this->success($invitations);
    }

    private function members(Request $request)
    {
        $user = $request->attributes->get('auth_user');
        $projectId = $request->query('project_id');

        if (!$projectId) {
            return $this->error('project_id query parameter is required', 400);
        }

        $project = $user->projects()->where('projects.id', $projectId)->first();

        if (!$project) {
            return $this->error('Project tidak ditemukan atau tidak memiliki akses', 404);
        }

        $members = $project->members()->with('user')->get();

        return $this->success($members);
    }

    private function success($data, $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data
         ], $code);
    }

    private function error($message, $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $code);
    }
}
