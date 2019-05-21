const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')
const userRouter = new express.Router()

//PROFILE PICTURE UPLOAD
const avatarUpload = multer({
    //dest: 'avatars', 
    //By deleting dest, it causes multer to pass the file data to the callback as req.file
    limits: {
        fileSize: 1000000 // Limit of 1 MB
    },
    fileFilter(req, file, cb) { 
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        
        cb(undefined, true) // No error, allow the upload
        // cb(undefined, false) // No error, don't allow the upload
    }
})

//UPLOAD PROFILE PICTURE
userRouter.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    if (!req.file) {
        res.status(400).send()
    }
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//PROFILE PICTURE DELETE
userRouter.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//PROFILE PICTURE ACCESS BY ID
userRouter.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('Unable to find user')
        }
        res.set('Content-Type', 'image/png') //Content type is a VERY popular header to set, 
        //haven't had to use it yet because we've only been sending JSON and express automatically sets it to application/json type when we do that
        res.send(user.avatar)
    } catch (e) { 
        res.status(404).send({error: e.message})
    }
})


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
        sendWelcomeEmail(user.email, user.name)
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
        sendGoodbyeEmail(req.user.email, req.user.name)
        req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = userRouter