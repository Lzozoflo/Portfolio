import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(32).regex(/^\w+$/, 'Alphanumeric and underscores only'),
    password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain upper, lower and digit')
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
