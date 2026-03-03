<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DetailController extends Controller
{
    public function getById(Request $request, $model, $id)
    {
        if(!in_array($model, ['project', 'tasks', 'profile'])){
            return response()->json([
                'success'=>false,
                'message'=>'model tidak valid'
            ],400);
        }

        return $this->{$model}($request, $id);
    }
    private function project (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');
        $project = $user->projects()->where('projects.id', $id)->first();

        if (!$project) {
            return response()->json([
                'success'=>false,
                'message'=>'Project tidak ditemukan atau tidak memiliki akses'
            ], 404);
        }

        return response()->json([
            'success'=>true,
             'data'=>$project
        ]);
    }

    private function tasks (Request $request, $id)
    {
        $user = $request->attributes->get('auth_user');
        $task = $user->tasks()->where('tasks.id', $id)->first();

        if (!$task) {
            return response()->json([
                'success'=>false,
                'message'=>'Task tidak ditemukan atau tidak memiliki akses'
            ], 404);
        }

        return response()->json([
            'success'=>true,
             'data'=>$task
        ]);
    }
}
