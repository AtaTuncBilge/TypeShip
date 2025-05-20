export const setGameRoutes = (app) => {
  const gameController = new (require('../controllers/game.controller').GameController)();

  app.post('/games', gameController.createGame);
  app.get('/games/:id', gameController.getGame);
  app.delete('/games/:id', gameController.deleteGame);
};