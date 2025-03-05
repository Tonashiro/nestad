/* eslint-disable jsx-a11y/alt-text */
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import NextImage from "next/image";
import {
  FolderPlus,
  Layers,
  LayoutGrid,
  Image,
  Menu,
  Home,
} from "lucide-react";
import { cn } from "@/utils";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <>
      {isMobile && (
        <SidebarTrigger
          className={cn(
            "fixed top-6 left-6 z-50 bg-background p-2 rounded-md shadow-md"
          )}
        >
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      )}

      <Sidebar collapsible="icon" className={cn("m-6 h-[calc(100%-48px)]")}>
        <SidebarTrigger
          className={cn(
            "flex self-end mr-4 mt-4",
            !isExpanded && "self-center mr-0 mt-4"
          )}
        >
          <Menu className="h-6 w-6" />
        </SidebarTrigger>

        {isExpanded && (
          <>
            <SidebarHeader className="flex items-center my-4">
              <NextImage
                src="/nestad_logo.webp"
                width={200}
                height={100}
                alt="Nestad name"
              />
            </SidebarHeader>

            <SidebarSeparator />
          </>
        )}

        <SidebarContent>
          <SidebarMenu>
            <SidebarGroup>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton
                    isActive={pathname === "/"}
                    tooltip="Dashboard"
                  >
                    <Home className="h-5 w-5" />
                    {isExpanded && "Dashboard"}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/create-collection">
                  <SidebarMenuButton
                    isActive={pathname === "/create-collection"}
                    tooltip="Create Collection"
                  >
                    <FolderPlus className="h-5 w-5" />
                    {isExpanded && " Create Collection"}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/my-collections">
                  <SidebarMenuButton
                    isActive={pathname === "/my-collections"}
                    tooltip="My Collections"
                  >
                    <Layers className="h-5 w-5" />
                    {isExpanded && " My Collections"}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/portfolio">
                  <SidebarMenuButton
                    isActive={pathname === "/portfolio"}
                    tooltip="My Portfolio"
                  >
                    <LayoutGrid className="h-5 w-5" />
                    {isExpanded && "My Portfolio"}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/generate-nfts">
                  <SidebarMenuButton
                    isActive={pathname === "/generate-nfts"}
                    tooltip="Generate NFTs"
                  >
                    <Image className="h-5 w-5" />
                    {isExpanded && "Generate NFTs"}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarGroup>
          </SidebarMenu>

          <SidebarSeparator />

          <SidebarFooter className="h-full items-center justify-end gap-0">
            <div className={cn("flex list-none", !isExpanded && "flex-col")}>
              <SidebarMenuItem>
                <Link href="https://www.x.com/tonashiro_" target="_blank">
                  <SidebarMenuButton>
                    <FaTwitter size={24} />
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="https://www.discord.gg/tonashiro" target="_blank">
                  <SidebarMenuButton>
                    <FaDiscord size={24} />
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="https://www.x.com/tonashiro" target="_blank">
                  <SidebarMenuButton>
                    <FaGithub size={24} />
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </div>
            {isExpanded && <p className="font-thin">Nestad, 2025</p>}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
