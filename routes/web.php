<?php

use App\Http\Controllers\MugMockupController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('mockup');
});