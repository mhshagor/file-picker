@props([
    'id' => '',
    'name' => '',
    'class' => '',
    'multiple' => false,
    'max' => 2,
    'type' => 'image', // image, file
    'preview' => true,
    'previewType' => 'grid', // grid, list, file, thumbnail, dropdown
    'label' => '',
    'labelClass' => '',
    'required' => false,
    'errorClass' => '',
])

@php
    $id = $id ? $id : $name;
    $labelClass = $labelClass ?? '';
    if ($required) $labelClass .= ' required';
    if ($errorClass) $labelClass .= ' ' . $errorClass;
    $previewType = $type === 'file' ? ($previewType === 'dropdown' ? 'dropdown' : 'file') : $previewType;
@endphp
<div class="space-y-1">
    @if ($label)
        <label
            for="{{ $id }}"
            class="base-label {{ $labelClass }}"
        >
            {{ headline($label) }} <small class="text-xs text-gray-500">(Max {{ $max }} MB)</small>
        </label>
    @endif
    <div
        {{ $attributes->merge(['class' => 'image-picker ']) }}
        data-name="{{ $name }}"
        data-id="{{ $id }}"
        data-max="{{ $max }}"
        data-multiple="{{ $multiple ? 'true' : 'false' }}"
        data-type="{{ $type }}"
        accept="{{ $type === 'file' ? '*/*' : 'image/*' }}"
        data-preview="{{ $preview ? 'true' : 'false' }}"
        data-preview-type="{{ $previewType }}"
    ></div>
    @if ($errorClass)
        <p class="text-red-500 text-xs mt-1">{{ $errorClass }}</p>
    @endif
</div>
