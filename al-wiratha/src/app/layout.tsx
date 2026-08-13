import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "منصة الورثة — إدارة وتقسيم التركات والعقارات",
    template: "%s | منصة الورثة",
  },
  description: "منصة شاملة لإدارة التركات وتقسيمها وفق الشريعة الإسلامية والمذاهب الأربعة — حاسبة مواريث مجانية، توزيع إيرادات تلقائي، وتصويت مرجّح بالحصص",
  keywords: ["حاسبة المواريث", "تقسيم الورث", "ميراث", "تركة", "مواريث", "عقارات مشتركة", "ورثة", "الفرائض", "المذاهب الأربعة"],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "منصة الورثة",
    title: "منصة الورثة — إدارة وتقسيم التركات والعقارات",
    description: "حاسبة مواريث مجانية وفق المذاهب الأربعة، وإدارة كاملة للتركات المشتركة: حصص شرعية، توزيع إيرادات تلقائي، وتصويت شفاف",
  },
  twitter: {
    card: "summary",
    title: "منصة الورثة — إدارة وتقسيم التركات",
    description: "حاسبة مواريث مجانية وفق المذاهب الأربعة وإدارة كاملة للتركات المشتركة",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="ar" dir="rtl" className={`h-full ${cairo.variable}`}>
      <body className="h-full antialiased">
        {children}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
