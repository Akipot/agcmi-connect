<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ManualAllocationController;

Route::post('/manual-allocation', [ManualAllocationController::class, 'generateExcel']);
// Route::post('/get-ptl-location', [ManualAllocationController::class, 'getPTLlocation']);

