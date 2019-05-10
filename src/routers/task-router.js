const express = require('express')
const Task = require('../models/task')

const taskRouter = new express.Router()

taskRouter.post('/tasks', async (req, res) => {
    const task = new Task(req.body)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) { 
        res.status(400).send(e)
    }
})

taskRouter.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.status(200).send(tasks)
    } catch (e) {
        res.status(400).send(e)
    }
})

taskRouter.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send("Task not found")
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

taskRouter.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update) => {
        allowedUpdates.includes(update)
    })

    try {
        const task = await Task.findById(_id)
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        //Replaced below code with the above because findByIdAndUpdate bypasses middleware of save() during which we hash the password
        //const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if (!task) {
            res.status(404).send("Task not found")
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//DELETE
taskRouter.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = taskRouter