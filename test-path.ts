
import path from 'path';
import fs from 'fs';

const cwd = process.cwd();
const templatePath = '/editron-starters/nextjs';
const fullPath = path.join(cwd, templatePath);

console.log('CWD:', cwd);
console.log('Template Path:', templatePath);
console.log('Full Path:', fullPath);

fs.stat(fullPath, (err, stats) => {
    if (err) {
        console.error('Error accessing path:', err);
    } else {
        console.log('Path exists and is directory:', stats.isDirectory());
    }
});
