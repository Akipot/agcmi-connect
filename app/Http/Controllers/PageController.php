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
    public function index()
    {
        // List of inspiring verses to pick from randomly
        $seeds = ['john 3:16', 'phil 4:13', 'psalm 23:1', 'jer 29:11', 'isaiah 40:31', 'romans 8:28'];
        
        // Pick one based on the day of the year so all members see the same one
        $selected = $seeds[date('z') % count($seeds)]; 

        try {
            // Fetching with a specific translation (e.g., KJV or WEB)
            $response = Http::get("https://bible-api.com/{$selected}?translation=kjv");
            $data = $response->successful() ? $response->json() : null;
        } catch (\Exception $e) {
            $data = null;
        }

        return Inertia::render('home', [
            'dailyVerse' => $data
        ]);
    }

}
