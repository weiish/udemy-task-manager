const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../src/models/user')

const userID = new mongoose.Types.ObjectId()
const goodUserData = {
    _id: userID,
    name: "Test1",
    email: "test1@email.com",
    password: "test123!",
    tokens: [{
        token: jwt.sign({ _id: userID }, process.env.JWT_SECRET)
    }]
}

beforeEach( async () => {
    await User.deleteMany()
    await User(goodUserData).save()
})

test('Create user', async () => {
    await request(app).post('/users').send({
        name: "Wei",
        email: "shixwei@gmail.com",
        password: "abc123!@#"
    }).expect(201)
})

test('Successful login to app', async () => {
    await request(app).post('/users/login').send({
        email: goodUserData.email,
        password: goodUserData.password
    }).expect(200)
})

test('Failed login to app', async () => {
    await request(app).post('/users/login').send({
        email: 'asdf@asdf.com',
        password: 'asdfasdf'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${goodUserData.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should FAIL to get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for USER', async() => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${goodUserData.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should NOT delete account for unauthenticated USER', async() => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

