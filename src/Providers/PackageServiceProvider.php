<?php

namespace Mhshagor\FilePicker\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Mhshagor\FilePicker\View\Components\FilePicker;

class PackageServiceProvider extends ServiceProvider
{
    protected $basePath = __DIR__ . '/../../';

    private const TAG_COMPONENTS = 'file-picker';

    private function publishPaths(): array
    {
        return [
            $this->basePath . 'assets/demo' => resource_path('views/vendor/file-picker'),
            $this->basePath . 'assets/js' => resource_path('js/vendor/file-picker'),
            $this->basePath . 'assets/css' => resource_path('css/vendor/file-picker'),
            $this->basePath . 'assets/components' => resource_path('views/components'),
        ];
    }

    public function boot()
    {
        $publishPaths = $this->publishPaths();

        // Routes load kori - views, assets, all routes
        $routePath = realpath($this->basePath . 'routes/web.php');
        if ($routePath && file_exists($routePath)) {
            $this->loadRoutesFrom($routePath);
        }

        // Blade directives - route theke direct serve
        Blade::directive('filePickerCss', function () {
            return '<link rel="stylesheet" href="' . url('file-picker/assets/css/file-picker.css') . '">';
        });

        Blade::directive('filePickerJs', function () {
            return '<script src="' . url('file-picker/assets/js/file-picker.js') . '"></script>';
        });

        // Publish chara kaj korar jonno views package theke load kori
        $viewPath = realpath($this->basePath . 'assets/components');
        if ($viewPath && is_dir($viewPath)) {
            $this->loadViewsFrom($viewPath, 'file-picker');

            // Blade components manually register kori
            Blade::component('file-picker::file-picker', 'file-picker');
            Blade::component('file-picker.file-picker', FilePicker::class);
        }
    }

    public function register()
    {
        //
    }
}
