import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openBase64Pdf(base64String: string | null) {
  if (!base64String) return;

  if (!base64String.startsWith('data:')) {
    window.open(base64String, '_blank');
    return;
  }

  try {
    const arr = base64String.split(',');
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : 'application/pdf';

    // Décodage du base64 en chaîne binaire
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    // Remplissage du tableau avec les valeurs correspondantes
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    // Création du Blob et de l'URL objet
    const blob = new Blob([u8arr], { type: mime });
    const url = URL.createObjectURL(blob);

    // Ouverture dans un nouvel onglet
    window.open(url, '_blank');

    // Nettoyage de l'URL objet après un léger délai pour que le navigateur ait le temps de charger
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Erreur lors de l'ouverture du fichier joint:", error);
    // Fallback : on tente d'ouvrir directement si le décodage échoue
    window.open(base64String, '_blank');
  }
}
