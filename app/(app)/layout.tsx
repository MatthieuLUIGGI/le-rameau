import { Sidebar } from "../../components/layout/Sidebar";
import { MobileTabBar } from "../../components/layout/MobileTabBar";
import { Header } from "../../components/layout/Header";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <Header />

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <main className="flex-1 pb-20 lg:pb-8 pt-4 lg:pt-8 px-4 lg:px-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>

            <MobileTabBar />
        </div>
    );
}
