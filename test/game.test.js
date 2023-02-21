import supertest from 'supertest';
import { jest } from '@jest/globals';
import App, { server } from '../index';
import mongoose from 'mongoose';
import CategoryModel from '../src/schemas/category.schema';
import GameModel from '../src/schemas/game.schema';
import AuthorModel from '../src/schemas/author.schema';

const api = supertest(App);
jest.setTimeout(5000);

beforeAll(async () => {
    const Category1 = new CategoryModel({
        "name": "category1"
    });
    await Category1.save();

    const Author1 = new AuthorModel({
        "name": "author1",
        "nationality": "ES"
    });
    await Author1.save();

    const authors = await api.get('/author');
    const categories = await api.get('/category');

    await GameModel.deleteMany({});
    const Game1 = new GameModel({
        "title": "title1",
        "age": "13",
        "category": categories.body[0].id,
        "author": authors.body[0].id
    });
    await Game1.save();
});

describe('game test', () => {

    test('get games', async () => {
        const response = await api.get('/game').expect(200);
        expect(response.body).toHaveLength(1);
    });

    test('create game', async () => {
        const authors = await api.get('/author');
        const categories = await api.get('/category');

        const newGame = {
            "title": "title2",
            "age": "15",
            "category": { "id": categories.body[0].id },
            "author": { "id": authors.body[0].id }
        };
        await api.put('/game').send(newGame).expect(200);

        const response = await api.get('/game');
        expect(response.body).toHaveLength(2);
    });

    test('create game with error', async () => {
        const authors = await api.get('/author');
        const categories = await api.get('/category');

        const newGame = {
            "title": "title2",
            "age": "15",
            "category": { "id": categories.body[0].id },
            "author": { "id": authors.body[0].id }
        };

        jest.spyOn(GameModel.prototype, 'save')
            .mockImplementationOnce(() => Promise.reject('fail create'));

        await api.put('/game').send(newGame).expect(400);
    });

    test('update game', async () => {
        const response = await api.get('/game');
        const id = response.body[0].id;

        const authors = await api.get('/author');
        const categories = await api.get('/category');

        const newGame = {
            "title": "newGameTitle",
            "age": "15",
            "category": { "id": categories.body[0].id },
            "author": { "id": authors.body[0].id }
        };
        await api.put('/game/' + id).send(newGame).expect(200);

        const responseAfterUpdate = await api.get('/game');
        expect(responseAfterUpdate.body[0].title).toBe('newGameTitle');
    });

    test('update game with wrong id', async () => {
        const newGame = {
            "title": "newGameTitle",
            "age": "15",
            "category": { "id": 1 },
            "author": { "id": 1 }
        };
        jest.spyOn(GameModel, 'findById').mockResolvedValue(null);
        await api.put('/game/' + 1).send(newGame).expect(400);
    });
});
afterAll(() => {
    server.close();
    mongoose.connection.close();
});