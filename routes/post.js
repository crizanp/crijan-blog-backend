const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost, getBlogData,getAllTags,getPostsByCategory,getPostBySlug,getPostsByTag } = require('../controllers/postController');

// Define the routes
router.get('/', getPosts);              // GET all posts
router.get('/:id', getPostById);        // GET a specific post by ID
router.post('/', createPost);           // POST create a new post
router.put('/:id', updatePost);         // PUT update a post by ID
router.delete('/:id', deletePost);      // DELETE a post by ID
router.get('/category/:category', getPostsByCategory);
// New Route for fetching all unique tags
router.get('/tags', getAllTags);        // GET all unique tags
router.get('/tag/:tag', getPostsByTag);
router.get("/blogData/:slug", getBlogData);
router.get('/slug/:slug', getPostBySlug);

module.exports = router;
