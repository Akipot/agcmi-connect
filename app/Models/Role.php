<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $primaryKey = 'role_id';

    protected $fillable = [
        'role',
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
