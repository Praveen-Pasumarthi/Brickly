const { Jimp } = require('jimp');

async function removeBackground() {
    try {
        const image = await Jimp.read('logo1.png');
        
        // Let's do a flood fill from the edges to make it transparent, 
        // with a certain tolerance for the gradient background.
        
        // A simple approach: Any pixel where Blue is the dominant color and it's relatively dark,
        // make it transparent. The Gridly letters are bright (Cyan, Pink, Yellow, Green, Orange, Purple)
        // and have gold borders. None of them are dark blue.
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // Background is deep blue: R is low, G is low-medium, B is high.
            // Foreground has bright colors or gold.
            // Cyan: high G, high B. Pink: high R, high B. Yellow: high R, high G.
            // Green: high G. Orange: high R. Purple: high R, high B.
            // Gold: high R, high G, low B.
            
            // Let's check if the pixel is "dark blue background"
            // Typical background: R < 80, G < 120, B > R, B > G
            if (b > r + 10 && b > g + 5 && r < 100 && g < 130) {
                // It's likely the blue background grid
                // Make it transparent
                this.bitmap.data[idx + 3] = 0; // Alpha = 0
            } else if (r < 30 && g < 40 && b < 100) {
                // very dark shadows of the background
                this.bitmap.data[idx + 3] = 0;
            }
        });
        await new Promise((resolve, reject) => {
            image.write('logo1_transparent.png', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log("Successfully removed background and saved to logo1_transparent.png");
    } catch (err) {
        console.error("Error processing image:", err);
    }
}

removeBackground();
