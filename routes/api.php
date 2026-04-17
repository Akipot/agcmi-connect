<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Maintenance\ModuleController;
use App\Http\Controllers\Maintenance\RoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('/maintenance')->group(function () {
    
    Route::get('/modules', [ModuleController::class, 'getModules']);
    Route::post('/modules', [ModuleController::class, 'storeModule']);
    Route::put('/modules/{id}', [ModuleController::class, 'updateModule']);

    Route::get('/roles', [RoleController::class, 'getRoles']);
    Route::post('/roles', [RoleController::class, 'storeRole']);
    Route::put('/roles/{id}', [RoleController::class, 'updateRole']);
});
