import { z } from "zod";

export const pollOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1, "optionRequired").max(200, "optionMaxLength"),
});

export const createPollSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(3, "questionMinLength")
      .max(500, "questionMaxLength"),
    isPublished: z.boolean().default(false),
    options: z
      .array(pollOptionSchema)
      .min(2, "optionsMin")
      .max(10, "optionsMax"),
  })
  .superRefine((poll, context) => {
    const normalizedOptions = poll.options.map((option) =>
      option.text.toLocaleLowerCase(),
    );

    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      context.addIssue({
        code: "custom",
        message: "optionsUnique",
        path: ["options"],
      });
    }
  });

export const updatePollSchema = createPollSchema.extend({
  id: z.string().min(1),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
export type PollOptionInput = z.infer<typeof pollOptionSchema>;
