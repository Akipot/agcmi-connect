<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ItemService;
use App\Services\ManualAllocation;
use App\Models\RequestHeader;
use App\Models\RequestDetail;
use App\Exports\AllocationExport;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;


class ManualAllocationController extends Controller
{
    protected $allocationService;
    protected $itemService;

    public function __construct(ManualAllocation $allocationService, ItemService $itemService)
    {
        $this->allocationService = $allocationService;
        $this->itemService = $itemService;
    }

    public function generateExcel(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
        ]);

        $items = $request->input('items');

        return $this->allocationService->processAllocation($items);
    }

    public function getPTLlocation(Request $request): JsonResponse
    {
        $plu = $request->input('plu', []);
        $locations = $this->itemService->getPTLlocation($plu);
        return response()->json($locations);
    }

    public function getLogs(): JsonResponse
    {
        $logs = RequestHeader::select([
            'Request_ID',
            'RequestNo',
            'TotalStores',
            'TotalRequests',
            'created_at'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($logs);
    }

    public function viewLogsDetails($id)
    {
        return Inertia::render('logs/view/index', [
            'id' => $id
        ]);
    }

    public function getLogsDetails($id)
    {
        return \DB::table('RequestDetails')
            ->join('RequestHeaders', 'RequestDetails.Request_ID', '=', 'RequestHeaders.Request_ID')
            ->where('RequestDetails.Request_ID', $id)
            ->select('RequestDetails.*', 'RequestHeaders.RequestNo')
            ->get();
    }
    
    public function reprintManualAllocation(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
        ]);

        $items = $request->input('items');

        return Excel::download(new AllocationExport($items), 'Reprint.xlsx');
    }


}
