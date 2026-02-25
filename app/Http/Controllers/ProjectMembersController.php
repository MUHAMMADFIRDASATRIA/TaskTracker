<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\project;
use App\Models\task;
use App\Models\ProjectMembers;
use Illuminate\Http\Request;

class ProjectMembersController extends Controller
{
    public function showMembers (Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');

        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan atau tidak memiliki akses'
            ], 403);
        }

        $members = $project->members()->with('user')->get();

        return response()->json([
            'success'=>true,
            'data'=>$members
        ]);
    }
}
