import supertest from 'supertest';
import { jest } from '@jest/globals';
import App, { server } from '../index';
import mongoose from 'mongoose';
import CategoryModel from '../src/schemas/category.schema';
import GameModel from '../src/schemas/game.schema';

const api = supertest(App);

const initialCategories = [{
    "name": "category1"
}, {
    "name": "category2"
}];

jest.setTimeout(5000);

beforeEach(async () => {
    await CategoryModel.deleteMany({});
    const Category1 = new CategoryModel(initialCategories[0]);
    await Category1.save();
    const Category2 = new CategoryModel(initialCategories[1]);
    await Category2.save();
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('category test', () => {
    test('get categories', async () => {
        const response = await api.get('/category').expect(200);
        expect(response.body).toHaveLength(initialCategories.length);
    });

    test('create category', async () => {
        const newCategory = { "name": "category3" };
        await api.put('/category').send(newCategory).expect(200);

        const response = await api.get('/category');
        expect(response.body).toHaveLength(initialCategories.length + 1);
    });

    test('create category with error', async () => {
        jest.spyOn(CategoryModel.prototype, 'save')
            .mockImplementationOnce(() => Promise.reject('fail create'));
        const newCategory = { "name": "category3" };
        await api.put('/category').send(newCategory).expect(400);
    });

    test('create category with empty error', async () => {
        await api.put('/category').send({}).expect(400);
    });

    test('update category', async () => {
        const response = await api.get('/category');
        const id = response.body[0].id;

        const newCategory = { "name": "category1Modified" };
        await api.put('/category/' + id).send(newCategory).expect(200);

        const responseAfterUpdate = await api.get('/category');
        expect(responseAfterUpdate.body[0].name).toBe('category1Modified');
    });

    test('update category with error', async () => {
        const newCategory = { "name": "category1Modified" };
        await api.put('/category/' + 'noExist').send(newCategory).expect(400);
    });

    test('delete category', async () => {
        const response = await api.get('/category');
        const id = response.body[0].id;

        await api.delete('/category/' + id).expect(200);

        const responseAfterDelete = await api.get('/category');
        expect(responseAfterDelete.body).toHaveLength(response.body.length - 1);
    });

    test('delete category with error', async () => {
        const response = await api.get('/category');
        const id = response.body[0].id;
        jest.spyOn(CategoryModel, 'findByIdAndDelete').mockRejectedValueOnce(1);
        await api.delete('/category/' + id).expect(400);
    });

    test('update category with wrong id', async () => {
        const newCategory = { "name": "category1Modified" };
        const id = 1;
        jest.spyOn(CategoryModel, 'findById').mockResolvedValue(null);
        await api.put('/category/' + id).send(newCategory).expect(400);
    });

    test('delete category with wrong id', async () => {
        const response = await api.get('/category');
        const id = response.body[0].id;
        jest.spyOn(CategoryModel, 'findById').mockResolvedValue(null);
        await api.delete('/category/' + id).expect(400);
    });


    test('delete category with game', async () => {
        const response = await api.get('/category');
        const id = response.body[0].id;
        jest.spyOn(GameModel, 'find').mockResolvedValue([1]);
        await api.delete('/category/' + id).expect(400);
    });
});

afterAll(() => {
    server.close();
    mongoose.connection.close();
});