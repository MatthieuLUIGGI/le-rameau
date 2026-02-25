import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const registerSchema = z.object({
    prenom: z.string().min(2, { message: "Prénom trop court" }),
    nom: z.string().min(2, { message: "Nom trop court" }),
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
    confirmPassword: z.string(),
    batiment: z.string().optional(),
    appartement: z.string().optional(),
    rgpd: z.literal(true, {
        errorMap: () => ({ message: "Vous devez accepter les conditions." }),
    } as any),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export const announceSchema = z.object({
    titre: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
    contenu: z.string().min(10, { message: "Le contenu est trop court" }),
    categorie: z.enum(["travaux", "information", "assemblee", "divers"]),
    is_important: z.boolean().optional(),
});

export const alerteSchema = z.object({
    titre: z.string().min(5, { message: "Le titre est obligatoire" }),
    description: z.string().min(10, { message: "La description est obligatoire" }),
    categorie: z.enum(["incendie", "degat_eau", "ascenseur", "intrusion", "coupure", "autre"]),
});
