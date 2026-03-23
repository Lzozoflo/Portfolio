import { z } from 'zod';


export const RegisterSchema = z.object({
    username: z.string().min(3).max(32).regex(/^\w+$/, 'Alphanumeric and underscores only'),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain upper, lower and digit')
});


export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});


export const TwoFactorCodeSchema = z.object({
    code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});




export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type TwoFactorCodeDto = z.infer<typeof TwoFactorCodeSchema>;
