<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Maintenance\ModuleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('/maintenance')->group(function () {
    Route::get('/modules', [ModuleController::class, 'getModules']);
    Route::post('/modules', [ModuleController::class, 'storeModule']);
    Route::put('/modules/{id}', [ModuleController::class, 'update']);
});
