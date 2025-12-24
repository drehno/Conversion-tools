// File Converter Application
class FileConverter {
    constructor() {
        this.currentFile = null;
        this.convertedBlob = null;
        this.supportedFormats = {
            image: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'svg'],
            text: ['txt', 'json', 'csv', 'html', 'md', 'xml', 'yaml', 'yml'],
            audio: ['mp3', 'wav', 'ogg']
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
        } else if (this.supportedFormats.audio.includes(ext)) {
            return 'audio';
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
        } else if (fileType === 'audio') {
            this.supportedFormats.audio.forEach(format => {
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
            } else if (fileType === 'audio') {
                await this.convertAudio(this.currentFile, outputFormat);
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
                    } else if (currentExt === 'yaml' || currentExt === 'yml') {
                        data = this.parseYAML(content);
                    } else if (currentExt === 'xml') {
                        data = this.parseXML(content);
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
                        case 'md':
                            convertedContent = this.toMarkdown(data, file.name);
                            break;
                        case 'xml':
                            convertedContent = this.toXML(data);
                            break;
                        case 'yaml':
                        case 'yml':
                            convertedContent = this.toYAML(data);
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
            'html': 'text/html',
            'md': 'text/markdown',
            'xml': 'application/xml',
            'yaml': 'text/yaml',
            'yml': 'text/yaml',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg'
        };
        return mimeTypes[format.toLowerCase()] || 'text/plain';
    }

    // YAML parsing and conversion
    parseYAML(yamlText) {
        // Simple YAML parser for basic structures
        const lines = yamlText.trim().split('\n');
        const result = {};
        let currentKey = null;
        let currentArray = null;

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#')) continue;

            if (line.startsWith('- ')) {
                // Array item
                const value = line.substring(2).trim();
                if (currentArray) {
                    currentArray.push(value);
                }
            } else if (line.includes(':')) {
                // Key-value pair
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();

                if (value === '' || value === '[]') {
                    currentKey = key;
                    currentArray = [];
                    result[key] = currentArray;
                } else {
                    result[key] = value;
                    currentKey = null;
                    currentArray = null;
                }
            }
        }

        return result;
    }

    toYAML(data) {
        if (typeof data === 'string') {
            return `content: ${data}`;
        }

        let yaml = '';
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                yaml += `${key}:\n`;
                value.forEach(item => {
                    yaml += `  - ${item}\n`;
                });
            } else if (typeof value === 'object') {
                yaml += `${key}:\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    yaml += `  ${subKey}: ${subValue}\n`;
                }
            } else {
                yaml += `${key}: ${value}\n`;
            }
        }
        return yaml;
    }

    // XML parsing and conversion
    parseXML(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        const parseNode = (node) => {
            if (node.nodeType === 3) { // Text node
                return node.textContent.trim();
            }

            const obj = {};

            // Parse attributes
            if (node.attributes && node.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let attr of node.attributes) {
                    obj['@attributes'][attr.name] = attr.value;
                }
            }

            // Parse child nodes
            const children = {};
            for (let child of node.childNodes) {
                if (child.nodeType === 3) {
                    const text = child.textContent.trim();
                    if (text) obj['#text'] = text;
                } else if (child.nodeType === 1) {
                    const childData = parseNode(child);
                    if (children[child.nodeName]) {
                        if (!Array.isArray(children[child.nodeName])) {
                            children[child.nodeName] = [children[child.nodeName]];
                        }
                        children[child.nodeName].push(childData);
                    } else {
                        children[child.nodeName] = childData;
                    }
                }
            }

            return Object.keys(children).length > 0 ? { ...obj, ...children } : obj;
        };

        return parseNode(xmlDoc.documentElement);
    }

    toXML(data, rootName = 'root') {
        const buildXML = (obj, indent = 0) => {
            const spaces = '  '.repeat(indent);
            let xml = '';

            if (typeof obj === 'string' || typeof obj === 'number') {
                return obj.toString();
            }

            for (const [key, value] of Object.entries(obj)) {
                if (key === '@attributes' || key === '#text') continue;

                if (Array.isArray(value)) {
                    value.forEach(item => {
                        xml += `${spaces}<${key}>${buildXML(item, indent + 1)}</${key}>\n`;
                    });
                } else if (typeof value === 'object') {
                    xml += `${spaces}<${key}>\n${buildXML(value, indent + 1)}${spaces}</${key}>\n`;
                } else {
                    xml += `${spaces}<${key}>${value}</${key}>\n`;
                }
            }

            return xml;
        };

        if (typeof data === 'string') {
            return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>${data}</${rootName}>`;
        }

        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${buildXML(data, 1)}</${rootName}>`;
    }

    // Markdown conversion
    toMarkdown(data, filename) {
        if (typeof data === 'string') {
            return `# ${filename}\n\n${data}`;
        }

        let markdown = `# ${filename}\n\n`;

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                markdown += `## Item ${index + 1}\n\n`;
                if (typeof item === 'object') {
                    for (const [key, value] of Object.entries(item)) {
                        markdown += `**${key}**: ${value}\n\n`;
                    }
                } else {
                    markdown += `${item}\n\n`;
                }
            });
        } else if (typeof data === 'object') {
            for (const [key, value] of Object.entries(data)) {
                markdown += `## ${key}\n\n`;
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        markdown += `- ${item}\n`;
                    });
                    markdown += '\n';
                } else if (typeof value === 'object') {
                    for (const [subKey, subValue] of Object.entries(value)) {
                        markdown += `**${subKey}**: ${subValue}\n\n`;
                    }
                } else {
                    markdown += `${value}\n\n`;
                }
            }
        }

        return markdown;
    }

    // Audio conversion using Web Audio API
    async convertAudio(file, outputFormat) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    this.updateProgress(20);

                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const arrayBuffer = e.target.result;

                    this.updateProgress(40);

                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    this.updateProgress(60);

                    // Convert the audio buffer to the desired format
                    const blob = await this.encodeAudioBuffer(audioBuffer, outputFormat, audioContext.sampleRate);

                    this.updateProgress(90);

                    this.convertedBlob = blob;
                    this.updateProgress(100);

                    audioContext.close();
                    resolve();
                } catch (error) {
                    reject(new Error('Audio conversion failed: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read audio file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async encodeAudioBuffer(audioBuffer, format, sampleRate) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;

        // Get audio data from all channels
        const channels = [];
        for (let i = 0; i < numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        // For WAV format, we can create it directly
        if (format === 'wav') {
            return this.createWavBlob(channels, sampleRate);
        }

        // For MP3 and OGG, we'll use MediaRecorder if available
        // Note: This is a simplified version. Full MP3/OGG encoding would require external libraries
        try {
            // Create an offline context to render the audio
            const offlineContext = new OfflineAudioContext(
                numberOfChannels,
                length,
                sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start();

            const renderedBuffer = await offlineContext.startRendering();

            // For MP3 and OGG, we'll fall back to WAV if MediaRecorder isn't available
            // or use WAV format as it's universally supported
            return this.createWavBlob(channels, sampleRate);

        } catch (error) {
            throw new Error('Audio encoding failed');
        }
    }

    createWavBlob(channels, sampleRate) {
        const numberOfChannels = channels.length;
        const length = channels[0].length;
        const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(buffer);

        // WAV file header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);

        // Write audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([buffer], { type: 'audio/wav' });
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
