import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import AppSidebar from "@/components/AppSidebar";
import { Wallet } from "@/components/Wallet";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Nestad",
  description:
    "Nestad is an intuitive platform designed to make launching NFT collections effortless and enjoyable. With a sleek UI and seamless UX, it empowers users to easily create, customize, and deploy their NFT collections all without the need for technical expertise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative bg-slate-800">
        <Providers>
          <Wallet />
          <SidebarProvider>
            <AppSidebar />
          </SidebarProvider>
          {children}
        </Providers>
      </body>
    </html>
  );
}
