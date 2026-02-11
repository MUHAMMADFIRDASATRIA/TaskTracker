<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;

// Route::post('/users', [UserController::class,'createUser']);
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth.api')->group(function(){
    Route::GET('/users', [UserController::class,'getUser']);
    Route::post('/logout', [UserController::class, 'logout']);
    
    Route::GET('/profile', [ProfileController::class, 'getProfile']);
    Route::PUT('/profile/edit', [ProfileController::class, 'editProfile']);
    Route::DELETE('/profile', [ProfileController::class, 'deleteProfile']);

    Route::GET('/users/project', [ProjectController::class,'showProject']);
    Route::POST('/users/project/create', [ProjectController::class,'createProject']);
    Route::PUT('/users/project/{projectId}/update', [ProjectController::class,'updateProject']);
    Route::DELETE('/users/project/{projectId}', [ProjectController::class,'deleteProject']);

    Route::GET('/users/project/{projectId}/tasks', [TaskController::class,'showTasks']);
    Route::POST('/users/project/{projectId}/tasks/create', [TaskController::class,'createTask']);
    Route::PUT('/users/project/{projectId}/tasks/{taskId}', [TaskController::class,'updateTask']);
    Route::DELETE('/users/project/{projectId}/tasks/{taskId}', [TaskController::class,'deleteTask']);
});




