<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'accounts';
    protected $primaryKey = 'user_id';
    protected $rememberTokenName = 'remember_token';
    
    protected $fillable = [
        'userName',
        'password',
        'type',
        'remember_token'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public $timestamps = true;


    public static function checkAccount($username)
    {
        return self::where('userName', $username)->first();
    }


    public function isAdmin(): bool
    {
        return (int) $this->type === 1;
    }

    public function getTypeNameAttribute()
    {
        return match ((int)$this->type) {
            1 => 'Admin',
            2 => 'Member',
            default => 'User',
        };
    }

    public function getMemberDetails()
    {
        $userWithDetails = $this->load('details');

        if (!$userWithDetails->details) {
            return (object) ['Type' => $this->type_name];
        }

        return (object) array_merge(
            $userWithDetails->details->toArray(), 
            ['Type' => $this->type_name]
        );
    }

    public function details()
    {
        return $this->hasOne(MemberDetail::class, 'user_id', 'user_id');
    }
}
