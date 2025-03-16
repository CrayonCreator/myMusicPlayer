const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

// 使用更详细的CORS配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range', 'Accept', 'Authorization', 'Content-Length'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
}));

// 确保OPTIONS请求能通过
app.options('/proxy-audio', cors());

app.get('/proxy-audio', async (req, res) => {
  try {
    const audioUrl = req.query.url;
    if (!audioUrl) {
      return res.status(400).send('Missing URL parameter');
    }
    
    console.log(`代理请求: ${audioUrl}`);
    
    const response = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream',
      timeout: 30000  
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = response.headers['content-length'];
    
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    
    // 明确设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('代理请求失败:', error.message);
    res.status(500).send('代理请求失败');
  }
});

app.listen(port, () => {
  console.log(`代理服务器运行在 http://localhost:${port}`);
});