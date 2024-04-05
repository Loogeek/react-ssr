import { hydrateRoot } from "react-dom/client";
import Client from "./count.jsx";

hydrateRoot(document.getElementById("root"), <Client />);
