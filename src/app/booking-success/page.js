import { Suspense } from "react";
import BookingSuccessContent from "@/components/BookingSuccessContent";
import PublicShell from "@/components/PublicShell";

export default function BookingSuccessPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Suspense fallback={<div className="rounded-lg border border-slate-200 bg-white p-8">Loading confirmation...</div>}>
          <BookingSuccessContent />
        </Suspense>
      </section>
    </PublicShell>
  );
}
