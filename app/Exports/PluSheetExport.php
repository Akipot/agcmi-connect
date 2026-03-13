<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize; // Add this
use Maatwebsite\Excel\Concerns\WithStyles;    // Add this for borders/alignment
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Str;

class PluSheetExport implements FromView, WithTitle, ShouldAutoSize, WithStyles
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

    public function view(): View
    {
        return view('exports.allocation', [
            'items' => $this->items
        ]);
    }

    public function title(): string
    {
        // Clean special characters for Excel compatibility
        $title = "[{$this->plu}] " . str_replace(['/', '*', '?', '[', ']', ':', '\\'], '-', $this->description);
        return Str::limit($title, 31, '');
    }

    /**
     * Optional: Add thin borders and vertical alignment
     */
    public function styles(Worksheet $sheet)
    {
        // 6 header rows (5 summary + 1 spacer) + 1 column header row + data
        $lastRow = 7 + count($this->items);

        return [
            // Bold labels in Column A, Rows 1-5
            'A1:A5' => ['font' => ['bold' => true]],
            
            // Highlight the Item Description value specifically
            'B2' => ['font' => ['bold' => true, 'italic' => true]],

            // Main table headers on Row 7
            7 => [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'D3D3D3']
                ]
            ],

            // Full grid borders for the data table
            'A7:H' . $lastRow => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    ],
                ],
            ],
        ];
    }
}
