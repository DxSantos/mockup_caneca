<?php

use App\Http\Controllers\MugMockupController;
use Illuminate\Support\Facades\Route;

Route::post('/artworks/upload', [MugMockupController::class, 'store'])->name('api.artworks.upload');