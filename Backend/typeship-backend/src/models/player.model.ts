export class Player {
    id: string;
    name: string;
    score: number;

    constructor(id: string, name: string, score: number = 0) {
        this.id = id;
        this.name = name;
        this.score = score;
    }

    updateScore(newScore: number): void {
        this.score = newScore;
    }

    getPlayerInfo(): object {
        return {
            id: this.id,
            name: this.name,
            score: this.score
        };
    }
}