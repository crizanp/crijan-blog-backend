const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { getCategoryPostTitles } = require('../controllers/postController');

// Define the routes
router.get('/', getCategories);              // GET all categories
router.get('/:id', getCategoryById);         // GET a specific category by ID
router.post('/', createCategory);            // POST create a new category
router.put('/:id', updateCategory);          // PUT update a category by ID
router.delete('/:id', deleteCategory);       // DELETE a category by ID
router.get('/:category/titles', getCategoryPostTitles);

module.exports = router;
