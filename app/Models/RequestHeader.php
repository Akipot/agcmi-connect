<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestHeader extends Model
{
    protected $table = 'RequestHeaders';

    protected $primaryKey = 'Request_ID';
    protected $fillable = [
        'RequestNo', 
        'DateGenerated', 
        'TotalStores', 
        'TotalRequests'
    ];

    protected $casts = [
        'DateGenerated' => 'datetime',
    ];
}
