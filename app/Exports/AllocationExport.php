<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AllocationExport implements WithMultipleSheets
{
    protected $items;

    public function __construct(array $items)
    {
        $this->items = collect($items);
    }

    public function sheets(): array
    {
        $sheets = [];

        
        $grouped = $this->items->groupBy('plu');

        foreach ($grouped as $plu => $data) {
            
            $description = $data->first()['itemDescp'] ?? 'No Description';
            
            $sheets[] = new PluSheetExport($plu, $description, $data);
        }

        return $sheets;
    }
}
