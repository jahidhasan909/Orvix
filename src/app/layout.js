import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata = {
  title: "ORVIX",
  description: "NGO Operations Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.className} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">{children}</body>
    </html>
  );
}
