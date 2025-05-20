// filepath: c:\projeler\TypeShip.v2\src\services\player.service.ts
export class PlayerService {
    private players: any[] = []; // This will hold player data

    createPlayer(playerData: any) {
        this.players.push(playerData);
        return playerData;
    }

    getPlayer(playerId: string) {
        return this.players.find(player => player.id === playerId);
    }

    deletePlayer(playerId: string) {
        this.players = this.players.filter(player => player.id !== playerId);
    }

    getAllPlayers() {
        return this.players;
    }
}