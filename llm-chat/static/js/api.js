window.Api = (function () {
    var config = AppConfig.api;

    function request(url, options) {
        return fetch(url, options).then(function (response) {
            if (!response.ok) {
                return response.json().then(function (err) {
                    throw new Error(err.error || '服务器响应错误');
                });
            }
            return response.json();
        });
    }

    function getProviders() {
        return request(config.providers);
    }

    function getConfigs() {
        return request(config.configs);
    }

    function getConfigById(id) {
        return request(config.configs + '/' + id);
    }

    function getDefaultConfig() {
        return request(config.configs + '/default');
    }

    function createConfig(data) {
        return request(config.configs, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    function updateConfig(id, data) {
        return request(config.configs + '/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    function deleteConfig(id) {
        return request(config.configs + '/' + id, {
            method: 'DELETE',
        });
    }

    function getConversations() {
        return request(config.conversations);
    }

    function getConversationById(id) {
        return request(config.conversations + '/' + id);
    }

    function createConversation(title, modelConfigId) {
        return request(config.conversations, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, model_config_id: modelConfigId }),
        });
    }

    function deleteConversation(id) {
        return request(config.conversations + '/' + id, {
            method: 'DELETE',
        });
    }

    function getMessages(conversationId) {
        return request(config.conversations + '/' + conversationId + '/messages');
    }

    function chatStream(conversationId, message, modelConfigId) {
        return fetch(config.chatStream, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: conversationId,
                message: message,
                model_config_id: modelConfigId,
            }),
        });
    }

    function chatSend(conversationId, message, modelConfigId) {
        return request(config.chatSend, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: conversationId,
                message: message,
                model_config_id: modelConfigId,
            }),
        });
    }

    function testConfig(data) {
        return request(config.configs + '/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    function testConfigById(id) {
        return request(config.configs + '/' + id + '/test', {
            method: 'POST',
        });
    }

    function testChat(data) {
        return request(config.configs + '/test-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    function testChatById(id) {
        return request(config.configs + '/' + id + '/test-chat', {
            method: 'POST',
        });
    }

    function getDefaultLocalConfigs() {
        return request(config.configs + '/default-local');
    }

    function quickSetupLocal(provider) {
        return request(config.configs + '/quick-setup/' + provider, {
            method: 'POST',
        });
    }

    return {
        getProviders: getProviders,
        getConfigs: getConfigs,
        getConfigById: getConfigById,
        getDefaultConfig: getDefaultConfig,
        createConfig: createConfig,
        updateConfig: updateConfig,
        deleteConfig: deleteConfig,
        getConversations: getConversations,
        getConversationById: getConversationById,
        createConversation: createConversation,
        deleteConversation: deleteConversation,
        getMessages: getMessages,
        chatStream: chatStream,
        chatSend: chatSend,
        testConfig: testConfig,
        testConfigById: testConfigById,
        testChat: testChat,
        testChatById: testChatById,
        getDefaultLocalConfigs: getDefaultLocalConfigs,
        quickSetupLocal: quickSetupLocal,
    };
})();