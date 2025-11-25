// File Converter Application
class FileConverter {
    constructor() {
        this.currentFile = null;
        this.convertedBlob = null;
        this.supportedFormats = {
            image: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'],
            text: ['txt', 'json', 'csv', 'html']
        };
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const removeFile = document.getElementById('removeFile');
        const convertBtn = document.getElementById('convertBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const convertAnotherBtn = document.getElementById('convertAnotherBtn');

        // Drag and drop events
        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));

        // File input change
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Button clicks
        removeFile.addEventListener('click', () => this.resetConverter());
        convertBtn.addEventListener('click', () => this.convertFile());
        downloadBtn.addEventListener('click', () => this.downloadFile());
        convertAnotherBtn.addEventListener('click', () => this.resetConverter());
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        this.currentFile = file;
        this.displayFileInfo(file);
        this.populateConversionOptions(file);
    }

    displayFileInfo(file) {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileInfo = document.getElementById('fileInfo');
        const uploadSection = document.querySelector('.upload-section');
        const conversionOptions = document.getElementById('conversionOptions');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);

        uploadSection.style.display = 'none';
        fileInfo.style.display = 'block';
        conversionOptions.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    getFileType(file) {
        const ext = this.getFileExtension(file.name);

        if (this.supportedFormats.image.includes(ext)) {
            return 'image';
        } else if (this.supportedFormats.text.includes(ext)) {
            return 'text';
        }
        return 'unknown';
    }

    populateConversionOptions(file) {
        const select = document.getElementById('outputFormat');
        const fileType = this.getFileType(file);
        const currentExt = this.getFileExtension(file.name);

        select.innerHTML = '<option value="">Select format...</option>';

        if (fileType === 'image') {
            this.supportedFormats.image.forEach(format => {
                if (format !== currentExt) {
                    const option = document.createElement('option');
                    option.value = format;
                    option.textContent = format.toUpperCase();
                    select.appendChild(option);
                }
            });
        } else if (fileType === 'text') {
            this.supportedFormats.text.forEach(format => {
                if (format !== currentExt) {
                    const option = document.createElement('option');
                    option.value = format;
                    option.textContent = format.toUpperCase();
                    select.appendChild(option);
                }
            });
        } else {
            select.innerHTML = '<option value="">Unsupported file type</option>';
        }
    }

    async convertFile() {
        const outputFormat = document.getElementById('outputFormat').value;

        if (!outputFormat) {
            alert('Please select an output format');
            return;
        }

        const fileType = this.getFileType(this.currentFile);

        this.showProgress();

        try {
            if (fileType === 'image') {
                await this.convertImage(this.currentFile, outputFormat);
            } else if (fileType === 'text') {
                await this.convertText(this.currentFile, outputFormat);
            }

            this.showResult();
        } catch (error) {
            console.error('Conversion error:', error);
            alert('Conversion failed: ' + error.message);
            this.hideProgress();
        }
    }

    async convertImage(file, outputFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);

                        let mimeType;
                        let quality = 0.9;

                        switch(outputFormat.toLowerCase()) {
                            case 'png':
                                mimeType = 'image/png';
                                break;
                            case 'jpg':
                            case 'jpeg':
                                mimeType = 'image/jpeg';
                                break;
                            case 'webp':
                                mimeType = 'image/webp';
                                break;
                            case 'bmp':
                                mimeType = 'image/bmp';
                                break;
                            case 'gif':
                                mimeType = 'image/gif';
                                break;
                            default:
                                mimeType = 'image/png';
                        }

                        canvas.toBlob((blob) => {
                            if (blob) {
                                this.convertedBlob = blob;
                                this.updateProgress(100);
                                resolve();
                            } else {
                                reject(new Error('Failed to create blob'));
                            }
                        }, mimeType, quality);
                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async convertText(file, outputFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    const currentExt = this.getFileExtension(file.name);
                    let convertedContent;

                    this.updateProgress(30);

                    // Parse current format
                    let data;
                    if (currentExt === 'json') {
                        data = JSON.parse(content);
                    } else if (currentExt === 'csv') {
                        data = this.parseCSV(content);
                    } else {
                        data = content;
                    }

                    this.updateProgress(60);

                    // Convert to target format
                    switch(outputFormat.toLowerCase()) {
                        case 'txt':
                            convertedContent = typeof data === 'object' ?
                                JSON.stringify(data, null, 2) : data.toString();
                            break;
                        case 'json':
                            convertedContent = typeof data === 'object' ?
                                JSON.stringify(data, null, 2) : JSON.stringify({ content: data });
                            break;
                        case 'csv':
                            convertedContent = this.toCSV(data);
                            break;
                        case 'html':
                            convertedContent = this.toHTML(data, file.name);
                            break;
                        default:
                            convertedContent = content;
                    }

                    this.updateProgress(90);

                    this.convertedBlob = new Blob([convertedContent], {
                        type: this.getMimeType(outputFormat)
                    });

                    this.updateProgress(100);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    parseCSV(csv) {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            data.push(obj);
        }

        return data;
    }

    toCSV(data) {
        if (typeof data === 'string') {
            return data;
        }

        if (Array.isArray(data) && data.length > 0) {
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];

            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header] || '';
                    return typeof value === 'string' && value.includes(',') ?
                        `"${value}"` : value;
                });
                csvRows.push(values.join(','));
            });

            return csvRows.join('\n');
        }

        return JSON.stringify(data);
    }

    toHTML(data, filename) {
        const content = typeof data === 'object' ?
            JSON.stringify(data, null, 2) : data.toString();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>${filename}</h1>
    <pre>${this.escapeHtml(content)}</pre>
</body>
</html>`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    getMimeType(format) {
        const mimeTypes = {
            'txt': 'text/plain',
            'json': 'application/json',
            'csv': 'text/csv',
            'html': 'text/html'
        };
        return mimeTypes[format.toLowerCase()] || 'text/plain';
    }

    showProgress() {
        document.getElementById('conversionOptions').style.display = 'none';
        document.getElementById('progressSection').style.display = 'block';
        this.updateProgress(0);
    }

    updateProgress(percent) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = percent + '%';
        progressText.textContent = percent < 100 ?
            'Converting... ' + percent + '%' : 'Conversion complete!';
    }

    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }

    showResult() {
        this.hideProgress();
        document.getElementById('resultSection').style.display = 'block';
    }

    downloadFile() {
        if (!this.convertedBlob) return;

        const outputFormat = document.getElementById('outputFormat').value;
        const originalName = this.currentFile.name.split('.');
        originalName.pop();
        const newFileName = originalName.join('.') + '.' + outputFormat;

        const url = URL.createObjectURL(this.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetConverter() {
        this.currentFile = null;
        this.convertedBlob = null;

        document.querySelector('.upload-section').style.display = 'block';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('conversionOptions').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('fileInput').value = '';
        document.getElementById('outputFormat').innerHTML = '<option value="">Select format...</option>';
    }
}

// Initialize the converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileConverter();
});
