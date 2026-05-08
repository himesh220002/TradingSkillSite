import { z } from 'zod';

export const createBatchSchema = z.object({
  body: z.object({
    batchName: z.string().min(3, "Batch name must be at least 3 characters"),
    courseId: z.string().min(1, "Course selection is required"),
    syllabus: z.array(z.object({
      topic: z.string().min(1, "Topic title is required"),
      sectionName: z.string().optional(),
      subtopics: z.array(z.string()).optional()
    })).optional()
  })
});

export const enrollStudentSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required")
  }),
  params: z.object({
    id: z.string().min(1, "Batch ID is required")
  })
});

export const switchStudentSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    fromBatchId: z.string().min(1, "Source batch ID is required"),
    toBatchId: z.string().min(1, "Destination batch ID is required")
  })
});
