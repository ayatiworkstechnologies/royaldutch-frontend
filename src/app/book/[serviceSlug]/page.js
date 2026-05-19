import BookingFlow from "@/components/BookingFlow";
import PublicShell from "@/components/PublicShell";

export default async function DirectBookingPage({ params }) {
  const { serviceSlug } = await params;
  return (
    <PublicShell>
      <BookingFlow serviceSlug={serviceSlug} />
    </PublicShell>
  );
}
