<table>
    <thead>
        {{-- Summary Header Section (Rows 1-5) --}}
        <tr>
            <th colspan="1" style="font-weight: bold; background-color: #E2EFDA;">Generated Date:</th>
            <th colspan="8" style="text-align: left; background-color: #E2EFDA;">{{ now()->format('Y-m-d H:i') }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Location:</th>
            <th colspan="8" style="text-align: left; font-weight: bold; color: #1F4E78;">{{ $items->first()['locationCode'] ?? 'N/A' }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Item:</th>
            <th colspan="8" style="text-align: left; font-weight: bold; color: #1F4E78;">{{ $items->first()['itemDescp'] ?? 'N/A' }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Total Stores:</th>
            <th colspan="8" style="text-align: left;">{{ count($items) }}</th>
        </tr>
        <tr>
            <th colspan="1" style="font-weight: bold;">Total Requests:</th>
            <th colspan="8" style="text-align: left;">{{ collect($items)->sum('qtyRequest') }}</th>
        </tr>
        
        {{-- Spacer Row (Row 6) --}}
        <tr><th colspan="8"></th></tr>

        {{-- Main Table Headers (Row 7) --}}
        <tr>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Store Code</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Store Name</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">PLU</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Item Description</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Location</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">TAIL1</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">C2</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">Quantity</th>
            <th style="font-weight: bold; background-color: #D3D3D3; border: 1px solid #000000; text-align: center;">On Hand After Allocation</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $item)
            @php
                $c2 = $item['c2'] ?? 0;
                $quanity = $item['qtyRequest'] ?? 0;
                $ohAfterAllocation = $item['ohAfterAllocation'] ?? 0;

                $rowIsRed = ($ohAfterAllocation == 0);
                
                $rowStyle = $rowIsRed ? 'background-color: #FFC7CE; color: #9C0006;' : '';
            @endphp
            <tr style="{{ $rowStyle }}">
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['storeCode'] ?? '' }}</td>
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['store'] ?? '' }}</td>
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['plu'] ?? '' }}</td> 
                <td style="text-align: left; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['itemDescp'] ?? '' }}</td>
                <td style="text-align: center; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['locationCode'] ?? '' }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ $item['tail1'] ?? '' }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($c2) }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($quanity) }}</td>
                <td style="text-align: right; border: 1px solid #000000; {{ $rowStyle }}">{{ number_format($ohAfterAllocation) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
