const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const userRouter = new express.Router()

//LOGIN
userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }   
})

//LOGOUT
userRouter.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logged out')
    } catch (e) {
        res.status(500).send('Error logging out')
    }
})

//LOGOUT ALL TOKENS
userRouter.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Logged out of all sessions')
    } catch (e) {
        res.status(500).send('Error logging out')
    }
})

//CREATE
//Sign up
userRouter.post('/users', async (req, res) => {
    const user = new User(req.body) //Pass the body user details to the constructor function
    try {
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    } catch (e) { 
        res.status(400).send(e)
    }
})

// //READ ALL
// userRouter.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({})
//         res.status(200).send(users)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

//READ PROFILE
userRouter.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// //READ SPECIFIC
// userRouter.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send("User not found")
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

//UPDATE
userRouter.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send("Invalid update")
    }
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE
userRouter.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = userRouter