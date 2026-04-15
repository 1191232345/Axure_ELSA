function switchMainTab(tab) {
    document.querySelectorAll('.main-content').forEach(function(content) {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    document.querySelectorAll('.tab').forEach(function(t) {
        t.classList.remove('active');
    });
    
    var targetContent = document.getElementById('main-' + tab);
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
    }
    
    var targetTab = document.getElementById('tab-' + tab);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tab === 'prd' && !prdLoaded) {
        loadPRD();
    } else if (tab === 'testcases' && !testCasesLoaded) {
        loadTestCases();
    }
}

function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function openMermaidModal(container) {
    var mermaidDiv = container.querySelector('.mermaid');
    if (!mermaidDiv) return;
    
    var modal = document.getElementById('mermaidModal');
    var modalContent = document.getElementById('mermaidModalContent');
    
    modalContent.innerHTML = mermaidDiv.innerHTML;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (window.mermaid) {
        mermaid.init(undefined, modalContent.querySelectorAll('.mermaid'));
    }
}

function closeMermaidModal(event) {
    if (event && event.target !== event.currentTarget && !event.target.closest('.mermaid-modal-close')) {
        return;
    }
    
    var modal = document.getElementById('mermaidModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

let prdLoaded = false;
let testCasesLoaded = false;

function loadPRD() {
    if (prdLoaded) return;
    
    var prdContentDiv = document.getElementById('prd-content');
    
    if (typeof marked === 'undefined') {
        prdContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载</p></div>';
        return;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'prd.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var markdown = xhr.responseText;
                var html = marked.parse(markdown);
                prdContentDiv.innerHTML = html;
                generateTOC();
                
                if (window.mermaid) {
                    setTimeout(function() {
                        mermaid.init(undefined, prdContentDiv.querySelectorAll('.mermaid'));
                    }, 100);
                }
                
                prdLoaded = true;
            } else {
                prdContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-gray-500">PRD文档不存在，请创建 prd.md 文件</p></div>';
            }
        }
    };
    xhr.send();
}

function loadTestCases() {
    if (testCasesLoaded) return;
    
    var testCasesContentDiv = document.getElementById('testcases-content');
    
    if (typeof marked === 'undefined') {
        testCasesContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-red-500">Marked库未加载</p></div>';
        return;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'test-cases.md', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var markdown = xhr.responseText;
                var html = marked.parse(markdown);
                testCasesContentDiv.innerHTML = html;
                generateTestCasesTOC();
                
                if (window.mermaid) {
                    setTimeout(function() {
                        mermaid.init(undefined, testCasesContentDiv.querySelectorAll('.mermaid'));
                    }, 100);
                }
                
                testCasesLoaded = true;
            } else {
                testCasesContentDiv.innerHTML = '<div class="text-center py-8"><p class="text-gray-500">测试用例文档不存在，请创建 test-cases.md 文件</p></div>';
            }
        }
    };
    xhr.send();
}

