<table>
    <thead>
    <tr>
        <th style="background-color: #E0E0E0; font-weight: bold;">Store Code</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">Store Name</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">PLU</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">Item Description</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">Location</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">QTY (PCS)</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">QTY (ON HAND)</th>
        <th style="background-color: #E0E0E0; font-weight: bold;">Allocation (Case)</th>
    </tr>
    </thead>
    <tbody>
    @foreach($items as $item)
        <tr>
            <td>{{ $item['storeCode'] }}</td>
            <td>{{ $item['store'] }}</td>
            <td>{{ $item['plu'] }}</td>
            <td>{{ $item['itemDescp'] }}</td>
            <td>{{ $item['locationCode'] }}</td>
            <td>{{ $item['qtyPcs'] }}</td>
            <td>{{ $item['qtyOnHand'] }}</td>
            <td>{{ $item['qtyCase'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
