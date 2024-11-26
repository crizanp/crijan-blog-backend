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
    // Fetch all posts and project only the tags field
    const posts = await Post.find({}, 'tags');

    // Use a Set to store unique tags
    const tagsSet = new Set();

    posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    // Convert Set back to an array
    const uniqueTags = Array.from(tagsSet);

    res.status(200).json(uniqueTags);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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