const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('text-muted') && !content.includes('text-muted-foreground')) {
                // simple replace replacing "text-muted" followed by a space or quote or backtick
                content = content.replace(/text-muted([ "'`\n}])/g, 'text-muted-foreground$1');
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'lib'));
console.log('done');
