<?php

namespace App\Http\Controllers;

use App\Helpers\MyHelper;
use Illuminate\Http\Request;
use App\Models\Common;
use App\Models\Profile;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PageController extends Controller
{
    public function home()
    {
        $seeds = ['john 3:16', 'phil 4:13', 'psalm 23:1', 'jer 29:11', 'isaiah 40:31', 'romans 8:28'];
        
        $selected = $seeds[date('z') % count($seeds)]; 

        try {
            $response = Http::get("https://bible-api.com/{$selected}?translation=kjv");
            $data = $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            $data = null;
        }

        return Inertia::render('home', [
            'dailyVerse' => $data
        ]);
    }

    public function churchRegistry()
    {
        return Inertia::render('admin/church-registry/index');
    }

    public function modules()
    {
        return Inertia::render('maintenance/modules/index');
    }

    public function ministries()
    {
        return Inertia::render('maintenance/ministries/index');
    }

    public function roles()
    {
        return Inertia::render('maintenance/roles/index');
    }

    public function actions()
    {
        return Inertia::render('maintenance/actions/index');
    }

    public function moduleacess()
    {
        return Inertia::render('maintenance/moduleacess/index');
    }

}
