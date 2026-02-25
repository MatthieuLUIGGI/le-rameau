"use client";

import { Evenement } from "../../types";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { EventCard } from "./EventCard";

export function CalendarView({ events }: { events: Evenement[] }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            const cloneDay = day;
            const dateEvents = events.filter(e => isSameDay(new Date(e.date_debut), cloneDay));
            const hasEvent = dateEvents.length > 0;

            days.push(
                <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(cloneDay)}
                    className={cn(
                        "p-3 h-16 sm:h-24 w-full flex flex-col justify-start items-center border border-border/50 cursor-pointer transition-colors relative",
                        !isSameMonth(day, monthStart) ? "text-muted-foreground bg-black/5" : "bg-surface hover:bg-black/5",
                        isSameDay(day, selectedDate) ? "bg-primary/10 border-primary shadow-[inset_0_0_0_2px_theme(colors.primary.DEFAULT)]" : ""
                    )}
                >
                    <span className={cn(
                        "text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center",
                        isSameDay(day, new Date()) ? "bg-primary text-white" : ""
                    )}>
                        {format(day, dateFormat)}
                    </span>

                    {hasEvent && (
                        <div className="absolute bottom-2 flex gap-1">
                            {dateEvents.slice(0, 3).map((e, idx) => (
                                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary" />
                            ))}
                            {dateEvents.length > 3 && <span className="text-[8px] leading-[6px]">+</span>}
                        </div>
                    )}
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(<div className="flex w-full" key={day.toString()}>{days}</div>);
        days = [];
    }

    const selectedDateEvents = events.filter(e => isSameDay(new Date(e.date_debut), selectedDate));

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="flex-1 bg-surface rounded-2xl border border-border shadow-sm p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold capitalize text-primary pl-2">
                        {format(currentMonth, "MMMM yyyy", { locale: fr })}
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full shadow-sm hover:bg-muted/10">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full shadow-sm hover:bg-muted/10">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex w-full border-b border-border/50 mb-2 pb-2">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
                        <div key={d} className="flex-1 text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden bg-white shadow-sm">
                    {rows}
                </div>
            </div>

            <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm top-4 sticky pt-5">
                    <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
                        {format(selectedDate, "eeee d MMMM", { locale: fr })}
                    </h3>

                    <div className="space-y-4">
                        {selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map(event => (
                                <EventCard key={event.id} event={event} compact />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground bg-black/5 p-4 rounded-xl text-center">Aucun événement prévu pour cette date.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
