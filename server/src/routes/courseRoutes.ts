import express from 'express';
import Course from '../models/Course.js';

const router = express.Router();

// Get all courses (excluding archived)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isArchived: { $ne: true } }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error });
  }
});

// Admin: Create course
router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error });
  }
});

// Admin: Update course
router.put('/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating course', error });
  }
});

// Admin: Archive course (replaces Delete)
router.delete('/:id', async (req, res) => {
  try {
    const archivedCourse = await Course.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    if (!archivedCourse) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course archived successfully', course: archivedCourse });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving course', error });
  }
});

// Update a specific lesson's content (notes, video, methods etc)
router.patch('/:courseId/lessons/:sectionIndex/:lessonIndex', async (req, res) => {
  try {
    const { courseId, sectionIndex, lessonIndex } = req.params;
    const sIdx = parseInt(sectionIndex);
    const lIdx = parseInt(lessonIndex);
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.curriculum[sIdx]) return res.status(404).json({ message: 'Section not found' });
    if (!course.curriculum[sIdx].lessons[lIdx]) return res.status(404).json({ message: 'Lesson not found' });

    const { notes, contentBlocks, videoUrl, liveClassUrl, methods, practiceQuestions, resources, faqs } = req.body;
    const lesson = course.curriculum[sIdx].lessons[lIdx] as any;
    if (notes !== undefined) lesson.notes = notes;
    if (contentBlocks !== undefined) lesson.contentBlocks = contentBlocks;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (liveClassUrl !== undefined) lesson.liveClassUrl = liveClassUrl;
    if (methods !== undefined) lesson.methods = methods;
    if (practiceQuestions !== undefined) lesson.practiceQuestions = practiceQuestions;
    if (resources !== undefined) lesson.resources = resources;
    if (faqs !== undefined) lesson.faqs = faqs;

    course.markModified('curriculum');
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'Error updating lesson content', error });
  }
});

export default router;

