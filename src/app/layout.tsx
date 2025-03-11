import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import AppSidebar from "@/components/AppSidebar";
import { Wallet } from "@/components/Wallet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Bounce, ToastContainer } from "react-toastify";
import { LoaderProvider } from "@/context/loaderContext";

export const metadata: Metadata = {
  title: "Nestad",
  description:
    "Nestad is an intuitive platform designed to make launching NFT collections effortless and enjoyable. With a sleek UI and seamless UX, it empowers users to easily create, customize, and deploy their NFT collections all without the need for technical expertise.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="relative flex flex-col flex-nowrap w-full min-h-[100svh-24px] overflow-x-hidden bg-[#120c18]"
      >
        <div className="fixed h-full w-full bg-background-fade z-[-1]" />
        <Providers>
          <LoaderProvider>
          <Wallet />
            <SidebarProvider>
              <AppSidebar />
              <main className="ml-12 mr-6 mb-6 w-full text-white">{children}</main>
            </SidebarProvider>
          </LoaderProvider>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
          />
        </Providers>
      </body>
    </html>
  );
}
