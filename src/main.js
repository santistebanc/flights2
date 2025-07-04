"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("react-dom/client");
var react_1 = require("convex/react");
require("./index.css");
var App_1 = require("./App");
var convex = new react_1.ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
(0, client_1.createRoot)(document.getElementById("root")).render(<react_1.ConvexProvider client={convex}>
    <App_1.default />
  </react_1.ConvexProvider>);
