<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ItemService;
use App\Exports\AllocationExport;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;

class ManualAllocationController extends Controller
{
    protected $itemService;

    public function __construct(ItemService $itemService)
    {
        $this->itemService = $itemService;
    }

    public function generateExcel(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
        ]);

        $items = $request->input('items');
        // dd($items);

        return Excel::download(new AllocationExport($items), 'manual_allocation.xlsx');
    }

    public function getPTLlocation(Request $request): JsonResponse
    {
        $plu = $request->input('plu', []);
        $locations = $this->itemService->getPTLlocation($plu);
        return response()->json($locations);
    }

}
