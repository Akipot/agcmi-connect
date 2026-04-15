<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberDetail extends Model
{
    protected $table = 'member_details';
    protected $primaryKey = 'user_id';
    
    public $timestamps = false;
    protected $guarded = []; 

    public function account()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
