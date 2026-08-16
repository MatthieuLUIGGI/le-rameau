"use client";

import { useEffect, useState } from "react";
import { Check, Cookie, Settings2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

type CookiePreferences = {
    necessary: true;
    analytics: boolean;
    comfort: boolean;
};

type StoredCookieConsent = {
    preferences: CookiePreferences;
    decidedAt: string;
    expiresAt: string;
};

const STORAGE_KEY = "le-rameau-cookie-consent-v1";
const SETTINGS_EVENT = "le-rameau-open-cookie-settings";
const CONSENT_EVENT = "le-rameau-cookie-consent-updated";
const SIX_MONTHS_MS = 183 * 24 * 60 * 60 * 1000;

const defaultPreferences: CookiePreferences = {
    necessary: true,
    analytics: false,
    comfort: false,
};

function getStoredConsent(): StoredCookieConsent | null {
    try {
        const rawConsent = window.localStorage.getItem(STORAGE_KEY);
        if (!rawConsent) return null;

        const consent = JSON.parse(rawConsent) as StoredCookieConsent;
        if (!consent.expiresAt || new Date(consent.expiresAt).getTime() < Date.now()) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return consent;
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

function buildConsent(preferences: CookiePreferences): StoredCookieConsent {
    const decidedAt = new Date();
    const expiresAt = new Date(decidedAt.getTime() + SIX_MONTHS_MS);

    return {
        preferences,
        decidedAt: decidedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };
}

export function CookieConsentBanner() {
    const [isReady, setIsReady] = useState(false);
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

    useEffect(() => {
        const storedConsent = getStoredConsent();
        if (storedConsent) {
            setPreferences(storedConsent.preferences);
        } else {
            setIsBannerVisible(true);
        }

        const openSettings = () => {
            const latestConsent = getStoredConsent();
            setPreferences(latestConsent?.preferences ?? defaultPreferences);
            setIsSettingsOpen(true);
            setIsBannerVisible(false);
        };

        window.addEventListener(SETTINGS_EVENT, openSettings);
        setIsReady(true);

        return () => window.removeEventListener(SETTINGS_EVENT, openSettings);
    }, []);

    function saveConsent(nextPreferences: CookiePreferences) {
        const consent = buildConsent(nextPreferences);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));

        setPreferences(nextPreferences);
        setIsBannerVisible(false);
        setIsSettingsOpen(false);
    }

    function acceptAll() {
        saveConsent({
            necessary: true,
            analytics: true,
            comfort: true,
        });
    }

    function rejectAll() {
        saveConsent(defaultPreferences);
    }

    function updatePreference(key: "analytics" | "comfort", value: boolean) {
        setPreferences((current) => ({
            ...current,
            [key]: value,
        }));
    }

    if (!isReady) return null;

    return (
        <>
            {isBannerVisible && (
                <section
                    aria-label="Gestion des cookies"
                    className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-5xl rounded-lg border border-border bg-background p-4 text-foreground shadow-2xl sm:p-5"
                >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Cookie className="h-5 w-5 text-primary" aria-hidden="true" />
                                <h2 className="text-base font-semibold">Gestion des cookies</h2>
                            </div>
                            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                                Le Rameau utilise des cookies nécessaires au fonctionnement du site. Les cookies de mesure d'audience et de confort restent facultatifs. Vous pouvez accepter, refuser ou choisir les finalités.
                            </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
                            <Button variant="outline" onClick={rejectAll} className="w-full">
                                <X className="h-4 w-4" aria-hidden="true" />
                                Tout refuser
                            </Button>
                            <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="w-full">
                                <Settings2 className="h-4 w-4" aria-hidden="true" />
                                Paramétrer
                            </Button>
                            <Button variant="outline" onClick={acceptAll} className="w-full">
                                <Check className="h-4 w-4" aria-hidden="true" />
                                Tout accepter
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Paramétrage des cookies</DialogTitle>
                        <DialogDescription>
                            Vous pouvez modifier votre choix à tout moment depuis le lien « Gérer les cookies » en bas de page.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-md border border-border p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox checked disabled aria-label="Cookies strictement nécessaires" />
                                <div>
                                    <p className="font-medium">Cookies strictement nécessaires</p>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        Ils servent à maintenir la session, sécuriser l'accès et mémoriser votre choix de consentement. Ils ne peuvent pas être désactivés depuis ce panneau.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-accent">
                            <Checkbox
                                checked={preferences.analytics}
                                onCheckedChange={(checked) => updatePreference("analytics", checked === true)}
                                aria-label="Autoriser les cookies de mesure d'audience"
                            />
                            <span>
                                <span className="block font-medium">Mesure d'audience</span>
                                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                                    Ces cookies aideraient à mesurer les pages consultées et les erreurs d'affichage. Aucun outil de publicité n'est prévu dans la version actuelle.
                                </span>
                            </span>
                        </label>

                        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-accent">
                            <Checkbox
                                checked={preferences.comfort}
                                onCheckedChange={(checked) => updatePreference("comfort", checked === true)}
                                aria-label="Autoriser les cookies de confort"
                            />
                            <span>
                                <span className="block font-medium">Confort d'utilisation</span>
                                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                                    Ces cookies peuvent mémoriser des préférences d'interface non essentielles, par exemple des choix d'affichage.
                                </span>
                            </span>
                        </label>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={rejectAll}>
                            <X className="h-4 w-4" aria-hidden="true" />
                            Tout refuser
                        </Button>
                        <Button variant="outline" onClick={() => saveConsent(preferences)}>
                            <Settings2 className="h-4 w-4" aria-hidden="true" />
                            Enregistrer
                        </Button>
                        <Button variant="outline" onClick={acceptAll}>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Tout accepter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function openCookieSettings() {
    window.dispatchEvent(new Event(SETTINGS_EVENT));
}
