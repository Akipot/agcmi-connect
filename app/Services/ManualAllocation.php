<?php

namespace App\Services;

use App\Models\RequestHeader;
use App\Models\RequestDetail;
use App\Exports\AllocationExport;
use Maatwebsite\Excel\Facades\Excel;

class ManualAllocation
{
    public function processAllocation(array $items)
    {
        $itemsColl = collect($items);
        $today = now()->format('mdY');
        
        $todayCount = RequestHeader::where('RequestNo', 'like', "MAR{$today}%")->count();
        $sequence = str_pad($todayCount + 1, 5, '0', STR_PAD_LEFT);
        $requestNo = "MAR{$today}{$sequence}";

        $header = RequestHeader::create([
            'RequestNo'     => $requestNo,
            'DateGenerated' => now(),
            'TotalStores'   => $itemsColl->pluck('storeCode')->unique()->count(),
            'TotalRequests' => $itemsColl->sum('qtyRequest'),
        ]);

        foreach ($items as $item) {
            RequestDetail::create([
                'Request_ID'         => $header->Request_ID,
                'StoreCode'          => $item['storeCode'] ?? '',
                'StoreName'          => $item['store'] ?? '',
                'PLU'                => $item['plu'] ?? '',
                'ItemDescription'    => $item['itemDescp'] ?? '',
                'Location'           => $item['locationCode'] ?? '',
                'Tail1'              => $item['tail1'] ?? '',
                'C2'                 => $item['c2'] ?? '',
                'Quantity'           => $item['qtyRequest'] ?? 0,
                'OH_AfterAllocation' => $item['ohAfterAllocation'] ?? 0,
            ]);
        }

        return Excel::download(new AllocationExport($items), 'manual_allocation.xlsx');
    }
}
