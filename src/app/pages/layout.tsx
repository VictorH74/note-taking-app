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
    <div className="flex min-h-screen">
      {user && user.email && <PageListSidebar loggedUserEmail={user.email} />}
      {children}
    </div>
  );
}
