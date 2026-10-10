<?php

use App\Http\Controllers\MugMockupController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('mockup');
});

// Rota de Teste em Desenvolvimento
Route::get('/mockup-teste', function () {
    return view('mockup-test');
});