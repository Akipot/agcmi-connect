<?php

namespace App\Models;

use App\Helpers\MyHelper;
use Illuminate\Support\Facades\DB;
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

    public function isAdmin(): bool
    {
        return (int) $this->type === 1;
    }

    public static function checkAccount($data)
    {
        $result = DB::select('[sp_account_Get] ' . MyHelper::generateQM($data), $data);
        
        if (!empty($result)) {
            return self::hydrate([(array) $result[0]])->first();
        }

        return null;
    }
}
