<?php

namespace App\Http\Middleware;

use App\Models\ProjectMembers;
use App\Models\task;
use Closure;
use Illuminate\Http\Request;

class ProjectRoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role = 'leader')
    {
        // try common route param names
        $projectId = $request->route('projectId') ?? $request->route('id');

        if (!$projectId) {
            $taskId = $request->route('taskId');
            if ($taskId) {
                $task = task::find($taskId);
                if (!$task) {
                    return response()->json(['message' => 'Task tidak ditemukan.'], 404);
                }
                $projectId = $task->project_id;
            }
        }

        // get authenticated user set by ApiTokenAuth
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $userId = $authUser->id;

        // If route doesn't target a specific project, just allow
        if (!$projectId) {
            return $next($request);
        }

        $member = ProjectMembers::where('project_id', $projectId)
            ->where('user_id', $userId)
            ->first();

        // If not a member, allow if user is the project owner
        if (!$member) {
            $projectModel = \App\Models\project::find($projectId);
            if ($projectModel && $projectModel->user_id === $userId) {
                // owner implicitly allowed (leader)
                return $next($request);
            }

            return response()->json(['message' => 'Kamu bukan anggota project ini.'], 403);
        }

        if ($role === 'leader' && $member->role !== 'leader') {
            return response()->json(['message' => 'Hanya leader yang bisa melakukan aksi ini.'], 403);
        }

        return $next($request);
    }
}