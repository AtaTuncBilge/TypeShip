export class Game {
    id: string;
    title: string;
    genre: string;
    releaseDate: Date;

    constructor(id: string, title: string, genre: string, releaseDate: Date) {
        this.id = id;
        this.title = title;
        this.genre = genre;
        this.releaseDate = releaseDate;
    }

    // Method to update game details
    updateGame(title: string, genre: string, releaseDate: Date) {
        this.title = title;
        this.genre = genre;
        this.releaseDate = releaseDate;
    }

    // Method to get game details
    getGameDetails() {
        return {
            id: this.id,
            title: this.title,
            genre: this.genre,
            releaseDate: this.releaseDate,
        };
    }
}