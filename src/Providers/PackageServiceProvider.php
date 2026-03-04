<?php

namespace Mhshagor\FilePicker\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

class PackageServiceProvider extends ServiceProvider
{
    protected $basePath = __DIR__ . '/../../';

    private const TAG_COMPONENTS = 'file-picker';

    private function publishPaths(): array
    {
        return [
            $this->basePath . 'assets/demo' => resource_path('views/sgd'),
            $this->basePath . 'assets/js' => resource_path('js/sgd'),
            $this->basePath . 'assets/css' => resource_path('css/sgd'),
            $this->basePath . 'assets/components' => resource_path('views/components'),
        ];
    }
    

    public function boot()
    {
        $publishPaths = $this->publishPaths();

        $this->publishes($publishPaths, self::TAG_COMPONENTS);
    }
    
    public function register()
    {
        // Components will be auto-discovered via Laravel's component discovery
    }
}
