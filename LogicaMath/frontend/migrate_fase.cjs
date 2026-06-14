const fs = require('fs');
const path = require('path');

function migrateFase(srcFase, destFase) {
    const srcDir = path.join(__dirname, `components/fase${srcFase}`);
    const destDir = path.join(__dirname, `components/fase${destFase}`);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);
    for (const file of files) {
        if (file.includes(`WelcomeScreenPhase`)) continue; // skip welcome screens if not needed

        const srcPath = path.join(srcDir, file);
        let destFile = file.replace(`Fase${srcFase}`, `Fase${destFase}`).replace(`fase${srcFase}`, `fase${destFase}`);
        const destPath = path.join(destDir, destFile);

        const isDir = fs.statSync(srcPath).isDirectory();
        if (!isDir) {
            let content = fs.readFileSync(srcPath, 'utf-8');
            content = content.replace(new RegExp(`Fase${srcFase}`, 'g'), `Fase${destFase}`);
            content = content.replace(new RegExp(`fase${srcFase}`, 'g'), `fase${destFase}`);
            fs.writeFileSync(destPath, content);
            console.log(`Created ${destPath}`);
        }
    }
}

migrateFase(8, 9);
