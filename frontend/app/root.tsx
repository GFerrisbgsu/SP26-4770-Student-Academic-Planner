import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider, useAuth } from "~/context/AuthContext";
import { NotificationProvider } from "~/context/NotificationContext";
import { Navbar } from "./components/Navbar";
import { SessionManager } from "./components/SessionManager";
import { NetworkProvider } from "~/context/NetworkContext";
import { SyncProvider } from "~/context/SyncContext";
import { PersistenceProvider } from "~/context/PersistenceContext";
import { SyncStatusIndicator } from "~/components/SyncStatusIndicator";
import { Toaster } from "~/components/ui/sonner";
import { useReminderScheduler } from "~/hooks/useReminderScheduler";
import { useServiceWorkerRegistration } from "~/hooks/useServiceWorkerRegistration";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Persistence infrastructure providers */}
        <NetworkProvider>
          <SyncProvider>
            <PersistenceProvider>
              <AuthProvider>
                <NotificationProvider>
                  {children}
                  {/* Session management (token refresh, inactivity tracking, expiry modal) */}
                  <SessionManager />
                </NotificationProvider>
              </AuthProvider>
              {/* Global sync status indicator */}
              <SyncStatusIndicator />
            </PersistenceProvider>
          </SyncProvider>
        </NetworkProvider>
        {/* Toast notifications */}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  // Activate background reminder checking
  useReminderScheduler();

  // Register service worker for background notifications
  useServiceWorkerRegistration();

  // Determine if current route is login, signup, verify-email, or reset-password
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";
  const isVerifyEmailPage = location.pathname === "/verify-email";
  const isResetPasswordPage = location.pathname === "/reset-password";
  const isAuthPage = isLoginPage || isSignupPage || isVerifyEmailPage || isResetPasswordPage;
  
  // Determine if loading screen is active
  const isLoadingScreen = authLoading;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isAuthPage && !isLoadingScreen && <Navbar />}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
