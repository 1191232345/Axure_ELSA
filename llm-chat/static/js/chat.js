window.ChatApp = (function () {
    var state = {
        currentConversationId: null,
        currentModelConfigId: null,
        configs: [],
        conversations: [],
        isStreaming: false,
    };

    function showToast(message, type) {
        var toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        
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

    function loadConfigs() {
        return Api.getConfigs().then(function (configs) {
            state.configs = configs;
            renderModelSelect();
            return configs;
        }).catch(function (error) {
            showToast('加载配置失败: ' + error.message, 'error');
            return [];
        });
    }

    function loadConversations() {
        return Api.getConversations().then(function (conversations) {
            state.conversations = conversations;
            renderConversationList();
            return conversations;
        }).catch(function (error) {
            showToast('加载对话失败: ' + error.message, 'error');
            return [];
        });
    }

    function renderModelSelect() {
        var select = document.getElementById('modelSelect');
        select.innerHTML = '<option value="">选择模型</option>';
        
        state.configs.forEach(function (config) {
            var option = document.createElement('option');
            option.value = config.id;
            option.textContent = config.provider + ' - ' + config.model_name;
            if (config.is_default) {
                option.selected = true;
                state.currentModelConfigId = config.id;
            }
            select.appendChild(option);
        });
    }

    function renderConversationList() {
        var container = document.getElementById('conversationList');
        
        if (state.conversations.length === 0) {
            container.innerHTML = '<div class="text-center text-neutral-400 py-8"><i class="fa fa-comments text-4xl mb-2"></i><p>暂无对话记录</p></div>';
            return;
        }
        
        container.innerHTML = '';
        state.conversations.forEach(function (conv) {
            var item = document.createElement('div');
            item.className = 'conversation-item';
            if (conv.id === state.currentConversationId) {
                item.classList.add('active');
            }
            
            var title = conv.title || '新对话';
            var provider = conv.provider || '未知';
            var model = conv.model_name || '未知';
            
            item.innerHTML = '<div class="flex items-center justify-between"><div class="flex-1"><div class="font-medium text-sm truncate">' + title + '</div><div class="text-xs text-neutral-400">' + provider + ' / ' + model + '</div></div></div>';
            
            item.addEventListener('click', function () {
                selectConversation(conv.id);
            });
            
            container.appendChild(item);
        });
    }

    function selectConversation(conversationId) {
        state.currentConversationId = conversationId;
        renderConversationList();
        
        Api.getConversationById(conversationId).then(function (conversation) {
            document.getElementById('conversationTitle').textContent = conversation.title || '新对话';
            document.getElementById('deleteConversationBtn').style.display = 'block';
            
            if (conversation.model_config_id) {
                state.currentModelConfigId = conversation.model_config_id;
                document.getElementById('modelSelect').value = conversation.model_config_id;
            }
            
            renderMessages(conversation.messages || []);
            showChatInterface();
        }).catch(function (error) {
            showToast('加载对话失败: ' + error.message, 'error');
        });
    }

    function renderMessages(messages) {
        var container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        messages.forEach(function (msg) {
            addMessageToUI(msg.role, msg.content);
        });
        
        scrollToBottom();
    }

    function addMessageToUI(role, content) {
        var container = document.getElementById('messagesContainer');
        
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message-container ' + role;
        
        var bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble ' + role;
        
        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (role === 'user') {
            contentDiv.textContent = content;
        } else {
            contentDiv.innerHTML = MarkdownRenderer.render(content);
        }
        
        bubbleDiv.appendChild(contentDiv);
        messageDiv.appendChild(bubbleDiv);
        container.appendChild(messageDiv);
        
        scrollToBottom();
    }

    function addStreamingMessage(role) {
        var container = document.getElementById('messagesContainer');
        
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message-container ' + role;
        messageDiv.id = 'streaming-message';
        
        var bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble ' + role;
        
        var contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.id = 'streaming-content';
        
        bubbleDiv.appendChild(contentDiv);
        messageDiv.appendChild(bubbleDiv);
        container.appendChild(messageDiv);
        
        scrollToBottom();
    }

    function updateStreamingMessage(content) {
        var contentDiv = document.getElementById('streaming-content');
        if (contentDiv) {
            contentDiv.innerHTML = MarkdownRenderer.render(content);
            scrollToBottom();
        }
    }

    function removeStreamingMessage() {
        var messageDiv = document.getElementById('streaming-message');
        if (messageDiv) {
            messageDiv.remove();
        }
    }

    function showChatInterface() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('messagesContainer').style.display = 'block';
    }

    function showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('messagesContainer').style.display = 'none';
        document.getElementById('conversationTitle').textContent = '新对话';
        document.getElementById('deleteConversationBtn').style.display = 'none';
    }

    function scrollToBottom() {
        var container = document.getElementById('chatContainer');
        container.scrollTop = container.scrollHeight;
    }

    function createNewConversation() {
        var modelConfigId = document.getElementById('modelSelect').value;
        if (!modelConfigId) {
            showToast('请先选择模型', 'error');
            return;
        }
        
        showLoading();
        
        Api.createConversation('新对话', parseInt(modelConfigId)).then(function (result) {
            hideLoading();
            state.currentConversationId = result.id;
            state.currentModelConfigId = parseInt(modelConfigId);
            
            loadConversations();
            showChatInterface();
            document.getElementById('messagesContainer').innerHTML = '';
            document.getElementById('conversationTitle').textContent = '新对话';
            document.getElementById('deleteConversationBtn').style.display = 'block';
            
            showToast('新对话创建成功', 'success');
        }).catch(function (error) {
            hideLoading();
            showToast('创建对话失败: ' + error.message, 'error');
        });
    }

    function sendMessage() {
        var input = document.getElementById('messageInput');
        var message = input.value.trim();
        
        if (!message) return;
        
        var modelConfigId = document.getElementById('modelSelect').value;
        if (!modelConfigId) {
            showToast('请先选择模型', 'error');
            return;
        }
        
        if (!state.currentConversationId) {
            createNewConversation();
            return;
        }
        
        if (state.isStreaming) {
            showToast('正在回复中，请稍候', 'error');
            return;
        }
        
        input.value = '';
        input.style.height = '48px';
        
        addMessageToUI('user', message);
        
        state.isStreaming = true;
        document.getElementById('sendBtn').disabled = true;
        
        addStreamingMessage('assistant');
        
        var fullResponse = '';
        
        Api.chatStream(state.currentConversationId, message, parseInt(modelConfigId)).then(function (response) {
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            
            function read() {
                reader.read().then(function (result) {
                    if (result.done) {
                        state.isStreaming = false;
                        document.getElementById('sendBtn').disabled = false;
                        removeStreamingMessage();
                        addMessageToUI('assistant', fullResponse);
                        
                        loadConversations();
                        return;
                    }
                    
                    var chunk = decoder.decode(result.value, { stream: true });
                    var lines = chunk.split('\n');
                    
                    lines.forEach(function (line) {
                        if (line.startsWith('data: ')) {
                            try {
                                var data = JSON.parse(line.substring(6));
                                if (data.content) {
                                    fullResponse += data.content;
                                    updateStreamingMessage(fullResponse);
                                }
                                if (data.error) {
                                    showToast('错误: ' + data.error, 'error');
                                    state.isStreaming = false;
                                    document.getElementById('sendBtn').disabled = false;
                                    removeStreamingMessage();
                                }
                            } catch (e) {
                                console.error('解析错误:', e);
                            }
                        }
                    });
                    
                    read();
                });
            }
            
            read();
        }).catch(function (error) {
            state.isStreaming = false;
            document.getElementById('sendBtn').disabled = false;
            removeStreamingMessage();
            showToast('发送失败: ' + error.message, 'error');
        });
    }

    function deleteCurrentConversation() {
        if (!state.currentConversationId) return;
        
        if (!confirm('确定要删除这个对话吗？')) return;
        
        showLoading();
        
        Api.deleteConversation(state.currentConversationId).then(function () {
            hideLoading();
            state.currentConversationId = null;
            loadConversations();
            showWelcomeScreen();
            showToast('对话已删除', 'success');
        }).catch(function (error) {
            hideLoading();
            showToast('删除失败: ' + error.message, 'error');
        });
    }

    function init() {
        loadConfigs();
        loadConversations();
        
        document.getElementById('newChatBtn').addEventListener('click', function () {
            createNewConversation();
        });
        
        document.getElementById('sendBtn').addEventListener('click', function () {
            sendMessage();
        });
        
        document.getElementById('messageInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        document.getElementById('messageInput').addEventListener('input', function () {
            this.style.height = '48px';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
            
            var sendBtn = document.getElementById('sendBtn');
            sendBtn.disabled = !this.value.trim() || state.isStreaming;
        });
        
        document.getElementById('modelSelect').addEventListener('change', function () {
            state.currentModelConfigId = parseInt(this.value);
        });
        
        document.getElementById('deleteConversationBtn').addEventListener('click', function () {
            deleteCurrentConversation();
        });
        
        document.getElementById('toggleSidebar').addEventListener('click', function () {
            var sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('open');
        });
        
        document.querySelectorAll('.suggestion-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var text = this.querySelector('p').textContent;
                document.getElementById('messageInput').value = text;
                document.getElementById('messageInput').focus();
                document.getElementById('sendBtn').disabled = false;
            });
        });
    }

    return {
        init: init,
        loadConfigs: loadConfigs,
        loadConversations: loadConversations,
    };
})();

document.addEventListener('DOMContentLoaded', function () {
    ChatApp.init();
});