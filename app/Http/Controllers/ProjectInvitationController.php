<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\ProjectMembers;
use App\Models\ProjectInvitations;


class ProjectInvitationController extends Controller
{
    public function inviteToProject(Request $request, $projectId)
    {
        // Validasi input
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $authUser = $request->attributes->get('auth_user');
        $project = Project::findOrFail($projectId);

        $alreadyMember = ProjectMembers::where('project_id', $projectId)
            ->where('user_id', $request->invited_user_id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'User sudah menjadi anggota proyek.'], 400);
        }

        $invitation = ProjectInvitations::create([
            'project_id' => $projectId,
            'invited_by' => $authUser->id,
            'invited_user_id' => $request->user_id,
            'type' => 'direct',
            'status' => 'pending',
        ]);

        ProjectMembers::create([
            'project_id' => $projectId,
            'user_id' => $request->user_id,
            'role' => 'member',
        ]);

        return response()->json(['message' => 'Undangan berhasil dikirim.', 'data' => $invitation]);
    }

    public function generateProjectCode($projectId)
    {
        $authUser = request()->attributes->get('auth_user');

        $generatedCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

        ProjectInvitations::where('project_id', $projectId)
        ->where('type', 'code')
        ->where('status', 'pending')
        ->update(['status' => 'expired']);
        
        $invitation = ProjectInvitations::create([
            'project_id' => $projectId,
            'invited_by' => $authUser->id,
            'type' => 'code',
            'code' => $generatedCode,
            'status' => 'pending',
            'expires_at' => now()->addDays(1),
        ]);

        return response()->json(['message' => 'Kode undangan berhasil dibuat.', 
        'success' => true,
        'data' => [
            'code' => $generatedCode,
            'expires_at' => $invitation->expires_at
        ]], 201);
    }

    public function joinByCode(Request $request)
    {
        // Validasi input
        $request->validate([
            'code' => 'required|exists:project_invitations,code',
        ]);

        $authUser = $request->attributes->get('auth_user');

        $invitation = ProjectInvitations::where('code', $request->code)
            ->where('type', 'code')
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$invitation) {
            return response()->json(['message' => 'Kode undangan tidak valid.'], 400);
        }

        if ($invitation->status !== 'pending') {
            return response()->json(['message' => 'Kode undangan sudah tidak berlaku.'], 400);
        }

        $alreadyMember = ProjectMembers::where('project_id', $invitation->project_id)
            ->where('user_id', $authUser->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'Anda sudah menjadi anggota proyek.'], 400);
        }

        ProjectMembers::create([
            'project_id' => $invitation->project_id,
            'user_id' => $authUser->id,
            'role' => 'member',
        ]);

        return response()->json(['message' => 'Anda berhasil bergabung dengan proyek.']);
    }
        // Logika untuk mem
}
