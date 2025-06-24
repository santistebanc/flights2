import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function SocialSignInForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialSignIn = (provider: string) => {
    setIsLoading(provider);
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(null);
      toast.error(`${provider} authentication is not configured yet. Please contact the administrator to set up social login.`);
    }, 1000);
  };

  const socialProviders = [
    {
      name: "Google",
      icon: "🔍",
      variant: "outline" as const,
      className: "bg-white text-gray-900 hover:bg-gray-100"
    },
    {
      name: "GitHub",
      icon: "🐙",
      variant: "secondary" as const,
      className: "bg-gray-900 text-white hover:bg-gray-800"
    },
    {
      name: "Apple",
      icon: "🍎",
      variant: "secondary" as const,
      className: "bg-black text-white hover:bg-gray-900"
    },
    {
      name: "Microsoft",
      icon: "🪟",
      variant: "default" as const,
      className: "bg-blue-600 text-white hover:bg-blue-700"
    }
  ];

  return (
    <div className="w-full space-y-3">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-400">Sign in with your preferred account</p>
      </div>
      
      {socialProviders.map((provider) => (
        <Button
          key={provider.name}
          onClick={() => handleSocialSignIn(provider.name)}
          disabled={isLoading !== null}
          variant={provider.variant}
          className={cn(
            "w-full",
            provider.className,
            isLoading === provider.name && "animate-pulse"
          )}
        >
          {isLoading === provider.name ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-lg">{provider.icon}</span>
          )}
          <span>
            {isLoading === provider.name ? 'Connecting...' : `Continue with ${provider.name}`}
          </span>
        </Button>
      ))}
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
