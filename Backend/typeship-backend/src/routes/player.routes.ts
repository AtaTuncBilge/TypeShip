import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';

const router = Router();
const playerController = new PlayerController();

export function setPlayerRoutes(app: Router) {
    app.post('/players', playerController.createPlayer);
    app.get('/players/:id', playerController.getPlayer);
    app.delete('/players/:id', playerController.deletePlayer);
}