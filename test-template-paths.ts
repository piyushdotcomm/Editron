
import path from 'path';
import fs from 'fs';

const templatePaths = {
    REACT: "editron-starters/react-ts",
    NEXTJS: 'editron-starters/nextjs',
    EXPRESS: 'editron-starters/express-simple',
    VUE: 'editron-starters/vue',
    HONO: 'editron-starters/hono-nodejs-starter',
    ANGULAR: 'editron-starters/angular',
};

const cwd = process.cwd();
console.log('CWD:', cwd);

for (const [key, templatePath] of Object.entries(templatePaths)) {
    const fullPath = path.join(cwd, templatePath);
    console.log(`Checking ${key}: ${fullPath}`);
    try {
        const stats = fs.statSync(fullPath); // Sync for test brevity
        console.log(`  - Exists via fs.statSync: ${stats.isDirectory()}`);
    } catch (e) {
        console.error(`  - Failed to access: ${(e as Error).message}`);
    }
}
