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

    // 3. Batches with populated course and student data
    const allBatches = await Batch.find()
      .populate('courseId', 'price discountPrice title')
      .populate('students', 'username name createdAt');
    
    // 4. Calculate Total Revenue & Avg Completion
    let totalRevenue = 0;
    let totalProgress = 0;
    const courseStatsMap: Record<string, { name: string; students: number }> = {};
    const dailyStats: Record<string, { total: number; min: number; max: number; courses: Record<string, { name: string; amount: number; batches: Record<string, number> }> }> = {};

    allBatches.forEach((batch: any) => {
      const course = batch.courseId;
      const students = batch.students || [];
      const studentCount = students.length || batch.studentCount || 0;
      
      const price = course ? (course.discountPrice || course.price || 0) : 0;
      totalRevenue += price * studentCount;
      totalProgress += batch.progressPercentage || 0;

      // Track Top Courses
      if (course && course._id) {
        const cId = course._id.toString();
        if (!courseStatsMap[cId]) {
          courseStatsMap[cId] = { name: course.title || 'Unknown Course', students: 0 };
        }
        const current = courseStatsMap[cId];
        if (current) current.students += studentCount;
      }

      // Daily Distribution based on Student Joining Date
      students.forEach((student: any) => {
        const joinDate = student.createdAt || batch.createdAt || new Date();
        const dateKey = new Date(joinDate).toISOString().split('T')[0] || 'Unknown';
        
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { total: 0, min: 0, max: 0, courses: {} };
        }
        
        const dayStat = dailyStats[dateKey];
        if (dayStat) {
          dayStat.total += price;
          
          if (course) {
            const courseId = course._id.toString();
            if (!dayStat.courses[courseId]) {
              dayStat.courses[courseId] = { name: course.title, amount: 0, batches: {} };
            }
            const courseStat = dayStat.courses[courseId];
            if (courseStat) {
              courseStat.amount += price;
              
              const batchName = batch.batchName || 'Unknown Batch';
              courseStat.batches[batchName] = (courseStat.batches[batchName] || 0) + 1;
            }
          }
        }
      });
    });

    // Calculate min/max daily potential based on batch-level signup volume
    Object.values(dailyStats).forEach(day => {
      const batchAmounts = Object.values(day.courses).flatMap(c => Object.values(c.batches).map(count => count * (totalRevenue / totalStudents || 0))); // Rough estimate
      day.min = batchAmounts.length > 0 ? Math.min(...batchAmounts) : 0;
      day.max = batchAmounts.length > 0 ? Math.max(...batchAmounts) : 0;
    });

    const avgCompletion = allBatches.length > 0 ? Math.round(totalProgress / allBatches.length) : 0;

    // Convert aggregated object to sorted array
    const revenueData = Object.entries(dailyStats)
      .map(([date, stats]) => ({ 
        date, 
        amount: stats.total,
        min: stats.min,
        max: stats.max,
        courses: Object.values(stats.courses).map(c => ({
          name: c.name,
          amount: c.amount,
          batchBreakdown: Object.entries(c.batches).map(([name, count]) => `${name}: ${count}`).join(', ')
        }))
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Format Top Courses
    const topCourses = Object.values(courseStatsMap)
      .sort((a, b) => b.students - a.students)
      .slice(0, 3)
      .map(c => ({
        name: c.name,
        students: c.students,
        growth: '+10%'
      }));

    // Recent Activity with REAL student names
    const recentActivity = allBatches
      .flatMap((b: any) => (b.students || []).map((s: any) => ({
        studentName: s.name || s.username || 'New Student',
        courseName: b.courseId?.title || 'Unknown',
        batchName: b.batchName,
        date: s.createdAt || b.createdAt,
        status: 'Enrolled'
      })))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    res.json({
      stats: [
        { name: 'Total Students', value: totalStudents.toLocaleString(), change: '+5%', trending: 'up' },
        { name: 'Active Courses', value: activeCourses.toString(), change: '+1', trending: 'up' },
        { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12%', trending: 'up' },
        { name: 'Completion Rate', value: `${avgCompletion}%`, change: '+2%', trending: 'up' },
      ],
      topCourses,
      revenueData,
      recentActivity,
      batchSummary: allBatches.map((b: any) => ({
        name: b.batchName,
        students: b.students?.length || 0,
        course: b.courseId?.title
      }))
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
});

export default router;
