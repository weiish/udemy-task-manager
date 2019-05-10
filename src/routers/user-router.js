const express = require('express')
const User = require('../models/user')

const userRouter = new express.Router()

//LOGIN
userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        console.log(token)
        res.status(200).send({user, token})
    } catch (e) {
        res.status(400).send(e)
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

//READ ALL
userRouter.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

//READ SPECIFIC
userRouter.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send("User not found")
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//UPDATE
userRouter.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send("Invalid update")
    }
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()
        //Replaced below code with above because the findByIdAndUpdate bypasses the save() middleware
        //const user = await User.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if (!user) {
            res.status(404).send("User not found")
        }
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE
userRouter.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = userRouter