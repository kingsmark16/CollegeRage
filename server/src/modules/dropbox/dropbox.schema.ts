import { z } from 'zod';

export const dropboxCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(16),
});
