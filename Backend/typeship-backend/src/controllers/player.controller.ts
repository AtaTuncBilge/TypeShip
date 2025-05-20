// filepath: c:\projeler\TypeShip.v2\src\controllers\player.controller.ts
import { Request, Response } from 'express';
import { PlayerService } from '../services/player.service';

export class PlayerController {
    private playerService: PlayerService;

    constructor() {
        this.playerService = new PlayerService();
    }

    public createPlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerData = req.body;
            const newPlayer = await this.playerService.createPlayer(playerData);
            res.status(201).json(newPlayer);
        } catch (error) {
            res.status(500).json({ message: 'Error creating player', error });
        }
    };

    public getPlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerId = req.params.id;
            const player = await this.playerService.getPlayer(playerId);
            if (player) {
                res.status(200).json(player);
            } else {
                res.status(404).json({ message: 'Player not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving player', error });
        }
    };

    public deletePlayer = async (req: Request, res: Response): Promise<void> => {
        try {
            const playerId = req.params.id;
            const result = await this.playerService.deletePlayer(playerId);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Player not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting player', error });
        }
    };
}