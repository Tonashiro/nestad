import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import AppSidebar from "@/components/AppSidebar";
import { Wallet } from "@/components/Wallet";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Bounce, ToastContainer } from "react-toastify";
import { LoaderProvider } from "@/context/loaderContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Nestad - Join the Monad nest. Launch with Nestad",
  description:
    "Create, customize, and deploy NFT collections effortlessly with Nestad. No coding required.",
  keywords:
    "NFT, NFT launch, blockchain, crypto, NFT collection, web3, smart contracts, Ethereum, Solana, NFT minting, NFT marketplace, crypto collectibles",
  authors: [{ name: "Tonashiro" }],
  creator: "Tonashiro",
  publisher: "Tonashiro",
  metadataBase: new URL("https://www.nestad.xyz"),
  alternates: {
    canonical: "https://www.nestad.xyz",
  },
  openGraph: {
    title: "Nestad - Join the Monad nest. Launch with Nestad",
    description:
      "Create, customize, and deploy NFT collections effortlessly with Nestad. No coding required.",
    url: "https://www.nestad.xyz",
    siteName: "Nestad",
    images: [
      {
        url: "https://www.nestad.xyz/twitter_card.png",
        width: 1200,
        height: 630,
        alt: "Nestad - Effortless NFT Collection Creation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@nestadxyz",
    creator: "@nestadxyz",
    title: "Nestad - Join the Monad nest. Launch with Nestad",
    description:
      "Create, customize, and deploy NFT collections effortlessly with Nestad. No coding required.",
    images: [
      {
        url: "https://www.nestad.xyz/twitter_card.png",
        width: 1200,
        height: 630,
        alt: "Nestad - Effortless NFT Collection Creation",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Head>
        {/* Favicon */}
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="Nestad" />
        <meta name="theme-color" content="#120c18" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.nestad.xyz" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Nestad",
            url: "https://www.nestad.xyz",
            description:
              "Nestad is the ultimate platform for launching NFT collections effortlessly.",
            author: {
              "@type": "Organization",
              name: "Nestad",
              url: "https://www.nestad.xyz",
            },
            applicationCategory: "Blockchain",
            operatingSystem: "All",
          })}
        </script>
      </Head>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className="relative flex flex-col flex-nowrap w-full min-h-[100svh-24px] overflow-x-hidden bg-[#120c18]"
        >
          <Analytics />
          <SpeedInsights />

          <div className="fixed h-full w-full bg-background-fade z-[-1]" />
          <Providers>
            <LoaderProvider>
              <Wallet />
              <SidebarProvider>
                <AppSidebar />
                <main className="ml-12 mr-6 mb-6 w-full text-white">
                  {children}
                </main>
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
    </>
  );
}
