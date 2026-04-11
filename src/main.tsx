import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";
import "./styles/animations.css";
import "./styles/dark-overrides.css";

createRoot(document.getElementById("root")!).render(<App />);
