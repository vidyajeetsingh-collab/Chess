class MysterySystem {
    constructor() {
        this.hiddenSquares = {}; // format: "x,y": { type, revealed: false, effect }
        this.fogGrids = {
            w: Array(8).fill(0).map(() => Array(8).fill(false)),
            b: Array(8).fill(0).map(() => Array(8).fill(false))
        };
        this.effectsList = [
            { name: "Reveal Rune", desc: "Reveals a 3x3 local area of fog for 1 turn." },
            { name: "Illumination", desc: "Briefly pings enemy positions on the tactical log." },
            { name: "Aether Blessing", desc: "Grants movement precision bonus." }
        ];
    }

    initMysteryNodes() {
        this.hiddenSquares = {};
        // Randomly scatter 5 mystery squares on rows 2 to 5
        const candidateRows = [2, 3, 4, 5];
        let placed = 0;
        while(placed < 5) {
            const rx = Math.floor(Math.random() * 8);
            const ry = candidateRows[Math.floor(Math.random() * candidateRows.length)];
            const key = `${rx},${ry}`;
            if (!this.hiddenSquares[key]) {
                const effect = this.effectsList[Math.floor(Math.random() * this.effectsList.length)];
                this.hiddenSquares[key] = { type: 'rune', revealed: false, effect: effect };
                placed++;
            }
        }
    }

    updateVision(pieces) {
        // Reset vision grids
        this.fogGrids.w = Array(8).fill(0).map(() => Array(8).fill(false));
        this.fogGrids.b = Array(8).fill(0).map(() => Array(8).fill(false));

        pieces.forEach(p => {
            if (!p.alive) return;
            const grid = p.color === 'w' ? this.fogGrids.w : this.fogGrids.b;
            // Radius 2 visibility around every active piece
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    const nx = p.x + dx;
                    const ny = p.y + dy;
                    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                        if (Math.abs(dx) + Math.abs(dy) <= 3) { // Chebyshev / Manhattan blend limit
                            grid[nx][ny] = true;
                        }
                    }
                }
            }
        });
    }

    checkSquare(x, y, color) {
        const key = `${x},${y}`;
        if (this.hiddenSquares[key] && !this.hiddenSquares[key].revealed) {
            this.hiddenSquares[key].revealed = true;
            return this.hiddenSquares[key].effect;
        }
        return null;
    }
}
