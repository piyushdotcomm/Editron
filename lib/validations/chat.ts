import { z } from "zod";

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 10_000;   // 10k chars per message
const MAX_PARTS = 20;
const MAX_PART_TEXT_LENGTH = 5_000;  // 5k chars per part

const PartSchema = z.object({
  text: z.string().max(MAX_PART_TEXT_LENGTH, {
    message: `Part text must not exceed ${MAX_PART_TEXT_LENGTH} characters`,
  }),
});

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(MAX_CONTENT_LENGTH, {
    message: `Message content must not exceed ${MAX_CONTENT_LENGTH} characters`,
  }),
  parts: z.array(PartSchema).max(MAX_PARTS).optional(),
});

export const ChatRequestSchema = z.object({
  messages: z
    .array(MessageSchema)
    .min(1, { message: "At least one message is required" })
    .max(MAX_MESSAGES, {
      message: `Cannot send more than ${MAX_MESSAGES} messages`,
    }),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;