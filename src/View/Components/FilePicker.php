<?php

namespace Mhshagor\FilePicker\View\Components;

use Illuminate\View\Component;

class FilePicker extends Component
{
    public string $id;
    public string $name;
    public string $class;
    public bool $multiple;
    public int $max;
    public string $type;
    public bool $preview;
    public string $previewType;
    public string $label;
    public string $labelClass;
    public bool $required;
    public $value;

    public function __construct(
        string $name = '',
        string $id = '',
        string $class = '',
        bool $multiple = false,
        int $max = 2,
        string $type = 'image',
        bool $preview = true,
        string $previewType = 'dropdown',
        string $label = '',
        string $labelClass = '',
        bool $required = false,
        $value = []
    ) {
        $this->name = $name;
        $this->id = $id ?: $name;
        $this->class = $class;
        $this->multiple = $multiple;
        $this->max = $max;
        $this->type = $type;
        $this->preview = $preview;
        $this->previewType = $type === 'file' ? ($previewType === 'dropdown' ? 'dropdown' : 'file') : $previewType;
        $this->label = $label;
        $this->labelClass = $labelClass;
        $this->required = $required;
        $this->value = $value;
    }

    public function render()
    {
        return view('file-picker::file-picker');
    }
}
