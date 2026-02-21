# Image Picker for Laravel

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
composer require mhshagor/image-picker:dev-main
# or
composer require mhshagor/image-picker
```

### 2. Publish the assets

```bash
php artisan vendor:publish --tag=image-picker
```

### 3. Add to your app.js

Add this line to your `resources/js/app.js`:

```javascript
import "./sqd/image-picker.js";
```

### Add to your app.css

Add this line to your `resources/css/app.css`:

```css
@import "./sqd/image-picker.css";
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
<x-sgd.form.image-picker 
    name="profile_image" 
    label="Profile Image"
/>
```

### Advanced Usage

```blade
<x-sgd.form.image-picker 
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
Shows images in a responsive grid layout with thumbnails.

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
    
    <x-sgd.form.image-picker 
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

- **Views**: `resources/views/components/sgd/form/image-picker.blade.php`
- **JavaScript**: `resources/js/sqd/image-picker.js`

### Custom Styling

Add custom CSS to override default styles:

```css
.image-picker .base-input {
    /* Custom input styling */
}

.image-picker .base-label {
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
