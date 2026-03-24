<?php

namespace App\Http\Controllers;

use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use App\Models\Common;
use App\Models\Profile;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        return Inertia::render('home');
    }

    public function uploadMasterDCReport()
    {
        return Inertia::render('upload/index');
    }

    public function processManualAllocation()
    {
        return Inertia::render('process/index');
    }

    public function logs()
    {
        return Inertia::render('logs/index');
    }

    public function viewLogsDetails()
    {
        return Inertia::render('logs/view/index');
    }

}
