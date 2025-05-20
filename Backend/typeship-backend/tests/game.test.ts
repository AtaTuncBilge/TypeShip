import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary
import { GameService } from '../src/services/game.service';

jest.mock('../src/services/game.service');

describe('GameController', () => {
  const gameService = new GameService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a game', async () => {
    const newGame = { name: 'Test Game', players: [] };
    (gameService.createGame as jest.Mock).mockResolvedValue(newGame);

    const response = await request(app).post('/api/games').send(newGame);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(newGame);
    expect(gameService.createGame).toHaveBeenCalledWith(newGame);
  });

  it('should get a game by id', async () => {
    const gameId = '1';
    const game = { id: gameId, name: 'Test Game', players: [] };
    (gameService.getGame as jest.Mock).mockResolvedValue(game);

    const response = await request(app).get(`/api/games/${gameId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(game);
    expect(gameService.getGame).toHaveBeenCalledWith(gameId);
  });

  it('should delete a game by id', async () => {
    const gameId = '1';
    (gameService.deleteGame as jest.Mock).mockResolvedValue(true);

    const response = await request(app).delete(`/api/games/${gameId}`);

    expect(response.status).toBe(204);
    expect(gameService.deleteGame).toHaveBeenCalledWith(gameId);
  });
});