<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\project;
use App\Models\task;
use App\Models\ProjectMembers;
use Illuminate\Http\Request;

class ProjectMembersController extends Controller
{
    public function showProjectMembers($projectId)
    {
        $members = ProjectMembers::where('project_id', $projectId)->with('user')->get();
        
        return response()->json([
            'success' => true,
            'data' => $members  // ← wrap dalam 'data'
        ]);
    }

    public function removeProjectMember($projectId, $userId)
    {
        $member = ProjectMembers::where('project_id', $projectId)->where('user_id', $userId)->first();
        if (!$member) {
            return response()->json(['message' => 'Anggota tidak ditemukan.'], 404);
        }
        $member->delete();
        return response()->json(['message' => 'Anggota berhasil dihapus.']);
    }
}
