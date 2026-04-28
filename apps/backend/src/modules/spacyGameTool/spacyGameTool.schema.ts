import { z } from 'zod';

// Schéma d'inscription existant
export const AddPosPlaneteSchema = z.object({
    galaxie : z.string().min(1).max(1).regex(/^\w+$/, 'Alphanumeric and underscores only'),
    system  : z.string().min(1).max(3).regex(/^\w+$/, 'Alphanumeric and underscores only'),
    planete : z.string().min(1).max(1).regex(/^\w+$/, 'Alphanumeric and underscores only'),
});


// --- DTOs (Data Transfer Objects) inférés ---
export type AddPosPlaneteDto = z.infer<typeof AddPosPlaneteSchema>;
