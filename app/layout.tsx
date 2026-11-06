import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Penny",
  description:
    "A general-purpose AI you talk to over iMessage. No app to download.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className={`${GeistSans.className} flex min-h-full flex-col`}>
        {children}
      </body>
    </html>
  );
}
