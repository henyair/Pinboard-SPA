const fs = require('fs');
const path = require('path');

const outputFile = 'project_code_summary.txt';
const ignoreDirs = ['node_modules', 'bin', 'obj', '.git', '.angular', 'dist'];
const validExtensions = ['.cs', '.ts', '.html', '.scss', '.yml', '.conf'];

let output = '';

function scanFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                scanFiles(fullPath);
            }
        } else {
            const ext = path.extname(fullPath);
            if (validExtensions.includes(ext) || file === 'Dockerfile') {
                output += `\n\n========================================\n`;
                output += `FILE: ${fullPath.replace(/\\/g, '/')}\n`;
                output += `========================================\n\n`;
                output += fs.readFileSync(fullPath, 'utf8');
            }
        }
    }
}

console.log('Scanning project files...');
scanFiles('./');
fs.writeFileSync(outputFile, output);
console.log(`Done! All relevant code has been compiled into -> ${outputFile}`);