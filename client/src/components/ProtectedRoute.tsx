// LOGIN BYPASS - Authentication disabled for development
// import { useEffect } from "react";
// import { useLocation } from "wouter";
// import { useAuth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // LOGIN BYPASS - Authentication disabled for development
  // const { isAuthenticated, isLoading } = useAuth();
  // const [, setLocation] = useLocation();

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     setLocation("/login");
  //   }
  // }, [isAuthenticated, isLoading, setLocation]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
  //         <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  // Directly render children without authentication check
  return <>{children}</>;
}
