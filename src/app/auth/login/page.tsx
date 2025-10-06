/* eslint-disable @typescript-eslint/no-unsafe-function-type */
"use client";
import { auth } from "@/lib/configs/firebase";
import {
  browserLocalPersistence,
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthCredential,
  setPersistence,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { NoUserError, NullCredentialError } from "./exceptions";
import { CircleLoading } from "@/components/CircleLoading";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const loginBtnGenerationDatas = React.useMemo(
    () => [
      {
        provider: new GoogleAuthProvider(),
        imgSrc:
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg",
        alt: "google icon",
        text: "Login with Google",
      },
      {
        provider: new GithubAuthProvider(),
        imgSrc:
          "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
        alt: "github icon",
        text: "Login with Github",
        style: { filter: "invert(1)" },
      },
    ],
    []
  );

  const handleLogin = async (
    provider: GoogleAuthProvider | GithubAuthProvider
  ) => {
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithPopup(auth, provider);

      const credentialFromResultMap = new Map<
        Function,
        (result: UserCredential) => OAuthCredential | null
      >([
        [GoogleAuthProvider, GoogleAuthProvider.credentialFromResult],
        [GithubAuthProvider, GithubAuthProvider.credentialFromResult],
      ]);
      const providerConstructor = provider.constructor as Function;
      const credentialFromResultFn =
        credentialFromResultMap.get(providerConstructor);
      if (!credentialFromResultFn) {
        console.error("Unsupported provider");
        return;
      }

      const credential = credentialFromResultFn(result);
      if (!credential) {
        throw new NullCredentialError();
      }

      const idTokenResult = await result.user.getIdTokenResult()
      const idToken = idTokenResult.token;

      // TODO: use csrfToken
      // const csrfToken = getCookie('csrfToken')

      if (!result.user) {
        throw new NoUserError();
      }

      await fetch("/api/sessionLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken /* ,csrfToken */ }),
      });

      router.replace("/pages");
    } catch (error) {
      console.error(error);
      alert("Error during sign-in:");
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen grid place-items-center">
      <main className="w-96 p-4 bg-zinc-800 text-center divide-y divide-gray-500 font-semibold relative rounded-md overflow-hidden">
        {loginBtnGenerationDatas.map(
          ({ provider, imgSrc, alt, text, style }, index) => (
            <button
              onClick={() => handleLogin(provider)}
              className="block w-full py-3"
              key={index}
            >
              <Image
                src={imgSrc}
                width={20}
                height={20}
                alt={alt}
                style={style}
                className="inline-block mr-2"
              />{" "}
              {text}
            </button>
          )
        )}
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-sm">
            <CircleLoading />
          </div>
        )}
      </main>
    </div>
  );
}
