import supertest from 'supertest';
import { jest } from '@jest/globals';
import App, { server } from '../index';
import mongoose from 'mongoose';
import AuthorModel from '../src/schemas/author.schema';
import GameModel from '../src/schemas/game.schema';

const api = supertest(App);
const initialAuthors = [{
    "name": "author1",
    "nationality": "ES"
}, {
    "name": "author2",
    "nationality": "DE"
}];

jest.setTimeout(5000);

beforeEach(async () => {
    await AuthorModel.deleteMany({});
    const Author1 = new AuthorModel(initialAuthors[0]);
    await Author1.save();
    const Author2 = new AuthorModel(initialAuthors[1]);
    await Author2.save();
});

afterEach(() => {
    jest.resetAllMocks();
});

test('get authors', async () => {
    const response = await api.get('/author').expect(200);
    expect(response.body).toHaveLength(initialAuthors.length);
});

test('get authors pageable', async () => {
    const response = await api.post('/author').send({ pageable: { pageSize: 5, pageNumber: 0 } }).expect(200);
    expect(response.body.content).toHaveLength(initialAuthors.length);
});

test('create author', async () => {
    const newAuthor = { "name": "author3", "nationality": "ES" };
    await api.put('/author').send(newAuthor).expect(200);

    const response = await api.get('/author');
    expect(response.body).toHaveLength(initialAuthors.length + 1);
});

test('create author with error', async () => {
    jest.spyOn(AuthorModel.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject('fail create'));
    const newAuthor = { "name": "author3", "nationality": "ES" };
    await api.put('/author').send(newAuthor).expect(400);
});

test('update author', async () => {
    const response = await api.get('/author');
    const id = response.body[0].id;

    const newAuthor = { "name": "author1Modified", "nationality": "ES" };
    await api.put('/author/' + id).send(newAuthor).expect(200);

    const responseAfterUpdate = await api.get('/author');
    expect(responseAfterUpdate.body[0].name).toBe('author1Modified');
});

test('update author with error', async () => {
    const newAuthor = { "name": "author1Modified", "nationality": "ES" };
    await api.put('/author/' + 'noExist').send(newAuthor).expect(400);
});

test('delete author', async () => {
    const response = await api.get('/author');
    const id = response.body[0].id;

    await api.delete('/author/' + id).expect(200);

    const responseAfterDelete = await api.get('/author');
    expect(responseAfterDelete.body).toHaveLength(response.body.length - 1);
});

test('delete author with error', async () => {
    const response = await api.get('/author');
    const id = response.body[0].id;
    jest.spyOn(AuthorModel, 'findByIdAndDelete').mockRejectedValueOnce(1);
    await api.delete('/author/' + id).expect(400);
});

test('update author with wrong id', async () => {
    const newAuthor = { "name": "author1Modified", "nationality": "ES" };
    const id = 1;
    jest.spyOn(AuthorModel, 'findById').mockResolvedValue(null);
    await api.put('/author/' + id).send(newAuthor).expect(400);
});

test('delete author with wrong id', async () => {
    const response = await api.get('/author');
    const id = response.body[0].id;
    jest.spyOn(AuthorModel, 'findById').mockResolvedValue(null);
    await api.delete('/author/' + id).expect(400);
});


test('delete author with game', async () => {
    const response = await api.get('/author');
    const id = response.body[0].id;
    jest.spyOn(GameModel, 'find').mockResolvedValue([1]);
    await api.delete('/author/' + id).expect(400);
});

afterAll(() => {
    server.close();
    mongoose.connection.close();
});