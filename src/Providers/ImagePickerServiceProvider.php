<?php

namespace Mhshagor\ImagePicker\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ImagePickerServiceProvider extends ServiceProvider {
    public function register(): void {
    }

    public function boot(): void {
        $this->registerPublishing();
    }


    protected function registerViewComposers(): void {
        View::composer('image-picker::*');
    }

    protected function registerPublishing(): void {
        $this->publishes([
            __DIR__ . '/../../resources/views/components' => \resource_path('views/components/sgd/form'),
        ], 'image-picker');
        
        $this->publishes([
            __DIR__ . '/../../resources/js' => \resource_path('js/sgd'),
        ], 'image-picker');
        
        $this->publishes([
            __DIR__ . '/../../resources/css' => \resource_path('css/sgd'),
        ], 'image-picker');
    }
}
