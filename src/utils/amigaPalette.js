// Amiga color palette management
class AmigaPalette {
    constructor() {
        this.palette = this.generateAmigaPalette();
        this.activeColors = new Set();
        this.maxColors = 32; // Default to 32 colors (can be changed per effect)
    }

    // Generate the full 4096 color Amiga palette
    generateAmigaPalette() {
        const palette = [];
        for (let r = 0; r < 16; r++) {
            for (let g = 0; g < 16; g++) {
                for (let b = 0; b < 16; b++) {
                    palette.push({
                        r: (r * 17), // Convert 0-15 to 0-255 range
                        g: (g * 17),
                        b: (b * 17)
                    });
                }
            }
        }
        return palette;
    }

    // Convert any RGB color to nearest Amiga palette color
    nearestColor(r, g, b) {
        r = Math.round(r / 17);
        g = Math.round(g / 17);
        b = Math.round(b / 17);
        
        return {
            r: r * 17,
            g: g * 17,
            b: b * 17
        };
    }

    // Get color in CSS format
    getRGBString(color) {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    // Set maximum colors for current effect
    setMaxColors(num) {
        this.maxColors = num;
        this.activeColors.clear();
    }
}

export const amigaPalette = new AmigaPalette(); 