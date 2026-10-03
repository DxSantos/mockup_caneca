<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mug_artworks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('original_path');
            $table->string('processed_path');
            $table->decimal('width_mm', 6, 2)->default(270.00);
            $table->decimal('height_mm', 6, 2)->default(100.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mug_artworks');
    }
};