const Category = require('../models/Category');

// Controller for fetching all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getCategoryPostTitles = async (req, res) => {
  try {
    const categoryParam = req.params.category;
    
    // Convert hyphen-separated parameter to space-separated
    const categoryName = categoryParam.replace(/-/g, ' ');
    
    // Case-insensitive search with exact match
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    });

    if (!category) {
      return res.status(404).json({ 
        message: `Category '${categoryName}' not found` 
      });
    }

    const posts = await Post.find(
      { category: category._id },
      'title slug imageUrl tags'
    ).lean();

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching category titles:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
// Controller for fetching a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for creating a new category
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category' });
  }
};

// Controller for updating a category by ID
exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category' });
  }
};

// Controller for deleting a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
