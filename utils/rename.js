const fs = require('fs');
const path = require('path');

const root = __dirname;

const filesToUpdate = [
    { file: 'index.html', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'package.json', rules: [ { from: /gridly/g, to: 'brickly' }, { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'capacitor.config.json', rules: [ { from: /"appName": "Gridly"/g, to: '"appName": "Brickly"' } ] },
    { file: 'scripts/build-mobile-assets.mjs', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'style.css', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'MOBILE.md', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/game.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/audio.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/engine.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/modes.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/particles.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/spawner.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'js/storage.js', rules: [ { from: /Gridly -/g, to: 'Brickly -' } ] }, // Avoid touching gridly_high_score
    { file: 'js/themes.js', rules: [ { from: /Gridly/g, to: 'Brickly' } ] },
    { file: 'android/app/src/main/res/values/strings.xml', rules: [ { from: />Gridly</g, to: '>Brickly<' } ] },
    { file: 'ios/App/App/Info.plist', rules: [ { from: />Gridly</g, to: '>Brickly<' } ] },
];

for (const { file, rules } of filesToUpdate) {
    const fullPath = path.join(root, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        for (const rule of rules) {
            if (rule.from.test(content)) {
                content = content.replace(rule.from, rule.to);
                modified = true;
            }
        }
        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated: ${file}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
}
