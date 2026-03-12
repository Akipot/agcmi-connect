<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class AllocationExport implements FromView
{
    protected $requests;

    public function __construct(array $requests)
    {
        $this->requests = $requests;
    }

    public function view(): View
    {
        return view('exports.allocation', [
            'items' => $this->requests
        ]);
    }
}
