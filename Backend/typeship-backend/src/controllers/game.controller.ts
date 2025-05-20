// filepath: c:\projeler\TypeShip.v2\src\controllers\game.controller.ts
import { Request, Response } from 'express';
import { GameService } from '../services/game.service';

export class GameController {
    private gameService: GameService;

    constructor() {
        this.gameService = new GameService();
    }

    public createGame = async (req: Request, res: Response): Promise<void> => {
        try {
            const gameData = req.body;
            const newGame = await this.gameService.createGame(gameData);
            res.status(201).json(newGame);
        } catch (error) {
            res.status(500).json({ message: 'Error creating game', error });
        }
    };

    public getGame = async (req: Request, res: Response): Promise<void> => {
        try {
            const gameId = req.params.id;
            const game = await this.gameService.getGame(gameId);
            if (game) {
                res.status(200).json(game);
            } else {
                res.status(404).json({ message: 'Game not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving game', error });
        }
    };

    public deleteGame = async (req: Request, res: Response): Promise<void> => {
        try {
            const gameId = req.params.id;
            const result = await this.gameService.deleteGame(gameId);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Game not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting game', error });
        }
    };
}