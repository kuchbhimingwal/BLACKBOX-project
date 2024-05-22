import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6)
});
export const LogginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})
export const PostsSchema = z.object({
  title: z.string(),
  content: z.string(),
})
export const PostUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>;
export type Loggin = z.infer<typeof LogginSchema>;
export type Post = z.infer<typeof PostsSchema>;
export type Update = z.infer<typeof PostUpdateSchema>;