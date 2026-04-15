<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $table = 'accounts';
    protected $primaryKey = 'user_id';

    public function memberDetails()
    {
        return $this->hasOne(MemberDetail::class, 'user_id', 'user_id');
    }
}
