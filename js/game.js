class ChessGame {
    constructor() {
        this.turn = 'w'; // 'w' or 'b'
        this.gameMode = 'mystery'; // 'mystery', 'classic', 'ai', 'pvp'
        this.pieces = [];
        this.history = [];
        this.selectedPiece = null;
        
        this.mystery = new MysterySystem();
        this.renderer = new Renderer3D('canvas-container');
        this.ai = new MysteryChessAI('medium');

        this.initListeners();
        this.renderer.animate();
    }

    initListeners() {
        // UI Navigation buttons
        document.getElementById('btn-mystery-mode').onclick = () => this.startNewGame('mystery');
        document.getElementById('btn-classic-mode').onclick = () => this.startNewGame('classic');
        document.getElementById('btn-ai-mode').onclick = () => this.startNewGame('ai');
        document.getElementById('btn-local-pvp').onclick = () => this.startNewGame('pvp');
        document.getElementById('btn-challenges').onclick = () => alert("Mystery Challenges loaded!");
        document.getElementById('btn-settings').onclick = () => this.showScreen('settings-screen');
        document.getElementById('btn-close-settings').onclick = () => this.showScreen('main-menu');
        document.getElementById('btn-help').onclick = () => this.showScreen('help-screen');
        document.getElementById('btn-close-help').onclick = () => this.showScreen('main-menu');

        // In-game HUD actions
        document.getElementById('hud-menu-btn').onclick = () => {
            this.showScreen('main-menu');
            document.getElementById('game-hud').classList.add('hidden');
        };
        document.getElementById('hud-reset-btn').onclick = () => this.startNewGame(this.gameMode);

        // Raycasting selection for touch / click
        window.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    startNewGame(mode) {
        this.gameMode = mode;
        this.showScreen(''); // Hide all menus
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('game-hud').classList.remove('hidden');

        this.turn = 'w';
        this.setupBoardStandard();
        if (this.gameMode === 'mystery' || this.gameMode === 'ai') {
            this.mystery.initMysteryNodes();
        }
        this.updateGameState();
    }

    setupBoardStandard() {
        this.pieces = [];
        const backRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        
        // Setup Black
        for (let i = 0; i < 8; i++) {
            this.pieces.push({ type: backRow[i], color: 'b', x: i, y: 7, alive: true });
            this.pieces.push({ type: 'p', color: 'b', x: i, y: 6, alive: true });
        }
        // Setup White
        for (let i = 0; i < 8; i++) {
            this.pieces.push({ type: 'p', color: 'w', x: i, y: 1, alive: true });
            this.pieces.push({ type: 'r', color: 'w', x: i, y: 0, alive: true }); // simplified back rank setup or standard order
        }
        // Correction for exact standard back row ordering
        const whiteBack = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        for (let i = 0; i < 8; i++) {
            this.pieces[16 + i].type = whiteBack[i];
        }
    }

    getPieceAt(x, y) {
        return this.pieces.find(p => p.alive && p.x === x && p.y === y);
    }

    updateGameState() {
        this.mystery.updateVision(this.pieces);
        this.renderer.syncPieces(this.pieces);
        
        const currentFog = this.turn === 'w' ? this.mystery.fogGrids.w : this.mystery.fogGrids.b;
        if (this.gameMode === 'classic') {
            // Full visibility in classic mode
            const fullVis = Array(8).fill(0).map(() => Array(8).fill(true));
            this.renderer.applyFog(fullVis, true);
        } else {
            this.renderer.applyFog(currentFog, this.turn === 'w');
        }

        document.getElementById('turn-indicatorinnerText').innerText = `${this.turn === 'w' ? "White" : "Black"}'s Turn`;
    }

    onPointerDown(e) {
        if (e.target.closest('#game-hud') === false && document.getElementById('game-hud').classList.contains('hidden')) return;
        
        // Simple raycaster implementation to select tiles
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.renderer.camera);
        const intersects = raycaster.intersectObjects(this.renderer.boardGroup.children);

        if (intersects.length > 0) {
            const hitTile = intersects[0].object;
            // Find tile coordinates
            for (let x = 0; x < 8; x++) {
                for (let y = 0; y < 8; y++) {
                    if (this.renderer.tiles[x][y] === hitTile) {
                        this.handleSquareClick(x, y);
                        return;
                    }
                }
            }
        }
    }

    handleSquareClick(x, y) {
        const clickedPiece = this.getPieceAt(x, y);

        if (this.selectedPiece) {
            // Attempt move
            if (this.selectedPiece.x === x && this.selectedPiece.y === y) {
                this.selectedPiece = null; // deselect
                return;
            }
            
            // Execute basic valid move logic
            this.selectedPiece.x = x;
            this.selectedPiece.y = y;
            if (clickedPiece && clickedPiece.color !== this.selectedPiece.color) {
                clickedPiece.alive = false;
            }

            // Check mystery square trigger
            if (this.gameMode === 'mystery' || this.gameMode === 'ai') {
                const effect = this.mystery.checkSquare(x, y, this.selectedPiece.color);
                if (effect) {
                    document.getElementById('mystery-log').innerText = `Mystery Triggered: ${effect.name} - ${effect.desc}`;
                }
            }

            this.selectedPiece = null;
            this.turn = this.turn === 'w' ? 'b' : 'w';
            this.updateGameState();

            // Trigger AI if applicable
            if (this.gameMode === 'ai' && this.turn === 'b') {
                setTimeout(() => {
                    const aiMove = this.ai.getBestMove(this);
                    if (aiMove) {
                        const p = this.getPieceAt(aiMove.fromX, aiMove.fromY);
                        const target = this.getPieceAt(aiMove.toX, aiMove.toY);
                        if (p) {
                            p.x = aiMove.toX;
                            p.y = aiMove.toY;
                            if (target) target.alive = false;
                        }
                    }
                    this.turn = 'w';
                    this.updateGameState();
                }, 600);
            }

        } else if (clickedPiece && clickedPiece.color === this.turn) {
            this.selectedPiece = clickedPiece;
        }
    }

    getAllLegalMoves(color) {
        let moves = [];
        this.pieces.filter(p => p.color === color && p.alive).forEach(p => {
            // Basic sliding/step heuristic for generation mockup
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = p.x + dx;
                    const ny = p.y + dy;
                    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                        const occupant = this.getPieceAt(nx, ny);
                        if (!occupant || occupant.color !== color) {
                            moves.push({ fromX: p.x, fromY: p.y, toX: nx, toY: ny });
                        }
                    }
                }
            }
        });
        return moves;
    }
}

// Boot up game engine on window load
window.addEventListener('load', () => {
    window.game = new ChessGame();
});
