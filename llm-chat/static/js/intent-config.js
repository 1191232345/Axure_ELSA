let currentCategoryId = null;

async function loadCategories() {
    try {
        const response = await fetch('/api/intents/categories');
        const data = await response.json();
        
        const categoriesList = document.getElementById('categories-list');
        
        if (data.categories.length === 0) {
            categoriesList.innerHTML = '<div class="text-gray-500 text-center py-8">暂无意图类别</div>';
            return;
        }
        
        categoriesList.innerHTML = data.categories.map(category => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${category.name}</h3>
                        <p class="text-gray-600 text-sm">${category.description || '无描述'}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showAddSampleModal(${category.id})" class="text-blue-500 hover:text-blue-600 text-sm">
                            添加样本
                        </button>
                        <button onclick="editCategory(${category.id})" class="text-green-500 hover:text-green-600 text-sm">
                            编辑
                        </button>
                        <button onclick="deleteCategory(${category.id})" class="text-red-500 hover:text-red-600 text-sm">
                            删除
                        </button>
                    </div>
                </div>
                
                <div class="flex justify-between items-center text-sm text-gray-600">
                    <div>
                        <span>置信度阈值: ${category.confidence_threshold}</span>
                        <span class="ml-2">优先级: ${category.priority}</span>
                        <span class="ml-2">样本数: ${category.sample_count}</span>
                    </div>
                    <span class="px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${category.is_active ? '启用' : '禁用'}
                    </span>
                </div>
                
                <div id="samples-${category.id}" class="mt-3 hidden">
                    <button onclick="loadSamples(${category.id})" class="text-sm text-gray-600 hover:text-gray-800">
                        查看样本
                    </button>
                </div>
            </div>
        `).join('');
        
        updateStats(data.categories);
    } catch (error) {
        console.error('加载意图类别失败:', error);
        showToast('加载意图类别失败', 'error');
    }
}

async function loadSamples(categoryId) {
    try {
        const response = await fetch(`/api/intents/categories/${categoryId}/samples`);
        const data = await response.json();
        
        const samplesDiv = document.getElementById(`samples-${categoryId}`);
        
        if (data.samples.length === 0) {
            samplesDiv.innerHTML = '<div class="text-gray-500 text-sm">暂无样本</div>';
            return;
        }
        
        samplesDiv.innerHTML = `
            <div class="space-y-2 mt-2">
                ${data.samples.map(sample => `
                    <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span class="text-gray-700">${sample.sample_text}</span>
                        <button onclick="deleteSample(${sample.id}, ${categoryId})" class="text-red-500 hover:text-red-600">
                            删除
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        samplesDiv.classList.remove('hidden');
    } catch (error) {
        console.error('加载样本失败:', error);
        showToast('加载样本失败', 'error');
    }
}

function showAddCategoryModal() {
    document.getElementById('add-category-modal').classList.remove('hidden');
}

function hideAddCategoryModal() {
    document.getElementById('add-category-modal').classList.add('hidden');
    clearCategoryForm();
}

function clearCategoryForm() {
    document.getElementById('category-name').value = '';
    document.getElementById('category-description').value = '';
    document.getElementById('category-threshold').value = '0.7';
    document.getElementById('category-priority').value = '0';
    document.getElementById('category-active').checked = true;
}

async function createCategory() {
    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();
    const threshold = parseFloat(document.getElementById('category-threshold').value);
    const priority = parseInt(document.getElementById('category-priority').value);
    const isActive = document.getElementById('category-active').checked;
    
    if (!name) {
        showToast('请输入类别名称', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/intents/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                confidence_threshold: threshold,
                priority,
                is_active: isActive
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('意图类别创建成功', 'success');
            hideAddCategoryModal();
            loadCategories();
        } else {
            showToast(data.error || '创建失败', 'error');
        }
    } catch (error) {
        console.error('创建意图类别失败:', error);
        showToast('创建意图类别失败', 'error');
    }
}

async function editCategory(categoryId) {
    showToast('编辑功能待实现', 'info');
}

async function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个意图类别吗？所有相关样本也会被删除。')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/intents/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('意图类别删除成功', 'success');
            loadCategories();
        } else {
            const data = await response.json();
            showToast(data.error || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除意图类别失败:', error);
        showToast('删除意图类别失败', 'error');
    }
}

function showAddSampleModal(categoryId) {
    currentCategoryId = categoryId;
    document.getElementById('add-sample-modal').classList.remove('hidden');
}

function hideAddSampleModal() {
    document.getElementById('add-sample-modal').classList.add('hidden');
    clearSampleForm();
}

function clearSampleForm() {
    document.getElementById('sample-text').value = '';
    document.getElementById('batch-samples').value = '';
}

async function createSample() {
    const sampleText = document.getElementById('sample-text').value.trim();
    
    if (!sampleText) {
        showToast('请输入样本文本', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/intents/categories/${currentCategoryId}/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sample_text: sampleText })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('样本创建成功', 'success');
            hideAddSampleModal();
            loadCategories();
        } else {
            showToast(data.error || '创建失败', 'error');
        }
    } catch (error) {
        console.error('创建样本失败:', error);
        showToast('创建样本失败', 'error');
    }
}

async function batchCreateSamples() {
    const batchText = document.getElementById('batch-samples').value.trim();
    
    if (!batchText) {
        showToast('请输入批量样本', 'error');
        return;
    }
    
    const samples = batchText.split('\n').filter(line => line.trim());
    
    if (samples.length === 0) {
        showToast('没有有效的样本', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/intents/samples/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category_id: currentCategoryId,
                samples: samples
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`成功创建 ${data.created_count} 个样本`, 'success');
            if (data.errors.length > 0) {
                showToast(`部分样本创建失败: ${data.errors.join(', ')}`, 'error');
            }
            hideAddSampleModal();
            loadCategories();
        } else {
            showToast(data.error || '批量创建失败', 'error');
        }
    } catch (error) {
        console.error('批量创建样本失败:', error);
        showToast('批量创建样本失败', 'error');
    }
}

async function deleteSample(sampleId, categoryId) {
    if (!confirm('确定要删除这个样本吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/intents/samples/${sampleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('样本删除成功', 'success');
            loadSamples(categoryId);
            loadCategories();
        } else {
            const data = await response.json();
            showToast(data.error || '删除失败', 'error');
        }
    } catch (error) {
        console.error('删除样本失败:', error);
        showToast('删除样本失败', 'error');
    }
}

async function testIntentRecognition() {
    const text = document.getElementById('test-text').value.trim();
    const topK = parseInt(document.getElementById('test-top-k').value);
    const minConfidence = parseFloat(document.getElementById('test-min-confidence').value);
    
    if (!text) {
        showToast('请输入测试文本', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/intents/recognize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                top_k: topK,
                min_confidence: minConfidence
            })
        });
        
        const data = await response.json();
        
        const resultDiv = document.getElementById('test-result');
        const resultContent = document.getElementById('test-result-content');
        
        if (response.ok) {
            resultDiv.classList.remove('hidden');
            
            if (data.recognized_intents.length === 0) {
                resultContent.innerHTML = '<div class="text-gray-500">没有匹配的意图</div>';
            } else {
                resultContent.innerHTML = `
                    <div class="mb-2 text-sm text-gray-600">
                        处理时间: ${data.processing_time.toFixed(2)}秒 | 
                        总样本数: ${data.total_samples}
                    </div>
                    <div class="space-y-2">
                        ${data.recognized_intents.map(intent => `
                            <div class="border border-gray-200 rounded p-3">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="font-semibold text-gray-800">${intent.category_name}</span>
                                    <span class="text-sm px-2 py-1 rounded ${
                                        intent.confidence >= 0.7 ? 'bg-green-100 text-green-800' : 
                                        intent.confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'
                                    }">
                                        置信度: ${(intent.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div class="text-sm text-gray-600">
                                    相似度: ${intent.similarity.toFixed(3)} | 
                                    匹配样本: "${intent.sample_text}"
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } else {
            showToast(data.error || '识别失败', 'error');
        }
    } catch (error) {
        console.error('测试意图识别失败:', error);
        showToast('测试意图识别失败', 'error');
    }
}

async function updateGlobalConfig() {
    const threshold = parseFloat(document.getElementById('global-threshold').value);
    const maxResults = parseInt(document.getElementById('max-results').value);
    
    try {
        const response = await fetch('/api/intents/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                global_confidence_threshold: threshold.toString(),
                max_intent_results: maxResults.toString()
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('配置更新成功', 'success');
        } else {
            showToast(data.error || '更新失败', 'error');
        }
    } catch (error) {
        console.error('更新配置失败:', error);
        showToast('更新配置失败', 'error');
    }
}

async function loadGlobalConfig() {
    try {
        const response = await fetch('/api/intents/config');
        const data = await response.json();
        
        document.getElementById('global-threshold').value = data.global_confidence_threshold || '0.7';
        document.getElementById('max-results').value = data.max_intent_results || '5';
    } catch (error) {
        console.error('加载配置失败:', error);
    }
}

async function checkSystemStatus() {
    try {
        const response = await fetch('/api/intents/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: '测试' })
        });
        
        const data = await response.json();
        
        document.getElementById('embedding-status').textContent = data.embedding_available ? '可用' : '不可用';
        document.getElementById('embedding-status').className = data.embedding_available ? 'text-green-500' : 'text-red-500';
        document.getElementById('cache-size').textContent = data.cache_size || '0';
    } catch (error) {
        console.error('检查系统状态失败:', error);
        document.getElementById('embedding-status').textContent = '检查失败';
        document.getElementById('embedding-status').className = 'text-red-500';
    }
}

function updateStats(categories) {
    const totalSamples = categories.reduce((sum, cat) => sum + cat.sample_count, 0);
    document.getElementById('category-count').textContent = categories.length;
    document.getElementById('sample-count').textContent = totalSamples;
}

async function clearCache() {
    if (!confirm('确定要清除所有缓存吗？')) {
        return;
    }
    
    try {
        const response = await fetch('/api/intents/cache/clear', {
            method: 'POST'
        });
        
        if (response.ok) {
            showToast('缓存已清除', 'success');
            checkSystemStatus();
        } else {
            const data = await response.json();
            showToast(data.error || '清除失败', 'error');
        }
    } catch (error) {
        console.error('清除缓存失败:', error);
        showToast('清除缓存失败', 'error');
    }
}

async function refreshCache() {
    try {
        const response = await fetch('/api/intents/cache/refresh', {
            method: 'POST'
        });
        
        if (response.ok) {
            showToast('缓存已刷新', 'success');
        } else {
            const data = await response.json();
            showToast(data.error || '刷新失败', 'error');
        }
    } catch (error) {
        console.error('刷新缓存失败:', error);
        showToast('刷新缓存失败', 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadGlobalConfig();
    checkSystemStatus();
});