window.ConfigPage = (function () {
    var state = {
        providers: {},
        configs: [],
        editingConfigId: null,
    };

    function showToast(message, type) {
        var toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50';
        
        if (type === 'success') {
            toast.style.backgroundColor = '#00B42A';
            toast.style.color = 'white';
        } else if (type === 'error') {
            toast.style.backgroundColor = '#F53F3F';
            toast.style.color = 'white';
        } else {
            toast.style.backgroundColor = '#165DFF';
            toast.style.color = 'white';
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function () {
            toast.remove();
        }, AppConfig.toast.duration);
    }

    function showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    function showModal(title) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('configModal').style.display = 'flex';
    }

    function hideModal() {
        document.getElementById('configModal').style.display = 'none';
        document.getElementById('configForm').reset();
        state.editingConfigId = null;
    }

    function loadProviders() {
        return Api.getProviders().then(function (providers) {
            state.providers = providers;
            renderProviders();
            renderProviderSelect();
            return providers;
        }).catch(function (error) {
            showToast('加载提供商失败: ' + error.message, 'error');
            return {};
        });
    }

    function loadConfigs() {
        return Api.getConfigs().then(function (configs) {
            state.configs = configs;
            renderConfigs();
            return configs;
        }).catch(function (error) {
            showToast('加载配置失败: ' + error.message, 'error');
            return [];
        });
    }

    function renderProviders() {
        var container = document.getElementById('providersList');
        container.innerHTML = '';
        
        Object.keys(state.providers).forEach(function (key) {
            var provider = state.providers[key];
            
            var card = document.createElement('div');
            card.className = 'provider-card';
            
            var iconClass = 'fa-cloud';
            var typeColor = provider.type === 'local' ? '#00B42A' : '#165DFF';
            
            if (key === 'openai') iconClass = 'fa-robot';
            if (key === 'anthropic') iconClass = 'fa-brain';
            if (key === 'deepseek') iconClass = 'fa-search';
            if (key === 'zhipu') iconClass = 'fa-lightbulb-o';
            if (key === 'ollama') iconClass = 'fa-server';
            if (key === 'localai') iconClass = 'fa-desktop';
            
            var typeBadge = provider.type === 'local' ? '<span class="text-xs px-2 py-1 bg-success text-white rounded mt-2">本地</span>' : '<span class="text-xs px-2 py-1 bg-primary text-white rounded mt-2">云端</span>';
            
            card.innerHTML = '<i class="fa ' + iconClass + '" style="color: ' + typeColor + '"></i><h3 class="font-semibold mt-2">' + provider.name + '</h3>' + typeBadge + '<p class="text-xs text-neutral-400 mt-1">' + provider.models.length + ' 个模型</p><p class="text-xs text-neutral-500 mt-1">' + provider.description + '</p>';
            
            if (provider.type === 'local') {
                card.style.cursor = 'pointer';
                card.addEventListener('click', function () {
                    quickSetupLocalProvider(key);
                });
            }
            
            container.appendChild(card);
        });
    }

    function renderProviderSelect() {
        var select = document.getElementById('provider');
        select.innerHTML = '<option value="">请选择提供商</option>';
        
        Object.keys(state.providers).forEach(function (key) {
            var provider = state.providers[key];
            var option = document.createElement('option');
            option.value = key;
            option.textContent = provider.name;
            select.appendChild(option);
        });
    }

    function renderConfigs() {
        var container = document.getElementById('configsList');
        
        if (state.configs.length === 0) {
            container.innerHTML = '<div class="text-center text-neutral-400 py-8"><i class="fa fa-cog text-4xl mb-2"></i><p>暂无配置，请添加模型配置</p><p class="text-sm mt-2">点击上方本地提供商卡片可快速配置</p></div>';
            return;
        }
        
        container.innerHTML = '';
        state.configs.forEach(function (config) {
            var card = document.createElement('div');
            card.className = 'config-card';
            
            var defaultBadge = config.is_default ? '<span class="ml-2 px-2 py-1 bg-success text-white text-xs rounded">默认</span>' : '';
            var providerInfo = state.providers[config.provider] || {};
            var typeBadge = providerInfo.type === 'local' ? '<span class="ml-2 px-2 py-1 bg-success text-white text-xs rounded">本地</span>' : '<span class="ml-2 px-2 py-1 bg-primary text-white text-xs rounded">云端</span>';
            
            card.innerHTML = '<div class="flex items-center justify-between"><div class="flex-1"><div class="flex items-center"><h3 class="font-semibold">' + config.provider + ' - ' + config.model_name + defaultBadge + typeBadge + '</h3></div><div class="text-sm text-neutral-400 mt-1"><span>API Key: ' + config.api_key + '</span><span class="mx-2">|</span><span>Base URL: ' + (config.base_url || '默认') + '</span></div><div class="text-sm text-neutral-400 mt-1"><span>Temperature: ' + config.temperature + '</span><span class="mx-2">|</span><span>Max Tokens: ' + config.max_tokens + '</span></div></div><div class="flex space-x-2"><button class="btn-secondary text-sm test-connection-btn" data-id="' + config.id + '"><i class="fa fa-plug mr-1"></i>测试连接</button><button class="btn-secondary text-sm test-chat-btn" data-id="' + config.id + '"><i class="fa fa-comments mr-1"></i>测试对话</button><button class="btn-secondary text-sm edit-btn" data-id="' + config.id + '"><i class="fa fa-edit mr-1"></i>编辑</button><button class="btn-danger text-sm delete-btn" data-id="' + config.id + '"><i class="fa fa-trash mr-1"></i>删除</button></div></div>';
            
            container.appendChild(card);
        });
        
        document.querySelectorAll('.test-connection-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(this.getAttribute('data-id'));
                testConnection(id);
            });
        });
        
        document.querySelectorAll('.test-chat-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(this.getAttribute('data-id'));
                testChat(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(this.getAttribute('data-id'));
                editConfig(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = parseInt(this.getAttribute('data-id'));
                deleteConfig(id);
            });
        });
    }

    function updateModelSelect(providerKey) {
        var select = document.getElementById('modelName');
        select.innerHTML = '<option value="">请选择模型</option>';
        
        if (providerKey && state.providers[providerKey]) {
            var provider = state.providers[providerKey];
            provider.models.forEach(function (model) {
                var option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                if (model === provider.default_model) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            
            document.getElementById('baseUrl').value = provider.base_url || '';
        }
    }

    function editConfig(configId) {
        var config = state.configs.find(function (c) {
            return c.id === configId;
        });
        
        if (!config) return;
        
        state.editingConfigId = configId;
        
        Api.getConfigById(configId).then(function (fullConfig) {
            document.getElementById('configId').value = configId;
            document.getElementById('provider').value = fullConfig.provider;
            document.getElementById('apiKey').value = fullConfig.api_key;
            document.getElementById('baseUrl').value = fullConfig.base_url || '';
            document.getElementById('temperature').value = fullConfig.temperature;
            document.getElementById('maxTokens').value = fullConfig.max_tokens;
            document.getElementById('isDefault').checked = fullConfig.is_default;
            
            updateModelSelect(fullConfig.provider);
            document.getElementById('modelName').value = fullConfig.model_name;
            
            showModal('编辑模型配置');
        }).catch(function (error) {
            showToast('加载配置详情失败: ' + error.message, 'error');
        });
    }

    function deleteConfig(configId) {
        if (!confirm('确定要删除这个配置吗？')) return;
        
        showLoading();
        
        Api.deleteConfig(configId).then(function () {
            hideLoading();
            loadConfigs();
            showToast('配置已删除', 'success');
        }).catch(function (error) {
            hideLoading();
            showToast('删除失败: ' + error.message, 'error');
        });
    }

    function saveConfig() {
        var provider = document.getElementById('provider').value;
        var apiKey = document.getElementById('apiKey').value;
        var baseUrl = document.getElementById('baseUrl').value;
        var modelName = document.getElementById('modelName').value;
        var temperature = parseFloat(document.getElementById('temperature').value);
        var maxTokens = parseInt(document.getElementById('maxTokens').value);
        var isDefault = document.getElementById('isDefault').checked;
        
        var providerInfo = state.providers[provider] || {};
        
        if (!provider || !modelName) {
            showToast('请填写必填项', 'error');
            return;
        }
        
        if (providerInfo.requires_api_key && (!apiKey || apiKey.trim() === '')) {
            showToast('云端服务需要 API Key', 'error');
            return;
        }
        
        showLoading();
        
        var data = {
            provider: provider,
            api_key: apiKey || provider,
            base_url: baseUrl,
            model_name: modelName,
            temperature: temperature,
            max_tokens: maxTokens,
            is_default: isDefault,
        };
        
        if (state.editingConfigId) {
            Api.updateConfig(state.editingConfigId, data).then(function () {
                hideLoading();
                hideModal();
                loadConfigs();
                showToast('配置更新成功', 'success');
            }).catch(function (error) {
                hideLoading();
                showToast('更新失败: ' + error.message, 'error');
            });
        } else {
            Api.createConfig(data).then(function () {
                hideLoading();
                hideModal();
                loadConfigs();
                showToast('配置创建成功', 'success');
            }).catch(function (error) {
                hideLoading();
                showToast('创建失败: ' + error.message, 'error');
            });
        }
    }

    function testConnection(configId) {
        showLoading();
        
        Api.testConfigById(configId).then(function (result) {
            hideLoading();
            
            if (result.success) {
                showToast(result.message, 'success');
                
                if (result.details && result.details.available_models) {
                    var modelsInfo = '可用模型: ' + result.details.available_models.join(', ');
                    showToast(modelsInfo, 'success');
                }
            } else {
                showToast(result.message, 'error');
            }
        }).catch(function (error) {
            hideLoading();
            showToast('测试失败: ' + error.message, 'error');
        });
    }

    function testChat(configId) {
        showLoading();
        
        Api.testChatById(configId).then(function (result) {
            hideLoading();
            
            if (result.success) {
                showToast('对话测试成功', 'success');
                
                if (result.response) {
                    alert('AI 回复: ' + result.response);
                }
            } else {
                showToast(result.message, 'error');
            }
        }).catch(function (error) {
            hideLoading();
            showToast('测试失败: ' + error.message, 'error');
        });
    }

    function quickSetupLocalProvider(provider) {
        if (!confirm('确定要快速配置 ' + state.providers[provider].name + ' 吗？\n这将自动创建一个默认配置。')) {
            return;
        }
        
        showLoading();
        
        Api.quickSetupLocal(provider).then(function (result) {
            hideLoading();
            loadConfigs();
            showToast(result.message, 'success');
            
            if (result.config) {
                setTimeout(function () {
                    testConnection(result.id);
                }, 1000);
            }
        }).catch(function (error) {
            hideLoading();
            showToast('快速配置失败: ' + error.message, 'error');
        });
    }

    function init() {
        loadProviders();
        loadConfigs();
        
        document.getElementById('addConfigBtn').addEventListener('click', function () {
            showModal('添加模型配置');
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', function () {
            hideModal();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', function () {
            hideModal();
        });
        
        document.getElementById('provider').addEventListener('change', function () {
            updateModelSelect(this.value);
        });
        
        document.getElementById('configForm').addEventListener('submit', function (e) {
            e.preventDefault();
            saveConfig();
        });
        
        document.getElementById('configModal').addEventListener('click', function (e) {
            if (e.target === this) {
                hideModal();
            }
        });
    }

    return {
        init: init,
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    ConfigPage.init();
});