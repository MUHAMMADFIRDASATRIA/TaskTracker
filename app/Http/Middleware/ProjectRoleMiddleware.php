<?php

namespace App\Http\Middleware;

use App\Models\ProjectMembers;
use Closure;
use Illuminate\Http\Request;

class ProjectRoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role = 'leader')
    {
        $projectId = $request->route('id'); // sesuaikan dengan parameter route kamu
        $userId = $request->user()->id;

        $member = ProjectMembers::where('project_id', $projectId)
            ->where('user_id', $userId)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Kamu bukan anggota project ini.'], 403);
        }

        if ($role === 'leader' && $member->role !== 'leader') {
            return response()->json(['message' => 'Hanya leader yang bisa melakukan aksi ini.'], 403);
        }

        return $next($request);
    }
}