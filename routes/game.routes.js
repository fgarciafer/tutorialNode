import { Router } from 'express';
import { check } from 'express-validator';
import validateFields from '../middlewares/validate-Fields.js';
import { createGame, getGames, updateGame } from '../controllers/game.controller.js';
const authorRouter = Router();

authorRouter.put('/:id', [
    check('title').not().isEmpty(),
    check('age').not().isEmpty(),
    check('category.id').not().isEmpty(),
    check('author.id').not().isEmpty(),
    validateFields
], updateGame);

authorRouter.put('/', [
    check('title').not().isEmpty(),
    check('age').not().isEmpty(),
    check('age').isNumeric(),
    check('category.id').not().isEmpty(),
    check('author.id').not().isEmpty(),
    validateFields
], createGame);

authorRouter.get('/', getGames);
authorRouter.get('/:query', getGames);


export default authorRouter;