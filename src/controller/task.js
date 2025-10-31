const express = require('express');
const router = express.Router();
const Task = require('../model/taskScema');
const Project = require('../model/projectSchema');
const User = require('../model/userSchema');


router.post('/add', async(req, res) => {
    if (!req.body.projectId || !req.body.taskName || !req.body.des || !req.body.createdFor) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if(req.body.projectId.length!=24 || req.body.createdFor.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID or createdFor ID' });
    }
    if (req.body.taskName.length < 3) {
        return res.status(400).json({ success: false, error: 'Task name must be at least 3 characters long' });
    }
    
    if (req.body.des.length < 10) {
        return res.status(400).json({ success: false, error: 'Description must be at least 10 characters long' });
    }

    if(req.body.createdFor==req.user._id.toString()){
        return res.status(400).json({ success: false, error: 'Task cannot be assigned to yourself' });
    }

    if(req.user.role==='2'){
        return res.status(403).json({ success: false, error: 'Insufficient permissions to create a task' });
    }

    const projectInfo = await Project.findById(req.body.projectId);

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const userInfo = await User.findById(req.body.createdFor);  

    if (!userInfo) {
        return res.status(404).json({ success: false, error: 'User to whom task is assigned not found' });
    }   

    try {
        // Create new task
        const task = new Task({
            projectId: req.body.projectId,
            taskName: req.body.taskName,
            des: req.body.des,
            createdBy: req.user._id,
            createdFor: req.body.createdFor
        });
        // Save the task to the database
        const taskInfo = await task.save();
        res.json({ success: true, msg: "Task created successfully", taskInfo });
    } catch (error) {
        console.error('Task creation error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }


});

router.get('/all/:projectId', async(req, res) => {

    if(req.params.projectId.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID' });
    }

    const projectInfo = await Project.findById(req.params.projectId);

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }


    try { 
        const tasks = await Task.find({ projectId: req.params.projectId }).populate('createdBy', 'name email').populate('createdFor', 'name email');
        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Fetch tasks error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/allbyuser', async(req, res) => {

    try { 
        const tasks = await Task.find({createdFor: req.user._id }).populate('createdBy', 'name email').populate('createdFor', 'name email').populate('projectId', 'projectName des');
        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Fetch tasks error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:taskId', async(req, res) => {

    if(req.params.taskId.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }

    try {
        const taskInfo = await Task.findById(req.params.taskId).populate('createdBy', 'name email').populate('createdFor', 'name email').select('-__v');
        if (!taskInfo) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        res.json({ success: true, taskInfo });
    } catch (error) {
        console.error('Fetch task error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/statusUpdate/:taskId', async (req, res) => {
    // Validate task ID format
    if (req.params.taskId.length !== 24) {
        return res.status(400).json({ success: false, error: 'Invalid task ID format' });
    }

    try {
        // Check if task exists and belongs to the current user
        const taskInfo = await Task.findOne({ 
            _id: req.params.taskId, 
            createdFor: req.user._id 
        });

        if (!taskInfo) {
            return res.status(404).json({ 
                success: false, 
                error: 'Task not found or you are not authorized to update this task' 
            });
        }

        // Define allowed fields for update
        const allowedFields = ['taskStatus', 'remarks'];
        const updateData = {};
        
        // Validate and filter request body
        for (const field in req.body) {
            if (allowedFields.includes(field)) {
                updateData[field] = req.body[field];
            }
        }
        
        // Check if there are valid fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: `No valid fields provided. Allowed fields: ${allowedFields.join(', ')}` 
            });
        }

        // Additional validation for taskStatus if provided
        if (updateData.taskStatus) {
            const validStatuses = ['pending', 'in-progress', 'completed'];
            if (!validStatuses.includes(updateData.taskStatus)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid task status. Allowed values: ${validStatuses.join(', ')}`
                });
            }
        }

        // Update the task with validation
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        ).select('taskName taskStatus remarks updatedAt');

        if (!updatedTask) {
            return res.status(404).json({ 
                success: false, 
                error: 'Failed to update task' 
            });
        }

        res.json({ 
            success: true, 
            msg: "Task status updated successfully", 
            updatedTask 
        });
    
    } catch (error) {
        console.error('Task status update error:', error.message);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error while updating task status' 
        });
    }
})

router.put('/:taskId',async(req, res)=>{

    if (req.params.taskId.length !== 24) {
        return res.status(400).json({ success: false, error: 'Invalid task ID format' });
    }

       if (!req.body.projectId || !req.body.taskName || !req.body.des || !req.body.createdFor) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    if(req.body.projectId.length!=24 || req.body.createdFor.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID or createdFor ID' });
    }
    if (req.body.taskName.length < 3) {
        return res.status(400).json({ success: false, error: 'Task name must be at least 3 characters long' });
    }
    
    if (req.body.des.length < 10) {
        return res.status(400).json({ success: false, error: 'Description must be at least 10 characters long' });
    }

    if(req.body.createdFor==req.user._id.toString()){
        return res.status(400).json({ success: false, error: 'Task cannot be assigned to yourself' });
    }

    if(req.user.role==='2'){
        return res.status(403).json({ success: false, error: 'Insufficient permissions to create a task' });
    }

    const projectInfo = await Project.findById(req.body.projectId);

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const userInfo = await User.findById(req.body.createdFor);  

    if (!userInfo) {
        return res.status(404).json({ success: false, error: 'User to whom task is assigned not found' });
    } 

    try {
        // Check if task exists and belongs to the current user
        const taskInfo = await Task.findOne({ 
            _id: req.params.taskId, 
            createdBy: req.user._id 
        });

        if (!taskInfo) {
            return res.status(404).json({ 
                success: false, 
                error: 'Task not found or you are not authorized to update this task' 
            });
        }

        // Define allowed fields for update
        const allowedFields = ['taskName','taskStatus', 'remarks','des','projectId','createdFor'];
        const updateData = {};
        
        // Validate and filter request body
        for (const field in req.body) {
            if (allowedFields.includes(field)) {
                updateData[field] = req.body[field];
            }
        }
        
        // Check if there are valid fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: `No valid fields provided. Allowed fields: ${allowedFields.join(', ')}` 
            });
        }

        // Additional validation for taskStatus if provided
        if (updateData.taskStatus) {
            const validStatuses = ['pending', 'in-progress', 'completed'];
            if (!validStatuses.includes(updateData.taskStatus)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid task status. Allowed values: ${validStatuses.join(', ')}`
                });
            }
        }

        // Update the task with validation
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.taskId,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        ).select('taskName taskStatus remarks updatedAt');

        if (!updatedTask) {
            return res.status(404).json({ 
                success: false, 
                error: 'Failed to update task' 
            });
        }

        res.json({ 
            success: true, 
            msg: "Task updated successfully", 
            updatedTask 
        });
    
    } catch (error) {
        console.error('Task update error:', error.message);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error while updating task status' 
        });
    }

})


router.delete('/:taskId', async(req, res) => {

    if(req.params.taskId.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }
    try {
        const taskInfo = await Task.findById(req.params.taskId);
        if (!taskInfo) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }
        if (taskInfo.createdBy.toString() !== req.user._id.toString() && req.user.role !== '2') {
            return res.status(403).json({ success: false, error: 'Insufficient permissions to delete this task' });
        }
        await Task.findByIdAndDelete(req.params.taskId);
        res.json({ success: true, msg: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});






module.exports = router;