@props([
    'id' => '',
    'name' => '',
    'class' => '',
    'multiple' => false,
    'max' => 2,
    'type' => 'image', // image, file
    'preview' => true,
    'previewType' => 'dropdown', // grid, list, file, thumbnail, dropdown, profile
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
            {{ Str::headline($label) }} <small
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
    <input
        {{ $attributes->merge(['class' => 'file-picker ']) }}
        name="{{ $name }}"
        id="{{ $id }}"
        max="{{ $max }}"
        multiple="{{ $multiple ? 'true' : 'false' }}"
        type="{{ $type }}"
        accept="{{ $type === 'file' ? '*/*' : 'image/*' }}"
        preview="{{ $preview ? 'true' : 'false' }}"
        preview-type="{{ $previewType }}"
        value='@json($value)'
    />
    @error($name)
        <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
    @enderror
</div>
