<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents; 
use Maatwebsite\Excel\Events\AfterSheet;   
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Str;

class PluSheetExport implements FromView, WithTitle, ShouldAutoSize, WithStyles, WithEvents
{
    protected $plu;
    protected $description;
    protected $items;

    public function __construct($plu, $description, $items)
    {
        $this->plu = $plu;
        $this->description = $description;
        $this->items = $items;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $dynamicPassword = now()->format('mdY');

                $protection = $event->sheet->getDelegate()->getProtection();
                
                $protection->setPassword($dynamicPassword);
                $protection->setSheet(true);
                
                $protection->setFormatColumns(true);
                $protection->setFormatRows(true);   
                $protection->setSort(true);         
                $protection->setAutoFilter(true);    
            },
        ];
    }

    public function view(): View
    {
        return view('exports.allocation', [
            'items' => $this->items
        ]);
    }

    public function title(): string
    {
        $title = "[{$this->plu}] " . str_replace(['/', '*', '?', '[', ']', ':', '\\'], '-', $this->description);
        return Str::limit($title, 31, '');
    }

    public function styles(Worksheet $sheet)
    {

        $lastRow = 8 + count($this->items);

        return [
            'A1:A6' => ['font' => ['bold' => true]],
            
            'B2:B3' => ['font' => ['bold' => true, 'color' => ['rgb' => '1F4E78']]],

            7 => [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'D3D3D3']
                ]
            ],

            'A7:I' . $lastRow => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],
        ];
    }
}
