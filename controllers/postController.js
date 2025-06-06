const Post = require('../models/Post');
const Category = require('../models/Category');

// Controller for fetching all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getCategoryPostTitles = async (req, res) => {
  const categoryParam = req.params.category;
  
  try {
    // Convert URL parameter to space-separated format
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
      'title slug imageUrl tags' // Include necessary fields
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
// Controller for fetching a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('category');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for creating a new post
exports.createPost = async (req, res) => {
  const { title, content, imageUrl, slug, category, tags } = req.body;
  try {
    const newPost = new Post({
      title,
      content,
      imageUrl,
      slug,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()) // Ensure tags are stored as an array
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: 'Error creating post' });
  }
};

// Controller for updating a post by ID
exports.updatePost = async (req, res) => {
  const { title, content, imageUrl, slug, category, tags } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        imageUrl,
        slug,
        category,
        tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())
      },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error updating post' });
  }
};

// Controller for deleting a post by ID
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller for fetching all unique tags
exports.getAllTags = async (req, res) => {
  try {
    console.log("Fetching all unique tags...");

    // Use MongoDB Aggregation to get unique tags from the posts
    const uniqueTags = await Post.aggregate([
      { $unwind: "$tags" }, // Unwind tags array to process each tag separately
      { $match: { tags: { $ne: null } } }, // Filter out null or empty tags
      { $group: { _id: "$tags" } }, // Group by tag and get unique tags
      { $sort: { _id: 1 } }, // Sort tags alphabetically
    ]);

    // Map the result to get only tag names
    const tags = uniqueTags.map(tag => tag._id);

    console.log(`Fetched ${tags.length} unique tags.`);

    // Return the unique tags in the response
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching unique tags:', error);
    res.status(500).json({ message: 'Server error while fetching unique tags', error: error.message });
  }
};

exports.getPostsByCategory = async (req, res) => {
  const categoryName = req.params.category; // Get the category from the URL

  try {
    // Step 1: Find the category by its slug (or name if you prefer)
    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${categoryName.replace(/-/g, ' ')}`, 'i') }, // Convert 'telegram-api' to 'telegram api' for matching
    });

    if (!category) {
      return res.status(404).json({ message: `Category '${categoryName}' not found` });
    }

    // Step 2: Find posts that belong to the category's ID
    const posts = await Post.find({ category: category._id });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: `No posts found in category '${categoryName}'` });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    res.status(500).json({ message: 'Server error while fetching posts by category', error: error.message });
  }
};
// Controller for fetching a post by its slug
exports.getPostBySlug = async (req, res) => {
  const { slug } = req.params; // Get the slug from the URL

  try {
    // Find the post by its slug
    const post = await Post.findOne({ slug: slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getPostsByTag = async (req, res) => {
  const tagName = req.params.tag; // Get the tag from the URL

  try {
    // Find posts that contain the specified tag
    const posts = await Post.find({
      tags: { $regex: new RegExp(`^${tagName}$`, 'i') } // Use regex for case-insensitive match
    });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: `No posts found for tag '${tagName}'` });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    res.status(500).json({ message: 'Server error while fetching posts by tag', error: error.message });
  }
};
// Controller for fetching consolidated blog data by slug
exports.getBlogData = async (req, res) => {
  const { slug } = req.params; // Get the slug from the URL

  try {
    // Fetch the main post by its slug
    const post = await Post.findOne({ slug }).populate("category");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch the latest posts (limit to 5)
    const latestPosts = await Post.find().sort({ createdAt: -1 }).limit(5);

    // Fetch similar posts by category, excluding the current post
    const similarPosts = await Post.find({
      category: post.category._id,
      slug: { $ne: slug },
    })
      .sort({ createdAt: -1 })
      .limit(2);

    // Fetch all categories
    const categories = await Category.find();

    // Fetch all unique tags
    const postsWithTags = await Post.find({}, "tags");
    const tagsSet = new Set();
    postsWithTags.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    const uniqueTags = Array.from(tagsSet);

    // Consolidated response
    res.status(200).json({
      post,
      latestPosts,
      similarPosts,
      categories,
      tags: uniqueTags,
    });
  } catch (error) {
    console.error("Error fetching blog data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};