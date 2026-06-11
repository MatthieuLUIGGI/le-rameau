/**
 * Rôles utilisateur — constante typée centralisée.
 * Utiliser ces valeurs partout au lieu des strings littéraux ('ag', 'admin', etc.)
 */
export const UserRole = {
    MEMBRE: 'membre',
    AG: 'ag',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
