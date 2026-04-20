const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, '..');

app.use(express.static(ROOT_DIR, {
    index: false,
    extensions: ['html', 'htm']
}));

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ELSA 原型服务器</title>
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #2a3b7d 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.8; font-size: 1.1rem; }
        .status {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .status-dot {
            width: 12px;
            height: 12px;
            background: #00B42A;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .projects {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        .project-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .project-card h3 {
            color: #2a3b7d;
            font-size: 1.2rem;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .project-card p {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 12px;
        }
        .project-card .path {
            font-size: 0.75rem;
            color: #9ca3af;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            word-break: break-all;
        }
        .section-title {
            color: white;
            font-size: 1.3rem;
            margin: 30px 0 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(255,255,255,0.2);
        }
        .api-info {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            margin-top: 30px;
            color: white;
        }
        .api-info h3 { margin-bottom: 15px; }
        .api-info code {
            background: rgba(0,0,0,0.2);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fa fa-cube"></i> ELSA 原型服务器</h1>
            <p>产品原型开发与预览平台</p>
        </div>
        
        <div class="status">
            <span class="status-dot"></span>
            <span>服务运行中 - 端口 ${PORT}</span>
        </div>
        
        <div id="projects" class="projects"></div>
        
        <div class="api-info">
            <h3><i class="fa fa-code"></i> API 接口</h3>
            <p>数据持久化 API：<code>http://localhost:${PORT}/api/data/[项目路径]</code></p>
            <p style="margin-top: 10px;">使用方法：在原型页面中配置 API 地址即可自动同步数据</p>
        </div>
    </div>
    
    <script>
        const projects = ${JSON.stringify(getProjects())};
        
        function renderProjects() {
            const container = document.getElementById('projects');
            
            const categories = {
                '测试项目': projects.filter(p => p.name.includes('demo') || p.name.includes('test')),
                '业务模块': projects.filter(p => !p.name.includes('demo') && !p.name.includes('test') && !p.name.includes('LTL') && !p.name.includes('PDA'))
            };
            
            let html = '';
            
            Object.entries(categories).forEach(([title, items]) => {
                if (items.length > 0) {
                    html += '<div style="grid-column: 1 / -1;" class="section-title">' + title + '</div>';
                    items.forEach(project => {
                        html += '<a href="' + project.url + '" class="project-card">' +
                            '<h3><i class="fa fa-folder"></i> ' + project.name + '</h3>' +
                            '<p>' + project.description + '</p>' +
                            '<div class="path">' + project.path + '</div>' +
                        '</a>';
                    });
                }
            });
            
            container.innerHTML = html;
        }
        
        renderProjects();
    </script>
</body>
</html>
    `);
});

function getProjects() {
    const projects = [];
    const excludeDirs = ['.trae', 'node_modules', 'server', '.git', 'Excel图片提取转PDF', 'records-master', '图片嵌入EXCEL', '退货图片嵌入'];
    
    const items = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
    
    items.forEach(item => {
        if (!item.isDirectory()) return;
        if (excludeDirs.includes(item.name)) return;
        if (item.name.startsWith('.')) return;
        
        const dirPath = path.join(ROOT_DIR, item.name);
        const indexPath = path.join(dirPath, 'index.html');
        
        if (fs.existsSync(indexPath)) {
            projects.push({
                name: item.name,
                path: '/' + item.name + '/',
                url: '/' + item.name + '/',
                description: '原型页面'
            });
        }
        
        const subItems = fs.readdirSync(dirPath, { withFileTypes: true });
        subItems.forEach(subItem => {
            if (!subItem.isDirectory()) return;
            
            const subDirPath = path.join(dirPath, subItem.name);
            const subIndexPath = path.join(subDirPath, 'index.html');
            
            if (fs.existsSync(subIndexPath)) {
                projects.push({
                    name: item.name + ' / ' + subItem.name,
                    path: '/' + item.name + '/' + subItem.name + '/',
                    url: '/' + item.name + '/' + subItem.name + '/',
                    description: '原型页面'
                });
            }
        });
    });
    
    return projects.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

app.get('/api/data/*', (req, res) => {
    const dataPath = path.join(ROOT_DIR, req.params[0]);
    
    if (!fs.existsSync(dataPath)) {
        return res.json({
            success: false,
            message: '数据文件不存在',
            data: []
        });
    }
    
    try {
        const content = fs.readFileSync(dataPath, 'utf-8');
        const data = content.trim() ? JSON.parse(content) : { listData: [] };
        
        res.json({
            success: true,
            data: data.listData || data,
            source: 'file',
            lastUpdate: new Date().toISOString()
        });
    } catch (e) {
        res.json({
            success: false,
            message: '读取数据失败: ' + e.message,
            data: []
        });
    }
});

app.post('/api/data/*', (req, res) => {
    const dataPath = path.join(ROOT_DIR, req.params[0]);
    const dirPath = path.dirname(dataPath);
    
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const existingData = fs.existsSync(dataPath) 
            ? JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '{}')
            : {};
        
        const newData = {
            ...existingData,
            listData: req.body.data || req.body.listData || [],
            lastUpdate: new Date().toISOString()
        };
        
        fs.writeFileSync(dataPath, JSON.stringify(newData, null, 4));
        
        res.json({
            success: true,
            message: '保存成功',
            lastUpdate: newData.lastUpdate
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: '保存失败: ' + e.message
        });
    }
});

app.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  ELSA 原型服务器已启动');
    console.log('========================================');
    console.log('');
    console.log('  服务地址: http://localhost:' + PORT);
    console.log('  状态: 运行中');
    console.log('');
    console.log('  pm2 命令:');
    console.log('  - 查看状态: npm run pm2:status');
    console.log('  - 查看日志: npm run pm2:logs');
    console.log('  - 重启服务: npm run pm2:restart');
    console.log('  - 停止服务: npm run pm2:stop');
    console.log('');
    console.log('========================================');
});
