import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google"; 
import "./globals.css";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const monoFont = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OInterview",
  description: "An integrated interviewing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">  
      <body
        className={`${interFont.variable} ${monoFont.variable} antialiased flex flex-col h-screen`}
      >
        <div className="flex-grow w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
