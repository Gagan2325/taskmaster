const express = require('express');
const router = express.Router();
const Project = require('../model/projectSchema');


router.post('/add', async(req, res) => {

    if (!req.body.projectName || !req.body.des) {
        return res.status(400).json({ success: false, error: 'Project name and description are required' });
    }

    try {
        // Create new project
        const project = new Project({
            projectName: req.body.projectName,
            des: req.body.des,
            createdBy: req.user._id
        });
        // Save the project to the database
        const projectInfo = await project.save();
        res.json({ success: true, msg: "Project created successfully", projectInfo });
    } catch (error) {
        console.error('Project creation error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }

});

router.patch('/edit/:id', async(req, res) => {

    if(req.params.id.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID' });
    }

    const projectInfo = await Project.find({_id:req.params.id, createdBy:req.user._id});

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }


    if (!req.body.projectName && !req.body.des) {
        return res.status(400).json({ success: false, error: 'At least one field (project name or description) is required to update' });
    }

    try {
        // Find project by ID and update
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedProject) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }
        res.json({ success: true, msg: "Project updated successfully", updatedProject });
    } catch (error) {
        console.error('Project update error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }       

});

router.get('/info/:id', async(req, res) => {

    if(req.params.id.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID' });
    }

    const projectInfo = await Project.find({_id:req.params.id}).select("-createdBy -updatedAt -__v");

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    try {
        // Find project by ID and update
        res.json({ success: true, msg: "Project Info", projectInfo });
    } catch (error) {
        console.error('Project  error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }       

});

router.get('/listbyuser', async(req, res) => {
    const projectInfo = await Project.find({createdBy:req.user._id}).select("-createdBy -updatedAt -__v");

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    try {
        // Find project by ID and update
        res.json({ success: true, msg: "Project list", list: projectInfo });
    } catch (error) {
        console.error('Project  error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }       

});

router.get('/list', async(req, res) => {
    const projectInfo = (await Project.find({}).select("-updatedAt -__v").populate('createdBy', 'name email -_id"'));

    if (projectInfo.length === 0) {
        return res.status(404).json({ success: false, error: 'No projects found' });
    }
    try {
        // Find project by ID and update
        res.json({ success: true, msg: "Project list", list: projectInfo });
    } catch (error) {
        console.error('Project  error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }       

});

router.delete('/delete/:id', async(req, res) => {

    if(req.params.id.length!=24){
        return res.status(400).json({ success: false, error: 'Invalid project ID' });
    }   
    const projectInfo = await Project.findOne({_id:req.params.id, createdBy:req.user._id});

    if (!projectInfo) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }
    try {
        // Find project by ID and delete
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, msg: "Project deleted successfully" });
    } catch (error) {
        console.error('Project deletion error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});




module.exports = router;