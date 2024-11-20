const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Ensure the path to your Post model is correct

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login'); // Adjust the redirect to your login route
}

// Get user's dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id });
        res.render('dashboard', { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add post
router.post('/add', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    try {
        const post = new Post({ title, content, author: req.user._id });
        await post.save();
        res.redirect('/posts/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

// Edit post - GET route
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).send('Post not found');
        }
        res.render('edit', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Edit post - POST route
router.post('/edit/:id', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).send('Post not found');
        }
        post.title = title;
        post.content = content;
        await post.save();
        res.redirect('/posts/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating post');
    }
});

// Delete post
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).send('Post not found');
        }
        await post.remove();
        res.redirect('/posts/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
});

module.exports = router;