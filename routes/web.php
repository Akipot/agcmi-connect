<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ManualAllocationController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(PageController::class)->group(function () {
        Route::get('/', 'home')->name('home');

        // ADMIN PAGES
        Route::get('/admin/church-registry', 'churchRegistry')->name('admin.church-registry');

        // MAINTENANCE PAGES
        Route::get('/maintenance/modules', 'modules')->name('maintenance.modules');
        Route::get('/maintenance/moduleaccess', 'moduleAccess')->name('maintenance.moduleaccess');
        Route::get('/maintenance/ministries', 'ministries')->name('maintenance.ministries');
        Route::get('/maintenance/roles', 'roles')->name('maintenance.roles');
        Route::get('/maintenance/actions', 'actions')->name('maintenance.actions');
        
    });
});

