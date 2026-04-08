<?php

namespace Mhshagor\FilePicker\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Mhshagor\FilePicker\View\Components\FilePicker;

class PackageServiceProvider extends ServiceProvider
{
    protected $basePath = __DIR__ . '/../../';

    private const TAG_COMPONENTS = 'file-picker';

    private function publishPaths(): array
    {
        return [
            //$this->basePath . 'assets/demo' => resource_path('views/vendor/file-picker'),
            $this->basePath . 'assets/js' => resource_path('js/vendor/file-picker'),
            $this->basePath . 'assets/css' => resource_path('css/vendor/file-picker'),
            //$this->basePath . 'assets/components' => resource_path('views/components'),
        ];
    }

    public function boot()
    {
        $publishPaths = $this->publishPaths();

        $this->publishes($publishPaths, self::TAG_COMPONENTS);

        $viewPath = realpath($this->basePath . 'assets/components');
        if ($viewPath && is_dir($viewPath)) {
            $this->loadViewsFrom($viewPath, 'file-picker');

            Blade::component('file-picker::file-picker', 'file-picker');
            Blade::component('file-picker.file-picker', FilePicker::class);
        }
    }

    public function register()
    {
        //
    }
}
