<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
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
        ], 200);
    }

    public function editProfile(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $data = [];

        if ($request->filled('name'))
        {
            $data['name'] = $request->name;
        }

        if ($request->filled('email'))
        {
            $data['email'] = $request->email;
        }

        if ($request->filled('password'))
        {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('profile_photo')) {

        // hapus foto lama jika ada
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('profile_photo')
                        ->store('profile-photos', 'public');

        $data['profile_photo_path'] = $path;
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_photo' => $user->profile_photo
            ]
        ], 200);
    }

    public function deleteProfile(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $user->delete();

        return response()->json([
            'success'=>true,
            'message'=>'profile berhasil dihapus'
        ]);
    }
}
