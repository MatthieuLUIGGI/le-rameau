"use client";

import { ContactCard } from "../../../components/contacts/ContactCard";
import { demoContacts } from "../../../lib/demo-data"; // Use demo data for contacts
import { Input } from "../../../components/ui/input";
import { Search, PhoneCall } from "lucide-react";
import { useState } from "react";

export default function ContactsPage() {
    const [search, setSearch] = useState("");
    const filteredContacts = demoContacts.filter(c =>
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    const urgences = filteredContacts.filter(c =>
        c.nom.toLowerCase().includes('pompier') ||
        c.nom.toLowerCase().includes('police') ||
        c.nom.toLowerCase().includes('samu') ||
        c.nom.toLowerCase().includes('urgence')
    );

    // Pour démo: on simule des numéros d'urgence si pas dans demoData
    const mockUrgences = [
        { id: 'u1', nom: 'Pompiers', role: 'Urgences médicales / Incendie', telephone: '18', residence_id: 'res_1', is_public: true, type: 'externe' as const },
        { id: 'u2', nom: 'SAMU', role: 'Urgences médicales', telephone: '15', residence_id: 'res_1', is_public: true, type: 'externe' as const },
        { id: 'u3', nom: 'Police Secours', role: 'Sécurité', telephone: '17', residence_id: 'res_1', is_public: true, type: 'externe' as const },
        { id: 'u4', nom: 'Urgences Européennes', role: 'Toutes urgences', telephone: '112', residence_id: 'res_1', is_public: true, type: 'externe' as const },
    ];

    const displayUrgences = urgences.length > 0 ? urgences : mockUrgences;
    const autresContacts = filteredContacts.filter(c => !urgences.includes(c));

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <PhoneCall className="w-48 h-48 -mr-10 -mt-10" />
                </div>
                <h1 className="text-4xl font-extrabold text-primary mb-4 relative z-10">Annuaire</h1>
                <p className="text-muted-foreground font-medium mb-8 max-w-xl text-lg relative z-10">
                    Urgences, numéros utiles et contacts de la résidence à portée de main.
                </p>

                <div className="relative w-full max-w-xl shadow-md rounded-2xl relative z-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                    <Input
                        placeholder="Rechercher un contact, un métier..."
                        className="pl-12 h-14 bg-white border-primary/20 focus-visible:ring-primary text-lg rounded-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-danger/10 p-2 rounded-lg text-danger">
                        <PhoneCall className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-danger">Numéros d'Urgence</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {displayUrgences.map(contact => (
                        <ContactCard key={contact.id} contact={contact} />
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Search className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Contacts utiles</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {autresContacts.map((contact, i) => (
                        <div key={contact.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
                            <ContactCard contact={contact} />
                        </div>
                    ))}
                    {autresContacts.length === 0 && (
                        <p className="col-span-full py-12 text-center text-muted-foreground text-lg font-medium bg-surface border border-border rounded-2xl">
                            Aucun contact trouvé pour cette recherche.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
