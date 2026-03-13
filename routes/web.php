<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PageController;

Route::controller(PageController::class)
    ->group(function () {
        Route::get('/', 'index')->name('home');
        Route::get('/upload-master-dc-report', 'uploadMasterDCReport')->name('uploadMasterDCReport');
        Route::get('/process-manual-allocation', 'processManualAllocation')->name('processManualAllocation');
    });
