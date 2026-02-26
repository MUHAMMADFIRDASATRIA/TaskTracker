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
            'project_id' => 'required|exists:projects,id',
            'invited_user_id' => 'required|exists:users,id',
            'type' => 'required|in:email,username',
        ]);

        $project = Project::findOrFail($projectId);

        $alreadyMember = ProjectMembers::where('project_id', $projectId)
            ->where('user_id', $request->invited_user_id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'User sudah menjadi anggota proyek.'], 400);
        }

        $invitation = ProjectInvitations::create([
            'project_id' => $projectId,
            'invited_by' => $request->user()->id,
            'invited_user_id' => $request->invited_user_id,
            'type' => $request->type,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Undangan berhasil dikirim.', 'invitation' => $invitation]);
    }

    public function generateProjectCode($projectId)
    {
        $project = Project::findOrFail($projectId);

        request()->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $generatedCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 10));

        $invitation = ProjectInvitations::create([
            'project_id' => $projectId,
            'invited_by' => request()->user()->id,
            'type' => 'code',
            'code' => $generatedCode,
            'status' => 'pending',
            'expires_at' => now()->addDays(),
        ]);

        return response()->json(['message' => 'Kode undangan berhasil dibuat.', 
        'code' => $generatedCode,
        'data' => $invitation], 201);
    }

    public function joinByCode(Request $request)
    {
        // Validasi input
        $request->validate([
            'code' => 'required|exists:project_invitations,code',
        ]);

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
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'Anda sudah menjadi anggota proyek.'], 400);
        }

        $invitation->update(['status' => 'accepted']);

        ProjectMembers::create([
            'project_id' => $invitation->project_id,
            'user_id' => $request->user()->id,
            'role' => 'member',
        ]);

        return response()->json(['message' => 'Anda berhasil bergabung dengan proyek.']);
    }
        // Logika untuk mem
}
