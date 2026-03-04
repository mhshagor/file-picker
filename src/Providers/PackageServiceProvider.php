<?php

namespace Mhshagor\FilePicker\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;

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
            $this->basePath . '/assets/demo/file-picker.html' => resource_path('views/sgd/file-picker.html'),
            $this->basePath . '/assets/js' => resource_path('js/sgd'),
            $this->basePath . '/assets/css' => resource_path('css/sgd'),
            $this->basePath . '/assets/components' => resource_path('views/components'),
        ];
    }


    public function boot()
    {
        foreach ($this->packages as $package) {
            $this->publishPackage($package);
        }
    }
    
    public function register()
    {
        // Components will be auto-discovered via Laravel's component discovery
    }
}
