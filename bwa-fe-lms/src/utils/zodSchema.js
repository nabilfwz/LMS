import z, { email } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(5),
});

export const signInSchema = signUpSchema.omit({ name: true });

export const createCourseSchema = z.object({
  name: z.string().min(5, { message: "Name must be at least 5 characters" }),
  categoryId: z.string().nonempty({ message: "Please select a category" }),
  tagline: z
    .string()
    .min(5, { message: "Tagline must be at least 5 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  thumbnail: z.custom((val) => val instanceof File, {
    message: "Thumbnail is required",
  }),
});

export const updateCourseSchema = createCourseSchema.partial({
  thumbnail: true,
});

export const mutateContentSchema = z
  .object({
    title: z.string().min(5),
    type: z.string().min(3, { message: "Type is required" }),
    youtubeId: z.string().optional(),
    text: z.string().optional()
  })
  .superRefine((val, ctx) => {
    const parseVideoId = z.string().min(4).safeParse(val.youtubeId);
    const parseText = z.string().min(4).safeParse(val.text);

    if (val.type === "video") {
      if (!parseVideoId.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Youtube ID is required",
          path: ["youtubeId"],
        });
      }
    }

    if (val.type === "text") {
      if (!parseText.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Content text is required",
          path: ["text"],
        });
      }
    }
  });

  export const createStudentSchema = z.object({
    name: z.string().min(5, { message: "Name must be at least 5 characters" }),
    email:z.string().email(),
    password:z.string().min(5),
    photo: z.custom((val) => val instanceof File, {
      message: "Thumbnail is required",
    }),
  });

  export const updateStudentSchema=createStudentSchema.omit({
    password:true,
    photo:true
  })

  export const addStudentCourseSchema = z.object({
    studentId: z.string().min(5),
  });
