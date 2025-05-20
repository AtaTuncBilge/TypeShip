// filepath: c:\projeler\TypeShip.v2\src\services\game.service.ts
export class GameService {
    private games: any[] = []; // This will hold the game objects

    createGame(gameData: any) {
        const newGame = { id: this.games.length + 1, ...gameData };
        this.games.push(newGame);
        return newGame;
    }

    getGame(gameId: number) {
        return this.games.find(game => game.id === gameId);
    }

    deleteGame(gameId: number) {
        const index = this.games.findIndex(game => game.id === gameId);
        if (index !== -1) {
            this.games.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllGames() {
        return this.games;
    }
}