function generateTOC() {
    var tocNav = document.getElementById('toc-nav');
    var headings = document.querySelectorAll('#prd-content h1, #prd-content h2, #prd-content h3');
    
    var tocHTML = '';
    headings.forEach(function(heading, index) {
        var id = 'heading-' + index;
        heading.id = id;
        
        var level = parseInt(heading.tagName.substring(1));
        var className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}

function generateTestCasesTOC() {
    var tocNav = document.getElementById('testcases-toc-nav');
    var headings = document.querySelectorAll('#testcases-content h1, #testcases-content h2, #testcases-content h3');
    
    var tocHTML = '';
    headings.forEach(function(heading, index) {
        var id = 'testcases-heading-' + index;
        heading.id = id;
        
        var level = parseInt(heading.tagName.substring(1));
        var className = level === 2 ? 'toc-level-2' : (level === 3 ? 'toc-level-3' : '');
        
        tocHTML += '<a href="#' + id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    
    tocNav.innerHTML = tocHTML;
}

function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    var iconMap = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    toast.innerHTML = '<i class="fa ' + iconMap[type] + '"></i><span>' + message + '</span>';
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('toast-out');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

function showConfirm(options) {
    document.getElementById('confirmTitle').textContent = options.title || '确认操作';
    document.getElementById('confirmMessage').textContent = options.message || '确定要执行此操作吗？';
    var confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.textContent = options.confirmText || '确定';
    confirmBtn.onclick = function() {
        closeModal('confirmDialog');
        if (options.onConfirm) {
            options.onConfirm();
        }
    };
    openModal('confirmDialog');
}

function handleReset() {
    var filterCard = document.querySelector('.filter-card');
    filterCard.querySelectorAll('.form-input').forEach(function(input) {
        input.value = '';
    });
    filterCard.querySelectorAll('.form-select').forEach(function(select) {
        select.selectedIndex = 0;
    });
    showToast('已重置筛选条件', 'info');
}

function handleSearch() {
    showToast('正在查询...', 'info');
}

function handleAdd() {
    document.getElementById('addEditModalTitle').textContent = '新增FBA仓库';
    document.querySelectorAll('#addEditModal .form-input').forEach(function(input) {
        input.value = '';
    });
    openModal('addEditModal');
}

function handleEdit(btn) {
    var row = btn.closest('tr');
    var cells = row.querySelectorAll('td');

    document.getElementById('addEditModalTitle').textContent = '编辑FBA仓库';
    document.getElementById('warehouseCode').value = cells[0].textContent.trim();
    document.getElementById('warehouseName').value = cells[1].textContent.trim();
    document.getElementById('address').value = cells[2].textContent.trim();
    document.getElementById('country').value = cells[3].textContent.trim();
    document.getElementById('state').value = cells[4].textContent.trim();
    document.getElementById('city').value = cells[5].textContent.trim();
    document.getElementById('zipCode').value = cells[6].textContent.trim();
    document.getElementById('phone').value = cells[7].textContent.trim();

    openModal('addEditModal');
}

function handleDelete(btn) {
    showConfirm({
        title: '删除确认',
        message: '确定要删除该条记录吗？此操作不可撤销。',
        confirmText: '确定删除',
        onConfirm: function() {
            var row = btn.closest('tr');
            row.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(function() {
                row.remove();
                showToast('删除成功', 'success');
            }, 300);
        }
    });
}

let currentUploadType = '';
let currentUploadFile = null;

function openUploadModal(type, title, desc, accept) {
    currentUploadType = type;
    currentUploadFile = null;

    document.getElementById('uploadModalTitle').textContent = title;
    document.getElementById('uploadModalDesc').textContent = desc;
    document.getElementById('uploadFormatHint').textContent = '支持 ' + accept + ' 格式文件';
    document.getElementById('modalFileInput').accept = accept;

    resetUploadModal();
    openModal('uploadModal');
}

function resetUploadModal() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('uploadedFileInfo').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'none';
    document.getElementById('uploadSubmitBtn').disabled = false;
    document.getElementById('modalFileInput').value = '';
    currentUploadFile = null;
}

function triggerModalUpload() {
    document.getElementById('modalFileInput').click();
}

function handleModalFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    currentUploadFile = file;

    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('uploadedFileInfo').style.display = 'block';
    document.getElementById('uploadedFileName').textContent = file.name;
    document.getElementById('uploadedFileSize').textContent = formatFileSize(file.size);
}

function removeUploadedFile() {
    currentUploadFile = null;
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('uploadedFileInfo').style.display = 'none';
    document.getElementById('modalFileInput').value = '';
}

function submitUpload() {
    if (!currentUploadFile) {
        showToast('请先选择要上传的文件', 'warning');
        return;
    }

    document.getElementById('uploadSubmitBtn').disabled = true;
    document.getElementById('uploadedFileInfo').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'block';

    simulateModalUpload();
}

function simulateModalUpload() {
    let progress = 0;
    const progressBar = document.getElementById('uploadProgressBar');
    const progressText = document.getElementById('uploadProgressText');

    const interval = setInterval(function() {
        progress += 5;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = progress + '%';
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(function() {
                showUploadSuccess();
            }, 500);
        }
    }, 100);
}

function showUploadSuccess() {
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('uploadResult').style.display = 'block';

    document.getElementById('uploadResultTitle').textContent = '上传成功';
    document.getElementById('uploadResultMessage').textContent = 'FBA仓库已成功导入';

    showToast('FBA仓库导入成功！', 'success');

    setTimeout(function() {
        closeModal('uploadModal');
    }, 2000);
}

function downloadTemplateInModal() {
    showToast('正在下载FBA仓库模板...', 'info');
    setTimeout(function() {
        showToast('模板下载成功', 'success');
    }, 1000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveData() {
    var warehouseCode = document.getElementById('warehouseCode').value.trim();
    var warehouseName = document.getElementById('warehouseName').value.trim();
    var address = document.getElementById('address').value.trim();
    var country = document.getElementById('country').value.trim();
    var state = document.getElementById('state').value.trim();
    var city = document.getElementById('city').value.trim();
    var zipCode = document.getElementById('zipCode').value.trim();

    if (!warehouseCode) {
        showToast('请输入FBA仓库代码', 'warning');
        return;
    }
    if (!warehouseName) {
        showToast('请输入FBA仓库名称', 'warning');
        return;
    }
    if (!address) {
        showToast('请输入详细地址', 'warning');
        return;
    }
    if (!country) {
        showToast('请输入国家', 'warning');
        return;
    }
    if (!state) {
        showToast('请输入省/州', 'warning');
        return;
    }
    if (!city) {
        showToast('请输入城市', 'warning');
        return;
    }
    if (!zipCode) {
        showToast('请输入邮编', 'warning');
        return;
    }

    showToast('保存成功', 'success');
    closeModal('addEditModal');
}

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMermaidModal();
    }
});

function togglePrdLogic(module) {
    const content = document.getElementById(module + '-logic-content');
    const icon = document.getElementById(module + '-logic-icon');
    if (content && icon) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.style.display = 'none';
            icon.style.transform = 'rotate(0)';
        }
    }
}
