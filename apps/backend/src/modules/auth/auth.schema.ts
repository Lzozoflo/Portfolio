import { z } from 'zod';

// Schéma d'inscription existant
export const RegisterSchema = z.object({
    username: z.string().min(3).max(32).regex(/^\w+$/, 'Alphanumeric and underscores only'),
    email: z.string().email(),
    password: z
       .string()
       .min(8)
       .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain upper, lower and digit')
});

// Schéma de connexion (Étape 1 : Email/Password)
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

// Schéma pour l'activation de la 2FA (Vérification du premier code)
export const TwoFactorCodeSchema = z.object({
    code: z.string().length(6).regex(/^\d+$/, 'Le code doit contenir exactement 6 chiffres')
});

// Schéma pour la connexion 2FA (Étape 2 : UserId + Code)
export const Verify2FALoginSchema = z.object({
    userId: z.string().cuid({ message: "ID utilisateur invalide" }), // Utilise cuid car c'est votre défaut Prisma
    code: z.string().length(6).regex(/^\d+$/, 'Le code doit contenir exactement 6 chiffres')
});

// --- DTOs (Data Transfer Objects) inférés ---
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type TwoFactorCodeDto = z.infer<typeof TwoFactorCodeSchema>;
export type Verify2FALoginDto = z.infer<typeof Verify2FALoginSchema>;