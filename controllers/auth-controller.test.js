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
  findByIdAndUpdate: jest.fn()
}));

const app = express();
app.use(express.json());
app.post('/login', authController.login);
let server

describe('Test Login Controller', () => {
  beforeAll(() => server = app.listen(3000))
  afterAll(() => server.close())

  const mockedUser = {
        _id: 'someUserId',
        email: 'test@example.com',
        password: 'hashedPassword',
        subscription: 'pro',
  };
  
  it('login returns status 200', async () => {
    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(response.status).toBe(200); 
  });

  it('login returns status 401 when user is not found', async () => {
    User.findOne.mockResolvedValue(undefined);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(response.status).toBe(401); 
   });
  
  it('login returns status 401 when password is incorrect', async () => {
    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(false);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(response.status).toBe(401); 
  });

  it('login returns token', async () => {
    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(response.body.token).toBe('mockedToken'); 
  });

  it('login returns user with email and subscription', async () => {
    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(response.body.user).toEqual({
            email: 'test@example.com',
            subscription: 'pro',
        }); 
  });
  
  it('login returns email and password as strings', async () => {
    User.findOne.mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');
    const response = await request(app).post('/login').send({ email: 'test@example.com', password: 'password123' });
    expect(typeof response.body.user.email).toBe('string');
    expect(typeof response.body.user.subscription).toBe('string'); 
    });
});
