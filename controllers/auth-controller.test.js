import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authController from './auth-controller';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post('/login', authController.login);

describe('Login Controller', () => {
  it('should log in a user and return a token', async () => {
    const mockedUser = {
        _id: 'someUserId',
        email: 'test@example.com',
        password: 'hashedPassword',
        subscription: 'basic',
    };

    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');

    const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.token).toBe('mockedToken');
        expect(response.body.user).toEqual({
            email: 'test@example.com',
            subscription: 'basic',
        });
        expect(typeof response.body.user.email).toBe('string');
        expect(typeof response.body.user.subscription).toBe('string');  
  });
});