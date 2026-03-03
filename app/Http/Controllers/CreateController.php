<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CreateController extends Controller
{
    private array $allowedModels = ['project', 'tasks'];
    public function create(Request $request, $model)
    {
        if(!in_array($model, $this->allowedModels)){
            return response()->json([
                'success'=>false,
                'message'=>'model tidak valid'
            ],400);
        }

        return $this->{$model}($request);
    }

    private function project (Request $request)
    {
        $user = $request->attributes->get('auth_user');
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'string',
            'tenggat' => 'date',
            'status' => 'nullable|in:pending,ongoing,completed'
        ]);

        $project = $user->projects()->make(array_merge($data, ['user_id' => $user->id]));
        $project->save();
        $user->projects()->attach($project->id, ['role' => 'leader']);
        return response()->json([
            'success'=>true,
            'data'=>$project
        ], 201);
    }

    private function tasks (Request $request)
    {
        $data = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high',
            'finish' => 'nullable|boolean'
        ]);

        $project = $request->attributes->get('auth_user')->projects()->where('projects.id', $data['project_id'])->first();

        if (!$project || $project->pivot->role !== 'leader') {
            return response()->json(['success' => false, 'message' => 'Hanya leader yang bisa membuat task.'], 403);
        }

        $tasks = $project->tasks()->create($data);
        return response()->json([
            'success'=>true,
            'data'=>$tasks
        ], 201);
    }
}
