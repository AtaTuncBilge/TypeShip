import express from 'express';
import { setGameRoutes } from './routes/game.routes';
import { setPlayerRoutes } from './routes/player.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
setGameRoutes(app);
setPlayerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;