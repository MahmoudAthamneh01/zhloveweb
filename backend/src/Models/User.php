<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    protected $table = 'users';

    protected $fillable = [
        'uuid',
        'username',
        'email',
        'password_hash',
        'first_name',
        'last_name',
        'avatar',
        'bio',
        'location',
        'website',
        'discord_id',
        'youtube_channel',
        'experience_points',
        'level',
        'rank_points',
        'wins',
        'losses',
        'draws',
        'is_active',
        'is_verified',
        'is_banned',
        'is_admin',
        'is_moderator',
        'last_login',
        'last_activity',
        'email_verified_at',
        'remember_token',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'id' => 'integer',
        'experience_points' => 'integer',
        'level' => 'integer',
        'rank_points' => 'integer',
        'wins' => 'integer',
        'losses' => 'integer',
        'draws' => 'integer',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'is_banned' => 'boolean',
        'is_admin' => 'boolean',
        'is_moderator' => 'boolean',
        'last_login' => 'datetime',
        'last_activity' => 'datetime',
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function clanMemberships(): BelongsToMany
    {
        return $this->belongsToMany(Clan::class, 'clan_members')
                   ->withPivot(['role', 'joined_at', 'contribution_points', 'is_active'])
                   ->withTimestamps();
    }

    public function activeClan(): HasOne
    {
        return $this->hasOne(ClanMember::class)->where('is_active', true);
    }

    public function forumPosts(): HasMany
    {
        return $this->hasMany(ForumPost::class);
    }

    public function forumComments(): HasMany
    {
        return $this->hasMany(ForumComment::class);
    }

    public function tournaments(): BelongsToMany
    {
        return $this->belongsToMany(Tournament::class, 'tournament_participants')
                   ->withPivot(['team_name', 'seed', 'status', 'placement', 'prize_won'])
                   ->withTimestamps();
    }

    public function challenges(): HasMany
    {
        return $this->hasMany(Challenge::class, 'challenger_id');
    }

    public function challengesReceived(): HasMany
    {
        return $this->hasMany(Challenge::class, 'challenged_id');
    }

    public function replays(): HasMany
    {
        return $this->hasMany(Replay::class, 'uploader_id');
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
                   ->withPivot(['awarded_by', 'awarded_at', 'is_displayed', 'notes'])
                   ->withTimestamps();
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    // Computed Properties
    public function getTotalMatchesAttribute(): int
    {
        return $this->wins + $this->losses + $this->draws;
    }

    public function getWinRateAttribute(): float
    {
        $totalMatches = $this->getTotalMatchesAttribute();
        return $totalMatches > 0 ? round(($this->wins / $totalMatches) * 100, 2) : 0.0;
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->getFullNameAttribute() ?: $this->username;
    }

    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar ? '/uploads/avatars/' . $this->avatar : '/images/default-avatar.png';
    }

    public function getIsOnlineAttribute(): bool
    {
        return $this->last_activity && $this->last_activity->diffInMinutes() < 15;
    }

    // Helper Methods
    public function hasRole(string $role): bool
    {
        switch ($role) {
            case 'admin':
                return $this->is_admin;
            case 'moderator':
                return $this->is_moderator || $this->is_admin;
            default:
                return false;
        }
    }

    public function isClanLeader(int $clanId = null): bool
    {
        if ($clanId) {
            return $this->clanMemberships()
                       ->where('clan_id', $clanId)
                       ->where('role', 'leader')
                       ->exists();
        }

        return $this->clanMemberships()
                   ->where('role', 'leader')
                   ->exists();
    }

    public function isClanMember(int $clanId): bool
    {
        return $this->clanMemberships()
                   ->where('clan_id', $clanId)
                   ->where('is_active', true)
                   ->exists();
    }

    public function canChallenge(User $opponent): bool
    {
        if ($this->id === $opponent->id) {
            return false;
        }

        if ($this->is_banned || $opponent->is_banned) {
            return false;
        }

        if (!$this->is_active || !$opponent->is_active) {
            return false;
        }

        // Check if there's already a pending challenge between these users
        $existingChallenge = Challenge::where(function ($query) use ($opponent) {
            $query->where('challenger_id', $this->id)
                  ->where('challenged_id', $opponent->id);
        })->orWhere(function ($query) use ($opponent) {
            $query->where('challenger_id', $opponent->id)
                  ->where('challenged_id', $this->id);
        })->where('status', 'pending')->exists();

        return !$existingChallenge;
    }

    public function addExperience(int $points): void
    {
        $this->experience_points += $points;
        
        // Calculate new level based on experience
        $newLevel = $this->calculateLevel($this->experience_points);
        if ($newLevel > $this->level) {
            $this->level = $newLevel;
            // TODO: Award level-up badge or notification
        }

        $this->save();
    }

    private function calculateLevel(int $experience): int
    {
        // Simple level calculation: every 1000 XP = 1 level
        return max(1, floor($experience / 1000) + 1);
    }

    public function updateActivity(): void
    {
        $this->last_activity = now();
        $this->save();
    }

    public function ban(string $reason = null): void
    {
        $this->is_banned = true;
        $this->is_active = false;
        $this->save();

        // TODO: Log ban reason and create notification
    }

    public function unban(): void
    {
        $this->is_banned = false;
        $this->is_active = true;
        $this->save();
    }

    public function verify(): void
    {
        $this->is_verified = true;
        $this->email_verified_at = now();
        $this->save();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeBanned($query)
    {
        return $query->where('is_banned', true);
    }

    public function scopeAdmins($query)
    {
        return $query->where('is_admin', true);
    }

    public function scopeModerators($query)
    {
        return $query->where(function ($q) {
            $q->where('is_moderator', true)->orWhere('is_admin', true);
        });
    }

    public function scopeByRank($query)
    {
        return $query->orderBy('rank_points', 'desc');
    }

    public function scopeOnline($query)
    {
        return $query->where('last_activity', '>=', now()->subMinutes(15));
    }
} 