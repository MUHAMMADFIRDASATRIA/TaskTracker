<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class project extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'tenggat'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(task::class);
    }
}
