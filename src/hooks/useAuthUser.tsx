import { auth } from "@/lib/configs/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import React from "react";

export function useAuthUser() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!isLoaded) setIsLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    isLogged: !!user,
    isLoaded,
  };
}
