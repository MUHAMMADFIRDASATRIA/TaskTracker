<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Carbon\Carbon;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (!$user){
            return response()->json(['message' => 'Invalid token'], 401);
        }

        if (!$user->exp_token || Carbon::now()->greaterThan($user->exp_token))
        {
                return response()->json(['message' => 'exp token'], 401);
        }

        $request->attributes->set('auth_user', $user);
        
        return $next($request);
    }
}
