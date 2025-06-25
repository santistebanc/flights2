import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./components/auth/SignInForm";
import { SocialSignInForm } from "./components/auth/SocialSignInForm";
import { SignOutButton } from "./components/auth/SignOutButton";
import { Toaster } from "sonner";
import { FlightSearch } from "./FlightSearch";
import { CompactFilters } from "./components/CompactFilters";
import { useAuthActions } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";
import { SearchContext } from "./contexts/SearchContext";
import { AuthButton } from "./components/auth/AuthButton";

export default function App() {
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    departureStart: "",
    departureEnd: "",
  });

  return (
    <SearchContext.Provider value={{ searchParams, setSearchParams }}>
      <div className="min-h-screen flex flex-col bg-gray-900">
        <header className="sticky top-0 z-10 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 shadow-sm">
          <div className="h-16 flex justify-between items-center px-4">
            <h2 className="text-xl font-semibold text-yellow-400">
              ✈️ FlightFinder
            </h2>
            <AuthButton />
          </div>
          <CompactFilters />
        </header>
        <main className="flex-1">
          <Content />
        </main>
        <Toaster />
      </div>
    </SearchContext.Provider>
  );
}

function Content() {
  const { signIn } = useAuthActions();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  // Auto sign-in anonymously if not authenticated
  useEffect(() => {
    if (loggedInUser === null) {
      signIn("anonymous");
    }
  }, [loggedInUser, signIn]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <FlightSearch />
    </div>
  );
}
