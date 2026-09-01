import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/Components/Shared/Sidebar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata = {
  title: "ORVIX",
  description: "Automation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakarta.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col md:flex-row">
        
        <header className="p-4 md:hidden">
          <Navigation />
        </header>
        
        <aside className="hidden md:block">
          <Navigation />
        </aside>

       
        <main className="flex-1 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}