<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ManualAllocationController;

Route::post('/manual-allocation', [ManualAllocationController::class, 'generateExcel']);
Route::post('/reprint-manual-allocation', [ManualAllocationController::class, 'reprintManualAllocation']);

Route::prefix('logs')->group(function () {
    Route::get('/get-manual-allocation-logs', [ManualAllocationController::class, 'getLogs']);
    Route::get('/get-manual-allocation-logs-details/{id}', [ManualAllocationController::class, 'getLogsDetails']);
});

