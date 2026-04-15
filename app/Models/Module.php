<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $primaryKey = 'module_id';

    protected $fillable = [
        'module',
        'isActive',
        'created_by',
        'insertDate'
    ];

    public $timestamps = false;

    public function creator()
    {
        return $this->belongsTo(Account::class, 'insertBy', 'user_id');
    }
}
