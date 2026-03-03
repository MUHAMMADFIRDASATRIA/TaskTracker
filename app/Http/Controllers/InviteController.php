<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InviteController extends Controller
{
    private array $actionMap = [
        'invite'        => 'invite',
        'generate-code' => 'generateCode',
        'accept'        => 'accept',
        'decline'       => 'decline',
        'join'          => 'join',
    ];

    public function handleAction(Request $request, $model, $id, $action)
    {
        if (!isset($this->actionMap[$action])) {
            return response()->json([
                'success' => false,
                'message' => 'Action tidak valid'
            ], 400);
        }

        return $this->{$this->actionMap[$action]}($request, $id);
    }

    public function join(Request $request, $id = null)
    {
        $request->validate([
            'code' => 'required|exists:project_invitations,code',
        ]);

        $authUser = $request->attributes->get('auth_user');

        $invitation = DB::table('project_invitations')
            ->where('code', $request->code)
            ->where('type', 'code')
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if (!$invitation) {
            return response()->json(['success' => false, 'message' => 'Kode undangan tidak valid atau sudah kadaluarsa.'], 400);
        }

        $alreadyMember = DB::table('project_members')
            ->where('project_id', $invitation->project_id)
            ->where('user_id', $authUser->id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['success' => false, 'message' => 'Anda sudah menjadi anggota proyek.'], 400);
        }

        DB::table('project_members')->insert([
            'project_id' => $invitation->project_id,
            'user_id'    => $authUser->id,
            'role'       => 'member',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Anda berhasil bergabung dengan proyek.']);
    }

    private function invite(Request $request, $projectId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $authUser = $request->attributes->get('auth_user');

        $alreadyMember = DB::table('project_members')
            ->where('project_id', $projectId)
            ->where('user_id', $request->user_id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['success' => false, 'message' => 'User sudah menjadi anggota proyek.'], 400);
        }

        $invitationId = DB::table('project_invitations')->insertGetId([
            'project_id'      => $projectId,
            'invited_by'      => $authUser->id,
            'invited_user_id' => $request->user_id,
            'type'            => 'direct',
            'status'          => 'pending',
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Undangan berhasil dikirim.', 'data' => ['id' => $invitationId]]);
    }

    private function accept(Request $request, $invitationId)
    {
        $authUser = $request->attributes->get('auth_user');

        $invitation = DB::table('project_invitations')
            ->where('id', $invitationId)
            ->where('invited_user_id', $authUser->id)
            ->where('type', 'direct')
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json(['success' => false, 'message' => 'Undangan tidak ditemukan atau sudah diproses.'], 404);
        }

        $alreadyMember = DB::table('project_members')
            ->where('project_id', $invitation->project_id)
            ->where('user_id', $authUser->id)
            ->exists();

        if (!$alreadyMember) {
            DB::table('project_members')->insert([
                'project_id' => $invitation->project_id,
                'user_id'    => $authUser->id,
                'role'       => 'member',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('project_invitations')
            ->where('id', $invitationId)
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Undangan berhasil diterima.']);
    }

    private function decline(Request $request, $invitationId)
    {
        $authUser = $request->attributes->get('auth_user');

        $invitation = DB::table('project_invitations')
            ->where('id', $invitationId)
            ->where('invited_user_id', $authUser->id)
            ->where('type', 'direct')
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json(['success' => false, 'message' => 'Undangan tidak ditemukan atau sudah diproses.'], 404);
        }

        DB::table('project_invitations')
            ->where('id', $invitationId)
            ->update(['status' => 'cancelled', 'updated_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Undangan ditolak.']);
    }

    private function generateCode(Request $request, $projectId)
    {
        $authUser = $request->attributes->get('auth_user');
        $generatedCode = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

        DB::table('project_invitations')
            ->where('project_id', $projectId)
            ->where('type', 'code')
            ->where('status', 'pending')
            ->update(['status' => 'expired', 'updated_at' => now()]);

        $expiresAt = now()->addDays(1);

        DB::table('project_invitations')->insert([
            'project_id' => $projectId,
            'invited_by' => $authUser->id,
            'type'       => 'code',
            'code'       => $generatedCode,
            'status'     => 'pending',
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode undangan berhasil dibuat.',
            'data'    => ['code' => $generatedCode, 'expires_at' => $expiresAt]
        ], 201);
    }
}

