const Semester = require('../models/Semester');

//1 Get all semesters
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find({});
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//2 Get semester by name
exports.getSemesterByName = async (req, res) => {
  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${req.params.semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//3 Get subjects by semester name
exports.getSubjectsBySemesterName = async (req, res) => {
  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${req.params.semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    // Return all fields for each subject except 'content'
    const subjectsWithoutContent = semester.subjects.map(subject => {
      const subjectObj = subject.toObject ? subject.toObject() : {...subject};
      delete subjectObj.content;
      return subjectObj;
    });
    
    res.status(200).json(subjectsWithoutContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//4 Add a new semester
exports.addSemester = async (req, res) => {
  const { name } = req.body;
  try {
    const newSemester = new Semester({ name });
    await newSemester.save();
    res.status(201).json(newSemester);
  } catch (error) {
    res.status(400).json({ message: 'Error creating semester' });
  }
};

//5 Add a new subject to a specific semester
exports.addSubjectToSemester = async (req, res) => {
  const { semesterName } = req.params;
  const { subjectName } = req.body;

  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Check if subject already exists
    const subjectExists = semester.subjects.some(sub => sub.name === subjectName);
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists in this semester' });
    }

    // Add new subject to semester
    semester.subjects.push({ name: subjectName, posts: [] });

    // Save the updated semester
    await semester.save();
    res.status(201).json({ message: 'Subject added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//6 Add post to subject within a specific semester
exports.addPostToSubject = async (req, res) => {
  const { semesterName, subjectName } = req.params;
  const { title, content } = req.body;

  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Find subject by name
    const subject = semester.subjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Add new post to subject
    subject.posts.push({ title, content });

    // Save updated semester
    await semester.save();
    res.status(201).json({ message: 'Post added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/// Edit a post within a subject in a specific semester using slug
exports.editPostInSubject = async (req, res) => {
  const { semesterName, subjectName, slug } = req.params;  // Now accepting slug
  const { title, content } = req.body;

  try {
    // Find the semester by name
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Find the subject by name
    const subject = semester.subjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Find the post by slug
    const post = subject.posts.find(post => post.slug === slug);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Update the post title and content
    post.title = title;
    post.content = content;

    // Save the updated semester with the modified post
    await semester.save();
    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a post within a subject in a specific semester by post ID
exports.deletePostInSubject = async (req, res) => {
  const { semesterId, subjectId, postId } = req.params;

  try {
    // Find the semester by ID
    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Find the subject by ID within the semester
    const subject = semester.subjects.id(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Find the post by ID
    const postIndex = subject.posts.findIndex(post => post._id.toString() === postId);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove the post
    subject.posts.splice(postIndex, 1);

    // Save the updated semester
    await semester.save();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//9 Get posts by subject
exports.getPostsBySubject = async (req, res) => {
  const { semesterName, subjectName } = req.params;
  
  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    
    const subject = semester.subjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Map posts to include trimmed content (first 30 words)
    const simplifiedPosts = subject.posts.map(post => ({
      title: post.title,
      _id: post._id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      slug: post.slug,
      content: post.content.split(/\s+/).slice(0, 30).join(' ') + '...' // Get first 30 words
    }));

    res.json(simplifiedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//10 Get post by slug
exports.getPostBySlug = async (req, res) => {
  const { semesterName, subjectName, postSlug } = req.params;

  try {
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    const subject = semester.subjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const post = subject.posts.find(post => post.slug === postSlug);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// 11. Delete a subject within a specific semester
exports.deleteSubject = async (req, res) => {
  const { semesterName, subjectName } = req.params;

  try {
    // Find the semester by its name
    const semester = await Semester.findOne({ name: new RegExp(`^${semesterName}$`, 'i') });
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Find the subject by name
    const subjectIndex = semester.subjects.findIndex(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Remove the subject from the subjects array
    semester.subjects.splice(subjectIndex, 1);

    // Save the updated semester
    await semester.save();
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
//12 Ensure `updateSemester` function is defined and exported in semesterController.js
exports.updateSemester = async (req, res) => {
  const { name } = req.body;
  try {
    const updatedSemester = await Semester.findOneAndUpdate(
      { name: req.params.semesterName },
      { name },
      { new: true, runValidators: true }
    );
    if (!updatedSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ message: 'Error updating semester' });
  }
};

//13 Delete a semester
exports.deleteSemester = async (req, res) => {
  try {
    const deletedSemester = await Semester.findOneAndDelete({ name: req.params.semesterName });
    if (!deletedSemester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(200).json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
