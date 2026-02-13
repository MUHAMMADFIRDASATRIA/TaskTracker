<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserController extends Controller
{
    public function getUser(Request $request)
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

    public function register(Request $request)
    {
        $apitoken = Str::random(60);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'api_token' => hash('sha256', $apitoken),
            'exp_token' => Carbon::now()->addDay()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user,
            'api_token' => $apitoken,
        ], 201);
    }

    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
        
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

            $apitoken = Str::random(60);
            $user->api_token = hash('sha256', $apitoken);
            $user->exp_token = Carbon::now()->addDay(); 
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'selamat datang '. $user->name,
                'api_token' => $apitoken,
                'exp_token' => $user->exp_token
            ], 200);

    }

    public function logout(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $user->api_token = null;
        $user->exp_token = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'berhasil logout'
        ], 200);
    }
}
