import PublicShell from "@/components/PublicShell";
import BookServicePicker from "@/components/BookServicePicker";
import { api } from "@/lib/api";

export default async function BookPage() {
  const [categories, services] = await Promise.all([api.categories().catch(() => []), api.services().catch(() => [])]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-800">Book appointment</p>
        <h1 className="mt-2 text-3xl font-semibold">Choose a Service</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Select a treatment first. After that, the booking wizard will guide you through specialist, slot, patient details and final confirmation.</p>
        <BookServicePicker categories={categories} services={services} />
      </section>
    </PublicShell>
  );
}
