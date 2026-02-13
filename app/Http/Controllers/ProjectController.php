<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\project;
use App\Models\task;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function showProject (Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $query = project::where('user_id', $user->id);

        // $search = $request->input('search');

        if ($request->filled('search'))
        {
            $query = project::query()
                ->where('user_id', $user->id)
                ->when($request->search, function ($q) use ($request) {
                    $q->where('title', 'ILIKE', "%{$request->search}%");
                });
        }

        $projects = $query->get();

        return response()->json([
            'success'=>true,
            'data' =>$projects
        ]);

    }

    public function getProjectById (Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');

        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan atau tidak memiliki akses'
            ], 403);
        }

        return response()->json([
            'success'=>true,
            'data'=>$project
        ]);
    }

    public function createProject (Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $title = $request->input('title');
        $description = $request->input('description');
        $status = $request->input('status');
        $tenggat = $request->input('tenggat');

        $project = project::create([
            'user_id' => $user->id,
            'title' => $title,
            'description' => $description,
            'status' => $status,
            'tenggat' => $tenggat
        ]);

        return response()->json([
            'success'=>true,
            'data'=>$project
        ]);
    }

    public function updateProject (Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan atau tidak memiliki akses'
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

        if ($request->filled('status'))
        {
            $data['status'] = $request->input('status');
        }

        if ($request->filled('tenggat'))
        {
            $data['tenggat'] = $request->input('tenggat');
        }

        $project->update($data);

        return response()->json([
            'success'=>true,
            'message'=>'berhasil update'
        ], 200);
    }

    public function deleteProject (Request $request, $projectId)
    {
        $user = $request->attributes->get('auth_user');
        $project = project::where('id', $projectId)
                    ->where('user_id', $user->id)
                    ->first();
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project tidak ditemukan atau tidak memiliki akses'
        ], 403);
        }

        $project->delete();

        return response()->json([
            'success'=>true,
            'message'=>'project berhasil dihapus'
        ]);
    }

}
