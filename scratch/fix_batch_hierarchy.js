const fixBatch = async () => {
  const batchId = '69fdbaf789ce51284d91d989';
  const courseId = '69fcd560e3c5db4170a29c96';

  try {
    // 1. Fetch the course to get the correct hierarchy
    const courseRes = await fetch(`http://localhost:5000/api/courses/${courseId}`);
    const course = await courseRes.json();

    // 2. Map existing subtopics to their parent sections
    const newTopicProgress = [];
    course.curriculum.forEach(section => {
      section.lessons.forEach(lesson => {
        newTopicProgress.push({
          topicId: lesson._id,
          name: lesson.title,
          sectionName: section.title,
          isCompleted: false
        });
      });
    });

    // 3. Update the batch with the new hierarchical structure
    const updateRes = await fetch(`http://localhost:5000/api/batches/${batchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicProgress: newTopicProgress })
    });
    const result = await updateRes.json();
    console.log('Batch hierarchy fixed:', result.batchName);
  } catch (err) {
    console.error('Failed to fix batch:', err);
  }
};

fixBatch();
