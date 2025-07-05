import { createRoot } from "react-dom/client";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { initializeTheme } from "./lib/theme-utils";
import { router } from "./router";

// Initialize theme (defaults to dark)
initializeTheme();

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <RouterProvider router={router} />
  </ConvexProvider>
);
