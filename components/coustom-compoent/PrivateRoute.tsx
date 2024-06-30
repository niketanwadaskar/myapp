// components/PrivateRoute.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookies } from "cookies-next";
// import { getToken, isTokenValid } from '@/utils/services/helper'
// import { saveTokens } from '@/utils/services/authHandler'

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [loader, setLoader] = useState<boolean>(true);
  const [validate, setValidate] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

  useEffect(() => {
    const checkAuth = async () => {
      setLoader(true); // Ensure loader is set to true when starting the auth check

      const token = getTokenFromCookie("email");

      const currentPath = pathname;
      if (!token) {
        if (!publicRoutes.includes(currentPath)) {
          await router.push("/auth/login");
        }
        setValidate(false);
      } else {
        if (currentPath === "/auth/login") {
          await router.push("/");
        }
        setValidate(true);
      }

      setLoader(false); // Set loader to false after completing the auth check
    };

    checkAuth();
  }, [router, pathname, validate]);

  // Render children only if the route is public or the user is validated
  if (!publicRoutes.includes(pathname) && !validate) return null;

  return <>{children}</>;
};

export default PrivateRoute;

export function getTokenFromCookie(key: string) {
  const cookies = document.cookie.split(";"); // Split cookies into array of key-value pairs

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim(); // Trim any leading or trailing whitespace
    // Check if this is the cookie that contains the token
    if (cookie.startsWith(`${key}=`)) {
      return cookie.substring(`${key}=`.length); // Extract and return the token value
    }
  }

  return null; // Return null if token cookie is not found
}
