const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname)); // Serve HTML/JS
app.use('/materials', express.static(path.join(__dirname, 'materials'))); // Serve PDFs/Audios

// This endpoint scans the directory
app.get('/api/files', (req, res) => {
    const rootDir = path.join(__dirname, 'materials');
    
    const getFiles = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results.push({ name: file, type: 'folder', children: getFiles(filePath) });
            } else {
                results.push({ 
                    name: file, 
                    type: 'file', 
                    path: path.relative(__dirname, filePath).replace(/\\/g, '/') 
                });
            }
        });
        return results;
    };

    try {
        const fileTree = getFiles(rootDir);
        res.json(fileTree);
    } catch (err) {
        res.status(500).send("Error reading files");
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));