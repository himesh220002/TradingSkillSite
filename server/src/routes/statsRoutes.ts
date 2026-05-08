import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';

const router = express.Router();

router.get('/overview', async (req, res) => {
  try {
    // 1. Total Students
    const totalStudents = await User.countDocuments({ role: 'student' });

    // 2. Active Courses
    const activeCourses = await Course.countDocuments({ isArchived: false });

    // 3. Batches with populated course data for revenue/progress
    const allBatches = await Batch.find().populate('courseId', 'price title');
    
    // 4. Calculate Total Revenue & Avg Completion
    let totalRevenue = 0;
    let totalProgress = 0;
    const courseStatsMap: Record<string, { name: string; students: number }> = {};

    allBatches.forEach((batch: any) => {
      const course = batch.courseId;
      const studentCount = batch.students?.length || 0;
      
      // Revenue (estimate)
      if (course && typeof course.price === 'number') {
        totalRevenue += course.price * studentCount;
      }

      // Progress
      totalProgress += batch.progressPercentage || 0;

      // Track Top Courses
      if (course && course._id) {
        const cId = course._id.toString();
        if (!courseStatsMap[cId]) {
          courseStatsMap[cId] = { name: course.title || 'Unknown Course', students: 0 };
        }
        const current = courseStatsMap[cId];
        if (current) {
          current.students += studentCount;
        }
      }
    });

    const avgCompletion = allBatches.length > 0 ? Math.round(totalProgress / allBatches.length) : 0;

    // 5. Format Top Courses
    const topCourses = Object.values(courseStatsMap)
      .sort((a, b) => b.students - a.students)
      .slice(0, 3)
      .map(c => ({
        name: c.name,
        students: c.students,
        growth: '+10%' // Static for now
      }));

    res.json({
      stats: [
        { name: 'Total Students', value: totalStudents.toLocaleString(), change: '+5%', trending: 'up' },
        { name: 'Active Courses', value: activeCourses.toString(), change: '+1', trending: 'up' },
        { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12%', trending: 'up' },
        { name: 'Completion Rate', value: `${avgCompletion}%`, change: '+2%', trending: 'up' },
      ],
      topCourses
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
});

export default router;
