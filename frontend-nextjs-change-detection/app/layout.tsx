import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext"; 

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebTora",
  description: "Website Monitoring and Change Detection",
  icons: {
    icon: "/image/Logo fiks.png",
    shortcut: "image/Logo fiks.png",
    apple: "/image/Logo fiks.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}