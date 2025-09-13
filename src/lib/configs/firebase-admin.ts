import * as admin from "firebase-admin";
import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { cookies } from "next/headers";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  initializeApp({
    credential: credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const adminDb = getFirestore();
export const adminSDK = admin;
export const authAdmin = admin.auth();

export async function getCurrentUser() {
  const session = (await cookies()).get("session")?.value;
  // console.log("getCurrentUser > SESSION", session);
  if (!session) return null;
  try {
    const decoded = await authAdmin.verifySessionCookie(session, true);
    const user = await authAdmin.getUser(decoded.uid);
    console.log("getCurrentUser > USER", user);
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function verifySession(sessionCookie: string) {
  try {
    await authAdmin.verifySessionCookie(sessionCookie!, true);
    console.log("OK");
    return true;
  } catch {
    return false;
  }
}
