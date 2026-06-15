class Game {
    constructor({ totalRounds = 5, seed = '12345' } = {}) {
        this.currentRound = 0;
        this.totalRounds = totalRounds;
        this.currentScore = 0;
        this.seed = seed;
        this.weights = [];
        this.currentPan = undefined;
        this.yourGuesses = [];
        this.correctGuesses = [];
        this.guessed = false;
        this.lines = [];
        this.time = 180;
        this.totalDistance = 0;
        this.difficulty = 1;
        this.timetaken = 0;
    }

    incrementRound() {
        this.currentRound += 1;
        roundLabel.innerText = String(this.currentRound)+"/"+String(this.totalRounds);
    }

    addScore(amount) {
        this.currentScore += amount;
        scoreLabel.innerText = String(this.currentScore);
    }

    setWeights(weights){
        this.weights = weights;
    }
}

window.Game = Game;
window.game = null;

window.addEventListener('DOMContentLoaded', async () => {
    randomizeSeed();
});
