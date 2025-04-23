const fs = require('fs');
const path = require('path');

function printDir(dirPath, indent = '') {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
        if (item === 'node_modules') return; // Bỏ qua node_modules
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        console.log(`${indent}${item}`);
        if (stats.isDirectory()) {
            printDir(fullPath, indent + '  ');
        }
    });
}

printDir('.');