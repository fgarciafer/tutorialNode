import GameModel from '../schemas/game.schema.js';

export const getGames = async (req, res) => {
    const titleToFind = req.query?.title || '';
    const categoryToFind = req.query?.idCategory || null;
    const regexTitle = new RegExp(titleToFind, 'i');
    const find = categoryToFind ? { $and: [{ title: regexTitle }, { category: categoryToFind }] } : { title: regexTitle };
    const games = await GameModel.find(find).sort('id').populate('category').populate('author');
    res.status(200).json(games);
}

export const createGame = async (req, res) => {
    const game = new GameModel({
        ...req.body,
        category: req.body.category.id,
        author: req.body.author.id,
    });

    try {
        const gameSaved = await game.save();
        res.status(200).json({
            game: gameSaved
        });
    } catch (err) {
        res.status(500).json({
            msg: 'Error creating game'
        });
    }
}

export const updateGame = async (req, res) => {
    const gameId = req.params.id;
    const game = await GameModel.findById(gameId);
    if (!game) {
        return res.status(404).json({
            msg: 'There is no game with that Id'
        });
    }

    const gameToUpdate = {
        ...req.body,
        category: req.body.category.id,
        author: req.body.author.id,
    };
    await GameModel.findByIdAndUpdate(gameId, gameToUpdate, { new: false });
    res.status(200).json(1);
}