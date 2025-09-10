import { getCurrentUser } from "@/lib/configs/firebase-admin";
import { redirect } from "next/navigation";

export default async function Pages() {
  // TODO: redirect unauthenticated users to login page
  const loggedUser = await getCurrentUser();

  if (!loggedUser) redirect("/../auth/login");

  return (
    <button className="cursor-pointer py-3 px-9 duration-200 hover:brightness-110">
      Create a page
    </button>
  );
}
