<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ManualAllocationController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(PageController::class)
    ->group(function () {
        Route::get('/', 'home')->name('home');
    });
});

