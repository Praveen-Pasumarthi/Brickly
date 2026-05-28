const fs = require('fs');
const path = require('path');

const root = __dirname;

const filesToUpdate = [
    { file: 'capacitor.config.json', rules: [ { from: /com\.gridly\.game/g, to: 'com.brickly.game' } ] },
    { file: 'js/storage.js', rules: [ { from: /gridly_/g, to: 'brickly_' } ] },
    { file: 'android/app/src/main/res/values/strings.xml', rules: [ { from: /com\.gridly\.game/g, to: 'com.brickly.game' } ] },
    { file: 'android/app/build.gradle', rules: [ { from: /com\.gridly\.game/g, to: 'com.brickly.game' } ] },
    { file: 'ios/App/App.xcodeproj/project.pbxproj', rules: [ { from: /com\.gridly\.game/g, to: 'com.brickly.game' } ] },
];

// Step 1: Update contents
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

// Step 2: Move the Android java package folder
const oldDir = path.join(root, 'android/app/src/main/java/com/gridly');
const newDir = path.join(root, 'android/app/src/main/java/com/brickly');
if (fs.existsSync(oldDir)) {
    fs.renameSync(oldDir, newDir);
    console.log('Renamed java package directory to com/brickly');
    
    // Update the package declaration in MainActivity.java
    const mainActivityPath = path.join(newDir, 'game/MainActivity.java');
    if (fs.existsSync(mainActivityPath)) {
        let content = fs.readFileSync(mainActivityPath, 'utf8');
        content = content.replace(/package com\.gridly\.game;/g, 'package com.brickly.game;');
        fs.writeFileSync(mainActivityPath, content, 'utf8');
        console.log('Updated package name inside MainActivity.java');
    }
}
