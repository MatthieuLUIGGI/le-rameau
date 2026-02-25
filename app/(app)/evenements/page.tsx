"use client";

import { CalendarView } from "../../../components/evenements/CalendarView";
import { EventCard } from "../../../components/evenements/EventCard";
import { demoEvenements } from "../../../lib/demo-data"; // Use demo data statically for this page per requirements
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { CalendarPlus } from "lucide-react";

export default function EvenementsPage() {
    const [view, setView] = useState("calendrier");
    const events = demoEvenements;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12 h-[calc(100vh-8rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface p-6 sm:p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute left-0 inset-y-0 w-2 bg-purple-500"></div>
                <div>
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Événements</h1>
                    <p className="text-muted-foreground font-medium text-lg">Calendrier partagé de la copropriété.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
                        <TabsList className="bg-background border border-border shadow-sm h-12 p-1 rounded-xl">
                            <TabsTrigger value="calendrier" className="rounded-lg px-6 font-bold h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Calendrier</TabsTrigger>
                            <TabsTrigger value="liste" className="rounded-lg px-6 font-bold h-10 data-[state=active]:bg-primary data-[state=active]:text-white">Liste</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button className="bg-primary hover:bg-primary-light font-bold text-white shadow-md rounded-xl h-12 px-6 w-full sm:w-auto">
                        <CalendarPlus className="mr-2 h-5 w-5" /> Ajouter
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                {view === "calendrier" ? (
                    <CalendarView events={events} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {events.map((evt) => (
                            <EventCard key={evt.id} event={evt} compact={false} />
                        ))}
                        {events.length === 0 && (
                            <div className="col-span-full py-16 text-center text-muted-foreground text-lg font-medium bg-surface rounded-2xl border border-border">
                                Aucun événement prévu.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
