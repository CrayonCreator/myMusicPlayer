const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range']
};

const createProxyHandler = (responseType = 'stream') => async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing URL parameter');

    console.log(`代理请求: ${targetUrl}`);

    const response = await axios({
      method: 'get',
      url: targetUrl,
      responseType: responseType,
      timeout: 30000
    });

    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length'],
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    if (responseType === 'stream') {
      response.data.pipe(res);
    } else {
      res.send(response.data);
    }
  } catch (error) {
    console.error('代理请求失败:', error.message);
    res.status(500).send('代理请求失败');
  }
};

app.get('/proxy-audio', cors(corsOptions), createProxyHandler('stream'));

app.get('/proxy-image', cors(corsOptions), createProxyHandler('arraybuffer'));

app.listen(port, () => {
  console.log(`综合代理服务器运行在 http://localhost:${port}`);
});