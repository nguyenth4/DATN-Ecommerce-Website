const express = require('express');
const multer = require('multer');
const http = require('http');
const FormData = require('form-data');

const app = express();
const upload1 = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 } });
const upload2 = multer({ storage: multer.memoryStorage() });

app.post('/upload', (req, res, next) => {
    upload1.array('files')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, (req, res, next) => {
    upload2.array('files')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, (req, res) => {
    res.json({ files: req.files.map(f => f.originalname) });
});

const server = app.listen(0, () => {
    const port = server.address().port;
    const form = new FormData();
    form.append('files', Buffer.from('hello world'), { filename: 'test.txt' });
    
    const req = http.request({
        method: 'POST',
        host: 'localhost',
        port: port,
        path: '/upload',
        headers: form.getHeaders()
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Response:', res.statusCode, data);
            server.close();
        });
    });
    form.pipe(req);
});
