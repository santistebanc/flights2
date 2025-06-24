import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { SignInDialog } from "./SignInDialog"
import { Authenticated, Unauthenticated } from "convex/react";

export function AuthButton() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <div className="relative">
      <Authenticated>
        {loggedInUser?.isAnonymous ? (
          <SignInDialog />
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Welcome, {loggedInUser?.email ?? "User"}</span>
            <SignOutButton />
          </div>
        )}
      </Authenticated>
      
      <Unauthenticated>
        <SignInDialog />
      </Unauthenticated>
    </div>
  );
} 