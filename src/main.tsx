import { createRoot } from "react-dom/client";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import "./index.css";
import App from "./App";
import TabbedWorkspaceDemo from "./components/TabbedWorkspaceDemo";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <TabbedWorkspaceDemo />
  </ConvexProvider>
);
