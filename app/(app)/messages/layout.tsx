import { ChannelList } from "../../../components/messages/ChannelList";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex overflow-hidden bg-surface border border-border shadow-sm rounded-2xl md:-mx-4 lg:mx-0">
            <div className="hidden md:flex w-72 flex-col">
                <ChannelList />
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
                {children}
            </div>
        </div>
    );
}
