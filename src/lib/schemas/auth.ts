
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[a-z]/, { message: 'Password must contain a lowercase letter.' })
      .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain a number.' }),
    confirmPassword: z.string(),
    role: z.enum(['student', 'rto', 'provider']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });
