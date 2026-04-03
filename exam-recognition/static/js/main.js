class ExamRecognitionApp {
    constructor() {
        this.files = [];
        this.initElements();
        this.bindEvents();
        this.checkHealth();
    }
    
    initElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.previewSection = document.getElementById('previewSection');
        this.previewGrid = document.getElementById('previewGrid');
        this.clearBtn = document.getElementById('clearBtn');
        this.recognizeBtn = document.getElementById('recognizeBtn');
        this.resultEditor = document.getElementById('resultEditor');
        this.documentTitle = document.getElementById('documentTitle');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
    }
    
    bindEvents() {
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        
        this.clearBtn.addEventListener('click', () => {
            this.clearFiles();
        });
        
        this.recognizeBtn.addEventListener('click', () => {
            this.recognizeImages();
        });
        
        this.downloadBtn.addEventListener('click', () => {
            this.downloadDocument();
        });
        
        this.resultEditor.addEventListener('input', () => {
            this.downloadBtn.disabled = !this.resultEditor.value.trim();
        });
    }
    
    handleFiles(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showToast(`${file.name} 不是有效的图片文件`, 'error');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                this.showToast(`${file.name} 文件过大，最大支持10MB`, 'error');
                return false;
            }
            return true;
        });
        
        if (validFiles.length === 0) {
            return;
        }
        
        this.files = [...this.files, ...validFiles];
        this.updatePreview();
        this.recognizeBtn.disabled = this.files.length === 0;
    }
    
    updatePreview() {
        this.previewGrid.innerHTML = '';
        
        this.files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-btn" data-index="${index}">×</button>
                `;
                
                const removeBtn = previewItem.querySelector('.remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFile(index);
                });
                
                this.previewGrid.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
        
        this.previewSection.style.display = this.files.length > 0 ? 'block' : 'none';
    }
    
    removeFile(index) {
        this.files.splice(index, 1);
        this.updatePreview();
        this.recognizeBtn.disabled = this.files.length === 0;
    }
    
    clearFiles() {
        this.files = [];
        this.updatePreview();
        this.recognizeBtn.disabled = true;
        this.fileInput.value = '';
    }
    
    async recognizeImages() {
        if (this.files.length === 0) {
            this.showToast('请先上传图片', 'error');
            return;
        }
        
        this.setLoading(true);
        this.recognizeBtn.disabled = true;
        
        const formData = new FormData();
        this.files.forEach(file => {
            formData.append('images', file);
        });
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.resultEditor.value = result.text;
                this.downloadBtn.disabled = false;
                this.showToast(`识别成功！共识别 ${result.files_count} 张图片`, 'success');
            } else {
                this.showToast(`识别失败: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Recognition error:', error);
            this.showToast(`请求失败: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
            this.recognizeBtn.disabled = this.files.length === 0;
        }
    }
    
    async downloadDocument() {
        const text = this.resultEditor.value.trim();
        
        if (!text) {
            this.showToast('没有可下载的内容', 'error');
            return;
        }
        
        const title = this.documentTitle.value.trim() || '试卷';
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    title: title
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '下载失败');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}_${Date.now()}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showToast('文档下载成功！', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast(`下载失败: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }
    
    async checkHealth() {
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            
            if (!result.ocr_initialized) {
                this.showToast('警告: OCR服务未初始化，请配置API密钥', 'error');
            }
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }
    
    setLoading(loading) {
        this.loadingOverlay.style.display = loading ? 'flex' : 'none';
        
        const btnText = this.recognizeBtn.querySelector('.btn-text');
        const btnLoading = this.recognizeBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.style.display = 'block';
        
        setTimeout(() => {
            this.toast.style.display = 'none';
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ExamRecognitionApp();
});
