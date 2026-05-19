import "./globals.css";

export const metadata = {
  title: "Royal Dutch Clinic Booking",
  description: "Hospital service booking and admin management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
