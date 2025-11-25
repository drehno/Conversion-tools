# File Converter

A simple, secure, and user-friendly file converter that runs entirely in your browser. Convert between various file formats without uploading your files to any server.

## Features

- **Client-Side Processing**: All conversions happen locally in your browser for maximum privacy and security
- **Drag & Drop Interface**: Easy-to-use interface with drag-and-drop support
- **Multiple Format Support**: Convert between images and text-based documents

## Supported Formats

### Images
- PNG
- JPG/JPEG
- WebP
- BMP
- GIF

### Documents
- TXT (Plain Text)
- JSON
- CSV
- HTML

## How to Use

1. Open `index.html` in your web browser
2. Drag and drop a file or click to browse
3. Select the output format you want
4. Click "Convert File"
5. Download your converted file

## Technical Details

The converter uses:
- **Canvas API** for image conversions
- **FileReader API** for reading files
- **Blob API** for creating downloadable files

All processing is done client-side using vanilla JavaScript - no frameworks required.

## Privacy & Security

Your files never leave your device. All conversions are performed locally in your browser using native web APIs.

## Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas API
- FileReader API
- Blob API

## Getting Started

Simply open the `index.html` file in any modern web browser. No installation or build process required.

## License

MIT License
