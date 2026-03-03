<?php

use App\Http\Controllers\DetailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ProjectInvitationController;
use App\Http\Controllers\ProjectMembersController;
use App\Http\Controllers\CreateController;
use App\Http\Controllers\ShowController;
use App\Http\Controllers\UpdateController;
use App\Http\Controllers\DeleteController;
use App\Http\Controllers\InviteController;

// Route::post('/users', [UserController::class,'createUser']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);



Route::middleware('auth.api')->group(function(){

    Route::post('/logout', [UserController::class, 'logout']);


    Route::GET('/{model}/show', [ShowController::class,'showList']);
    Route::POST('/{model}/create', [CreateController::class,'create']);
    Route::GET('/{model}/{id}', [DetailController::class,'getById']);
    Route::PUT('/{model}/{id}/update', [UpdateController::class,'update']);
    Route::DELETE('/{model}/{id}', [DeleteController::class,'delete']);

    Route::POST('/{model}/{id}/{action}', [InviteController::class,'handleAction']);

    //Route::GET('/project/{Id}/members', [ProjectMembersController::class,'showProjectMembers'])->middleware('project.role:member');
    //Route::DELETE('/project/{Id}/members/{userId}', [ProjectMembersController::class,'removeProjectMember'])->middleware('project.role:leader');

    //Route::PUT('/profile/edit', [ProfileController::class, 'editProfile']);
    //Route::DELETE('/profile', [ProfileController::class, 'deleteProfile']);

    
    // Route::POST('/users/project/{projectId}/invite', [ProjectInvitationController::class,'inviteToProject'])->middleware('project.role:leader');
    // Route::POST('users/project/{projectId}/generate-code', [ProjectInvitationController::class,'generateProjectCode'])->middleware('project.role:member');
    // Route::POST('/users/project/join', [ProjectInvitationController::class,'joinByCode'])->middleware('project.role:member');
    
    //Route::GET('/users', [UserController::class,'getUser']);
    //Route::GET('/users/project', [ProjectController::class,'showProject']);
    //Route::GET('/users/project/{projectId}', [ProjectController::class,'getProjectById'])->middleware('project.role:member');
    //Route::POST('/users/project/create', [ProjectController::class,'createProject']);
    //Route::PUT('/users/project/{projectId}/update', [ProjectController::class,'updateProject'])->middleware('project.role:leader');
    //Route::DELETE('/users/project/{projectId}', [ProjectController::class,'deleteProject'])->middleware('project.role:leader');
   
    // Route::GET('/project/list', [TaskController::class,'showTasks'])->middleware('project.role:member');

 
   
    //Route::GET('/users/project/{projectId}/tasks', [TaskController::class,'showTasks'])->middleware('project.role:member');
    //Route::GET('/users/project/{projectId}/tasks/{taskId}', [TaskController::class,'getTaskById'])->middleware('project.role:member');
    //Route::POST('/users/project/{projectId}/tasks/create', [TaskController::class,'createTask'])->middleware('project.role:leader');
    //Route::PUT('/users/project/{projectId}/tasks/{taskId}', [TaskController::class,'updateTask'])->middleware('project.role:leader');
    //Route::DELETE('/users/project/{projectId}/tasks/{taskId}', [TaskController::class,'deleteTask'])->middleware('project.role:leader');
    Route::PATCH('tasks/{taskId}/finish', [TaskController::class,'toggleFinish'])->middleware('project.role:member');
});




