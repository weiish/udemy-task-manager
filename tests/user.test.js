const request = require('supertest')
const app = require('../src/app')

test('App request: Create user', async () => {
    await request(app).post('/users').send({
        name: "Wei",
        email: "shixwei@gmail.com",
        password: "abc123!@#"
    }).expect(201)
})