<?php

use Illuminate\Support\Facades\Route;

// File Picker assets serve korar route
Route::get('file-picker/assets/{type}/{file}', function ($type, $file) {
    $basePath = __DIR__ . '/../assets/';
    $allowedTypes = ['js', 'css', 'demo'];

    if (!in_array($type, $allowedTypes)) {
        abort(404);
    }

    $path = $basePath . $type . '/' . $file;

    if (!file_exists($path)) {
        abort(404);
    }

    $contentType = match ($type) {
        'js' => 'application/javascript',
        'css' => 'text/css',
        default => 'text/html',
    };

    return response(file_get_contents($path))
        ->header('Content-Type', $contentType)
        ->header('Cache-Control', 'public, max-age=86400');
})->where('file', '.*')->name('file-picker.assets');
