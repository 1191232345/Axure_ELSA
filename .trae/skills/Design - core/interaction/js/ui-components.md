# UI组件交互

UI组件JavaScript交互函数，包含Toast、标签页、骨架屏、Alert、面包屑、对话框、加载状态。

## Toast通知

```javascript
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    var container = getOrCreateToastContainer();
    var toastId = 'toast-' + Date.now();
    var iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    var toastHTML = '<div id="' + toastId + '" class="toast toast-' + type + '" role="alert"><i class="' + iconMap[type] + ' toast-icon"></i><span class="toast-message">' + message + '</span><button class="toast-close-btn" onclick="closeToast(\'' + toastId + '\')"><i class="fas fa-times"></i></button></div>';
    container.insertAdjacentHTML('beforeend', toastHTML);
    if (duration > 0) {
        setTimeout(function() { closeToast(toastId); }, duration);
    }
    return toastId;
}

function closeToast(toastId) {
    var toast = document.getElementById(toastId);
    if (!toast || toast.classList.contains('hiding')) return;
    toast.classList.add('hiding');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 150);
}

function getOrCreateToastContainer() {
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}
```

## 标签页切换

```javascript
function switchTab(tabElement, targetPanelId) {
    var tabsContainer = tabElement.closest('.tabs-header');
    var tabsContent = tabElement.closest('.tabs-container').querySelector('.tabs-content');
    if (tabsContainer) tabsContainer.querySelectorAll('.tab-item').forEach(function(tab) { tab.classList.remove('active'); });
    if (tabsContent) tabsContent.querySelectorAll('.tab-pane').forEach(function(pane) { pane.classList.remove('active'); });
    tabElement.classList.add('active');
    var targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) targetPanel.classList.add('active');
}
```

## 骨架屏

```javascript
function showSkeleton(target, variant) {
    var element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = '<div class="skeleton-wrapper animate-pulse"><div class="h-4 bg-gray-200 rounded mb-2"></div><div class="h-4 bg-gray-200 rounded mb-2"></div><div class="h-4 bg-gray-200 rounded"></div></div>';
    element.classList.add('skeleton-loading');
}

function hideSkeleton(target, callback) {
    var element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    element.style.opacity = '0';
    setTimeout(function() {
        if (element.dataset.originalContent !== undefined) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
        element.classList.remove('skeleton-loading');
        element.style.opacity = '1';
        if (typeof callback === 'function') callback(element);
    }, 300);
}
```

## Alert提示框

```javascript
function showAlert(message, type, options) {
    type = type || 'info';
    options = options || {};
    var alertId = 'alert-' + Date.now();
    var iconMap = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle' };
    var alertHTML = '<div id="' + alertId + '" class="alert alert-' + type + '" role="alert"><i class="' + iconMap[type] + ' mr-2"></i><span>' + message + '</span><button class="alert-close ml-auto" onclick="closeAlert(\'' + alertId + '\')"><i class="fas fa-times"></i></button></div>';
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    if (options.duration > 0) setTimeout(function() { closeAlert(alertId); }, options.duration);
    return alertId;
}

function closeAlert(alertId) {
    var alert = document.getElementById(alertId);
    if (alert && alert.parentNode) alert.parentNode.removeChild(alert);
}
```

## 加载状态

```javascript
function showLoading(message) {
    var loadingEl = document.getElementById('globalLoading');
    if (loadingEl) {
        if (message) loadingEl.querySelector('.loading-text').textContent = message;
        loadingEl.classList.add('show');
    }
}

function hideLoading() {
    var loadingEl = document.getElementById('globalLoading');
    if (loadingEl) loadingEl.classList.remove('show');
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>处理中...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || '确定';
    }
}
```