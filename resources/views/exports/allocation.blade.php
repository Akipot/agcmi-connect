<table>
    <thead>
        {{-- Summary Header Section (Rows 1-5) --}}
        <tr>
            <th colspan="1" style="font-weight: bold; background-color: #E2EFDA;">Generated Date:</th>
            <th colspan="7" style="text-align: left; background-color: #E2EFDA;">{{ now()->format('Y-m-d H:i') }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Location:</th>
            <th colspan="7" style="text-align: left; font-weight: bold; color: #1F4E78;">{{ $items->first()['locationCode'] ?? 'N/A' }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Item:</th>
            <th colspan="7" style="text-align: left; font-weight: bold; color: #1F4E78;">{{ $items->first()['itemDescp'] ?? 'N/A' }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Total Stores:</th>
            <th colspan="7" style="text-align: left;">{{ count($items) }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Total Cases:</th>
            <th colspan="7" style="text-align: left;">{{ collect($items)->sum('qtyCase') }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Total QTY (PCS):</th>
            <th colspan="7" style="text-align: left;">{{ collect($items)->sum('qtyPcs') }}</th>
        </tr>
        
        {{-- Spacer Row (Row 6) --}}
        <tr><th colspan="8"></th></tr>

        {{-- Main Table Headers (Row 7) --}}
        <tr>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">StoreCode</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">StoreName</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">PLU</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">ItemDescription</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Location</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">QTY (PCS)</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">QTY (ON HAND)</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Allocation (Case)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $item)
            @php
                $pcs = $item['qtyPcs'] ?? 0;
                $onHand = $item['qtyOnHand'] ?? 0;
                $case = $item['qtyCase'] ?? 0;
                
                // If all three are zero, flag the row
                $rowIsRed = ($pcs == 0 && $onHand == 0 && $case == 0);
                
                // Define the style string to avoid repeating it
                $rowStyle = $rowIsRed ? 'background-color: #FFC7CE; color: #9C0006;' : '';
            @endphp
            <tr style="{{ $rowStyle }}">
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['storeCode'] ?? '' }}</td>
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['store'] ?? '' }}</td>
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">'{{ $item['plu'] ?? '' }}</td> 
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['itemDescp'] ?? '' }}</td>
                <td style="text-align: center; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['locationCode'] ?? '' }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($pcs) }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($onHand) }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($case) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
