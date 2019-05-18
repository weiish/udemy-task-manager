const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')

const taskRouter = new express.Router()

//CREATE NEW TASK
taskRouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) { 
        res.status(400).send(e)
    }
})

//GET ALL TASKS OF USER
// After lesson 119 we are editing this to filter the data to get exactly what we want
taskRouter.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sortBy = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        for (var i = 0; i < parts.length; i+=2) {
            sortBy[parts[i]] = parts[i+1] === 'desc' ? -1 : 1
        }
    }
    
    try {
        // //Method 1
        // const tasks = await Task.find({ owner: req.user._id})
        // res.status(200).send(tasks)

        //Method 2
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sortBy
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET SPECIFIC TASK
taskRouter.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send("Task not found")
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

// UPDATE SPECIFIC TASK
taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update) => {
        allowedUpdates.includes(update)
    })

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            res.status(404).send("Task not found")
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        //Replaced below code with the above because findByIdAndUpdate bypasses middleware of save() during which we hash the password
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE SPECIFIC TASK
taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = taskRouter