const { Jimp } = require('jimp');
const path = require('path');

async function main() {
    try {
        const srcPath = path.join(__dirname, '../assets/images/ingame_logo.png');
        const destPath = path.join(__dirname, '../assets/store_listing/feature_graphic.png');

        console.log(`Reading source image: ${srcPath}`);
        const logo = await Jimp.read(srcPath);
        const origW = logo.bitmap.width;
        const origH = logo.bitmap.height;
        console.log(`Original dimensions: ${origW}x${origH}`);

        // Target dimensions
        const targetW = 1024;
        const targetH = 500;

        // Create the blank canvas
        console.log(`Creating target canvas: ${targetW}x${targetH}`);
        const canvas = new Jimp({ width: targetW, height: targetH });

        // Draw a beautiful vertical gradient matching the game's main menu: #0F3CC9 (top) to #06103B (bottom)
        const startColor = { r: 15, g: 60, b: 201 }; // #0F3CC9
        const endColor = { r: 6, g: 16, b: 59 };    // #06103B

        canvas.scan(0, 0, targetW, targetH, function (x, y, idx) {
            const ratio = y / targetH;
            const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
            const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
            const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

            this.bitmap.data[idx + 0] = r;
            this.bitmap.data[idx + 1] = g;
            this.bitmap.data[idx + 2] = b;
            this.bitmap.data[idx + 3] = 255; // Fully opaque
        });

        // Resize the logo to fit nicely in height (leave 60px padding at top and bottom, so height = 380)
        const newH = 380;
        const newW = Math.round(newH * (origW / origH));
        console.log(`Resizing logo to: ${newW}x${newH}`);
        logo.resize({ w: newW, h: newH });

        // Paste the resized logo into the center of the canvas
        const offsetX = Math.round((targetW - newW) / 2);
        const offsetY = Math.round((targetH - newH) / 2);
        console.log(`Compositing logo at offset: x=${offsetX}, y=${offsetY}`);
        canvas.composite(logo, offsetX, offsetY);

        // Write the result
        console.log(`Writing output to: ${destPath}`);
        await canvas.write(destPath);
        console.log("Successfully created feature_graphic.png!");

    } catch (err) {
        console.error("Error creating feature graphic:", err);
    }
}

main();
