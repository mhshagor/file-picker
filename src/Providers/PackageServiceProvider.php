<?php

namespace Mhshagor\FilePicker\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;

class PackageServiceProvider extends ServiceProvider
{
    protected $basePath = __DIR__ . '/../../';

    protected $packages = [
        'file-picker',
    ];
    
    private function publishPackage($package)
    {
        if($package === 'all') {
            $this->publishAll();
            return;
        }
        $paths = match($package) {
            'file-picker' => $this->publishFilePicker($package),
            
            default => throw new \Exception("Unknown package: {$package}"),
        };
        
        $this->publishes($paths, $package);
    }

    private function publishAll()
    {
        $paths = [
            ...$this->publishFilePicker('file-picker'),
        ];
        
        $this->publishes($paths, 'all');
    }

    private function publishFilePicker($package)
    {
        return [
            $this->basePath . '/resources/demo/file-picker.html' => resource_path('views/sgd/file-picker.html'),
            $this->basePath . '/resources/js' => resource_path('js/sgd'),
            $this->basePath . '/resources/css' => resource_path('css/sgd'),
        ];
    }


    public function boot()
    {
        foreach ($this->packages as $package) {
            $this->publishPackage($package);
        }
        $this->publishAll();
    }
    
    public function register()
    {
        // Components will be auto-discovered via Laravel's component discovery
    }
}
