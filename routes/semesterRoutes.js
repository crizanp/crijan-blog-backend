const express = require('express');
const router = express.Router();
const {
  getSemesters,
  getSemesterByName,
  getSubjectsBySemesterName,
  addSemester,
  addSubjectToSemester,
  updateSemester,  // Ensure updateSemester is imported
  deleteSemester,
  addPostToSubject,
  editPostInSubject,
  deletePostInSubject,
  getPostsBySubject,
  getPostBySlug,
  deleteSubject
} = require('../controllers/semesterController');

// Semester routes
router.get('/', getSemesters); // Get all semesters
router.get('/:semesterName', getSemesterByName); // Get semester by name
router.get('/:semesterName/subjects', getSubjectsBySemesterName); // Get subjects by semester name

// Add, edit, delete semester
router.post('/', addSemester); // Add new semester
router.put('/:semesterName', updateSemester); // Update a semester
router.delete('/:semesterName', deleteSemester); // Delete a semester

// Add subject to a semester
router.post('/:semesterName/subject', addSubjectToSemester); // Add new subject to semester
router.delete('/:semesterName/subject/:subjectName', deleteSubject); // Delete a subject from semester

// Post routes
router.post('/:semesterName/subjects/:subjectName', addPostToSubject);
router.put('/:semesterName/subjects/:subjectName/post/:slug', editPostInSubject);  // Change postId to slug
router.delete('/:semesterId/subjects/:subjectId/post/:postId', deletePostInSubject);
router.get('/:semesterName/subjects/:subjectName/posts', getPostsBySubject);
router.get('/:semesterName/subjects/:subjectName/posts/:postSlug', getPostBySlug);

module.exports = router;
