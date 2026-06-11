import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة الورثة — إدارة وتقسيم التركات والعقارات",
  description: "منصة شاملة لإدارة التركات وتقسيمها وفق الشريعة الإسلامية والمذاهب الأربعة",
  keywords: "ميراث، تركة، مواريث، عقارات، ورثة، شريعة إسلامية",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
