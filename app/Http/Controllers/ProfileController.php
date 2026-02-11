<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
                'email' => $user->email
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

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully'
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
