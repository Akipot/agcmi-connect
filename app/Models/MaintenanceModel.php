<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class MaintenanceModel extends Model
{
    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->insertBy = Auth::user()?->user_id;
            $model->insertDate = now();
            $model->updateDate = now(); 
        });

        static::updating(function ($model) {
            $model->updateBy = Auth::user()?->user_id ??;
            $model->updateDate = now();
        });
    }
}
