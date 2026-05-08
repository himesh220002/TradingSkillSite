const updateLesson = async () => {
  const courseId = '69fcd560e3c5db4170a29c96';
  const sectionIndex = 0;
  const lessonIndex = 0;

  const content = {
    notes: "Welcome to the Options Trading Masterclass! In this introductory lesson, we will cover the foundational concepts of derivatives and why options are the ultimate tool for risk management. We'll explore the 'why' before the 'how'.",
    methods: "1. The 80/20 Rule in Trading: Focus on the 20% of setups that yield 80% of profits.\n2. Risk-First Logic: Always calculate your maximum loss before looking at potential gain.",
    practiceQuestions: [
      "What is the primary difference between a Stock and an Option?",
      "Why is 'Defined Risk' superior to 'Stop Losses' in volatile markets?"
    ],
    faqs: [
      { 
        question: "Do I need a large capital to start trading options?", 
        answer: "No, options allow you to control large positions with small capital (leverage), but discipline is required." 
      },
      { 
        question: "Is this course suitable for absolute beginners?", 
        answer: "Yes, we start from zero and build up to institutional-grade strategies." 
      }
    ],
    videoUrl: "https://www.youtube.com/watch?v=8XmI6_m6Irs", // Sample educational video
    resources: [
      { title: "Trading Terminology PDF", url: "https://example.com/terms.pdf", type: "pdf" }
    ]
  };

  try {
    const response = await fetch(`http://localhost:5000/api/courses/${courseId}/lessons/${sectionIndex}/${lessonIndex}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    const data = await response.json();
    console.log('Update Successful:', data);
  } catch (err) {
    console.error('Update Failed:', err);
  }
};

updateLesson();
