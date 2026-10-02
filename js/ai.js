class MysteryChessAI {
    constructor(difficulty) {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    }

    getBestMove(game) {
        const legalMoves = game.getAllLegalMoves('b');
        if (legalMoves.length === 0) return null;

        if (this.difficulty === 'easy') {
            return legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }

        // Medium / Hard heuristic evaluation
        let bestMove = legalMoves[0];
        let maxScore = -9999;

        legalMoves.forEach(move => {
            let score = Math.random() * 10; // slight tiebreaker entropy
            const targetPiece = game.getPieceAt(move.toX, move.toY);
            if (targetPiece) {
                const values = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
                score += values[targetPiece.type] || 0;
            }
            if (score > maxScore) {
                maxScore = score;
                bestMove = move;
            }
        });

        return bestMove;
    }
}
