window.AppConfig = {
    colors: {
        primary: '#165DFF',
        secondary: '#FF7D00',
        danger: '#F53F3F',
        success: '#00B42A',
        neutral: {
            100: '#F5F7FA',
            200: '#E5E6EB',
            300: '#C9CDD4',
            400: '#86909C',
            500: '#4E5969',
            600: '#272E3B',
            700: '#1D2129',
        }
    },
    api: {
        configs: '/api/configs',
        providers: '/api/configs/providers',
        conversations: '/api/chat/conversations',
        chatStream: '/api/chat/stream',
        chatSend: '/api/chat/send',
    },
    toast: {
        duration: 3000,
    },
};