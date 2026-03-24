<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestDetail extends Model
{
    protected $table = 'RequestDetails';

    protected $fillable = [
        'Request_ID', 'StoreCode', 'StoreName', 'PLU', 
        'ItemDescription', 'Location', 'Tail1', 'C2', 
        'Quantity', 'OH_AfterAllocation'
    ];
}
