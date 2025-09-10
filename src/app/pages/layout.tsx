"use client";

import { PageListSidebar } from "@/components/PageListSidebar";
import { useAuthUser } from "@/hooks/useAuthUser";
import React from "react";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuthUser();

  return (
    <div className="flex h-screen overflow-y-hidden">
      {user && user.email && <PageListSidebar loggedUserEmail={user.email} />}
      <div className="h-screen w-full overflow-auto scrollbar grid place-items-center">
        {children}
      </div>
    </div>
  );
}
