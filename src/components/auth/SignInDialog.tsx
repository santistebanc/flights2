import { useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SocialSignInForm } from "./SocialSignInForm";
import { useClickOutside } from "../../hooks/useClickOutside";

export function SignInDialog() {
  const [showSignIn, setShowSignIn] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useClickOutside(dialogRef, () => {
    setShowSignIn(false);
  });

  return (
    <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
      <DialogTrigger asChild>
        <Button>Login</Button>
      </DialogTrigger>
      <DialogContent ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <SocialSignInForm />
      </DialogContent>
    </Dialog>
  );
} 