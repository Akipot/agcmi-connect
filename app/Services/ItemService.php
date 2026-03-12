<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class ItemService
{
    protected $baseUrl;
    
    public function __construct()
    {
        $this->baseUrl = config('services.local_api.base_url');
    }

    public function getPTLlocation(array $plu): array 
    {        
        try {
            $response = Http::timeout(5)->post("{$this->baseUrl}/location/ptl-location-lookup", [
                'plu' => $plu
            ]);

            if ($response->successful()) {
                return $response->json();
            }
            
            return [];
        } catch (\Exception $e) {      
            \Log::error("Oracle Bridge Error: " . $e->getMessage());
            return [];
        }
    }

}
