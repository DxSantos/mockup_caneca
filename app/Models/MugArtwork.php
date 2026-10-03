<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MugArtwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'original_path',
        'processed_path',
        'width_mm',
        'height_mm',
    ];

    /**
     * Retorna a URL pública do arquivo processado para o Three.js.
     */
    public function getProcessedUrlAttribute(): string
    {
        return asset('storage/' . $this->processed_path);
    }
}