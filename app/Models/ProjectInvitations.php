<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectInvitations extends Model
{
    protected $fillable = [
        'project_id',
        'invited_by',
        'invited_user_id',
        'code',
        'type',
        'status',
        'expires_at',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function invitedUser()
    {
        return $this->belongsTo(User::class, 'invited_user_id');
    }
}
