import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const registerSchema = z.object({
    prenom: z.string().min(2, { message: "Prénom trop court" }),
    nom: z.string().min(2, { message: "Nom trop court" }),
    email: z.string().email({ message: "Email invalide" }),
    password: z.string()
        .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
        .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
        .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
        .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" })
        .regex(/[^A-Za-z0-9]/, { message: "Le mot de passe doit contenir au moins un caractère spécial" }),
    confirmPassword: z.string().min(1, { message: "Veuillez confirmer votre mot de passe" }),
    batiment: z.string().min(1, { message: "Le bâtiment est obligatoire" }),
    appartement: z.string().min(1, { message: "Le numéro d'appartement est obligatoire" }),
    rgpd: z.literal(true, {
        errorMap: () => ({ message: "Veuillez accepter les conditions d'utilisations" })
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
