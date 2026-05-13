import { FunnelHeader } from "@/components/funnel/FunnelHeader";
import { Footer } from "@/components/brand/Footer";
import { FunnelStepperNav } from "@/components/funnel/FunnelStepperNav";

export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FunnelHeader />
      <main className="flex-1 bg-[var(--tm-paper)]">
        <FunnelStepperNav />
        {children}
      </main>
      <Footer />
    </>
  );
}
