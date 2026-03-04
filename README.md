# File Picker for Laravel

A beautiful and customizable image picker component for Laravel applications with drag-and-drop support, multiple preview types, and file validation.

## Features

- 🖼️ **Drag & Drop Support** - Intuitive file upload interface
- 📱 **Responsive Design** - Works on all device sizes
- 🎨 **Multiple Preview Types** - Grid, list, thumbnail, dropdown, and file views
- ✅ **File Validation** - Built-in size and type validation
- 🔄 **Multiple Files** - Support for single or multiple file uploads
- 🎯 **Easy Integration** - Simple Blade component usage
- 📦 **Zero Dependencies** - Pure JavaScript, no external libraries required

## Installation

### 1. Install the package

```bash
composer require mhshagor/file-picker:dev-main
# or
composer require mhshagor/file-picker
```

If you are not using Laravel, you do not need Composer. Use the standalone instructions below.

### 2. Publish the assets

```bash
php artisan vendor:publish --tag=file-picker
```

### 3. Add to your app.js

Add this line to your `resources/js/app.js`:

```javascript
import "./sgd/file-picker.js";
```

### Add to your app.css

Add this line to your `resources/css/app.css`:

```css
@import "./sgd/file-picker.css";
```

### 4. Compile your assets

```bash
npm run dev
# or
npm run build
```

## Usage

### Basic Usage

```blade
<x-sgd.form.file-picker 
    name="profile_image" 
    label="Profile Image"
/>
```

### Advanced Usage

```blade
<x-sgd.form.file-picker 
    name="gallery_images" 
    label="Gallery Images"
    :multiple="true"
    max="10"
    type="image"
    preview-type="grid"
    :required="true"
    class="custom-class"
/>
```

## Standalone HTML/JS Usage (No Laravel)

Copy these files from the package into your project and include them in your HTML:

- **CSS**: `/vendor/mhshagor/file-picker/asset/css/file-picker.css`
- **JS**: `/vendor/mhshagor/file-picker/asset/js/file-picker.js`
- **Demo HTML**: `/vendor/mhshagor/file-picker/asset/demo/file-picker.html`

For non-Laravel projects, you only need the built assets (`dist/`) and the demo HTML file.

Generate a `dist/` folder (recommended):

```bash
npm run build
```

Then use:

- **CSS**: `dist/file-picker.min.css`
- **JS**: `dist/file-picker.min.js`

Example:

```html
<link rel="stylesheet" href="./file-picker.min.css" />

<div
  class="file-picker"
  data-name="files"
  data-id="files"
  data-max="5"
  data-multiple="true"
  data-type="image"
  data-accept="image/*"
  data-preview="true"
  data-preview-type="grid"
></div>

<script src="./file-picker.min.js"></script>
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | required | Input field name |
| `id` | string | (auto-generated) | Input field ID |
| `label` | string | empty | Display label for the field |
| `multiple` | boolean | false | Allow multiple file selection |
| `max` | number | 2 | Maximum file size in MB |
| `type` | string | 'image' | Accept 'image' or 'file' |
| `preview` | boolean | true | Show file preview |
| `previewType` | string | 'grid' | Preview style: 'grid', 'list', 'file', 'thumbnail', 'dropdown' |
| `required` | boolean | false | Make field required |
| `class` | string | empty | Additional CSS classes |
| `labelClass` | string | empty | Additional CSS classes for label |

## Preview Types

### Grid Preview
```blade
preview-type="grid"
```
Shows files in a responsive grid layout with thumbnails.

### List Preview
```blade
preview-type="list"
```
Displays files in a vertical list with thumbnails and filenames.

### Thumbnail Preview
```blade
preview-type="thumbnail"
```
Shows small thumbnails in a compact horizontal layout.

### File Preview
```blade
preview-type="file"
```
Displays files as downloadable links.

### Dropdown Preview
```blade
preview-type="dropdown"
```
Shows a dropdown with file count and list when clicked.

## File Validation

The component includes built-in validation:

- **File Type Validation**: Automatically validates file types based on the `type` parameter
- **Size Validation**: Validates file size against the `max` parameter
- **Error Messages**: User-friendly error messages with auto-dismiss

## Styling

The component uses Tailwind CSS classes and includes:

- `base-input` - Base input styling
- `base-label` - Base label styling
- Responsive design classes
- Hover and focus states
- Error state styling

You can customize the appearance by:

1. Overriding the CSS classes
2. Adding custom classes via the `class` parameter
3. Modifying the published Blade component

## Form Integration

The component integrates seamlessly with Laravel forms:

```blade
<form method="POST" enctype="multipart/form-data">
    @csrf
    
    <x-sgd.form.file-picker 
        name="avatar" 
        label="Upload Avatar"
        :required="true"
    />
    
    <button type="submit">Submit</button>
</form>
```

## Error Handling

The component automatically displays Laravel validation errors:

```blade
@error('avatar')
    <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
@enderror
```

## File Processing

In your controller, handle the uploaded files:

```php
public function store(Request $request)
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);
    
    if ($request->hasFile('avatar')) {
        $file = $request->file('avatar');
        $path = $file->store('avatars', 'public');
        // Save path to database
    }
    
    if ($request->hasFile('gallery_images')) {
        foreach ($request->file('gallery_images') as $file) {
            $path = $file->store('gallery', 'public');
            // Save path to database
        }
    }
}
```

## Customization

### Custom Component Location

If you want to customize the component, you can modify the published files:

- **Views**: `resources/views/components/sgd/form/file-picker.blade.php`
- **JavaScript**: `resources/js/sqd/file-picker.js`

### Custom Styling

Add custom CSS to override default styles:

```css
.file-picker .base-input {
    /* Custom input styling */
}

.file-picker .base-label {
    /* Custom label styling */
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Support

For support, please contact [mhshagor](mailto:srq001100@gmail.com).

---

**Made with ❤️ for the Laravel community**
