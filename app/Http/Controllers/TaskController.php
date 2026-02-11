<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\project;
use App\Models\task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function showTasks(Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');
        $project = Project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();


        if (!$project)
        {
            return response()->json([
                'success'=>false,
                'message'=>'gada projectnya bro'
            ]);
        }

        // if($project->user_id !== $user->id)
        // {
        //     return response()->json([
        //         'success'=>false,
        //         'message'=>'gak dapet akses bro'
        //     ]);
        // }

        $tasks = task::where('project_id', $projectId)->get();

        return response()->json([
            'success' => true,
            'message' => $tasks
        ]);
    }

    public function createTask(Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');

        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
        return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $title = $request->input('title');
        $description = $request->input('description');
        $finish = $request->input('finish');

        $task = task::create([
            'project_id' => $projectId,
            'title' => $title,
            'description' => $description,
            'finish' => $finish
        ]);

        return response()->json([
            'success'=>true,
            'data task'=>$task
        ], 200);
    }

    public function updateTask(Request $request, $projectId, $taskId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $task = task::where('id', $taskId)
                ->where('project_id', $projectId)
                ->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki tasks di project ini'
            ], 403);
        }

        $data = [];

        if ($request->filled('title'))
        {
            $data['title'] = $request->input('title');
        }

        if ($request->filled('description'))
        {
            $data['description'] = $request->input('description');
        }

        if ($request->filled('finish'))
        {
            $data['finish'] = $request->input('finish');
        }

        $task->update($data);

        return response()->json([
            'success'=>true,
            'message'=>'data berhasil diperbarui'
        ]);
    }

    public function deleteTask(Request $request, $projectId, $taskId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki akses ke project'
            ], 403);
        }

        $task = task::where('id', $taskId)
                ->where('project_id', $projectId)
                ->first();

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak memiliki tasks di project ini'
            ], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'berhasil menghapus task'
        ]);
    }
}
