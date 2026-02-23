@props([
    'id' => '',
    'name' => '',
    'class' => '',
    'multiple' => false,
    'max' => 2,
    'type' => 'image', // image, file
    'preview' => true,
    'previewType' => 'thumbnail', // grid, list, file, thumbnail, dropdown
    'label' => '',
    'labelClass' => '',
    'required' => false,
    'value' => [],
])

@php
    $id = $id ? $id : $name;
    $labelClass .= $required ? ' required' : '';
    $labelClass .= $errors->has($name) ? ' text-red-500' : '';
    $previewType = $type === 'file' ? ($previewType === 'dropdown' ? 'dropdown' : 'file') : $previewType;
@endphp
<div class="space-y-1">
    @if ($label)
        <label
            for="{{ $id }}"
            class="base-label {{ $labelClass }}"
        >
            {{ headline($label) }} <small
                class="text-xs {{ $errors->has($name) ? ' text-red-500' : 'text-gray-500' }}">(Max {{ $max }}
                MB)</small>
        </label>
    @endif

    @php
        //$logo1 = asset('/images/logos/logo.png');
        //$logo2 = asset('/images/logos/logo.png');
        //$imagesArray = [$logo1, $logo2];
        //$singleImage = $logo1;
        //$value = $multiple ? $imagesArray : $singleImage;
    @endphp
    <div
        {{ $attributes->merge(['class' => 'image-picker ']) }}
        data-name="{{ $name }}"
        data-id="{{ $id }}"
        data-max="{{ $max }}"
        data-multiple="{{ $multiple ? 'true' : 'false' }}"
        data-type="{{ $type }}"
        data-accept="{{ $type === 'file' ? '*/*' : 'image/*' }}"
        data-preview="{{ $preview ? 'true' : 'false' }}"
        data-preview-type="{{ $previewType }}"
        data-value='@json($value)'
    ></div>
    @error($name)
        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
    @enderror
</div>
