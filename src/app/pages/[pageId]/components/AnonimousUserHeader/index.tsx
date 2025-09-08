"use client";
import React from "react";

import {
  browserLocalPersistence,
  // GoogleAuthProvider,
  setPersistence,
  // signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/configs/firebase";
import { useAuthUser } from "@/hooks/useAuthUser";

export function AnonimousUserHeader() {
  // const [LoginOptionsModal, setLoginOptionsModal] = React.useState(false);

  const { isLogged, isLoaded } = useAuthUser();

  const handleLogin = async () => {
    await setPersistence(auth, browserLocalPersistence);
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // console.log("User signed in:", result.user);
  };

  if (!isLoaded || isLogged) return null;

  return (
    <div className="w-screen bg-neutral-900 text-right py-2 px-6">
      <button
        className="py-1 px-7 bg-green-200 text-gray-700 rounded-md cursor-pointer"
        onClick={handleLogin}
      >
        Login with Google
      </button>
    </div>
  );
}
