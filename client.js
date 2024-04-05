import { hydrateRoot } from "react-dom/client";
// import Client from "./pages/index";

const { props, page } = windw.__DATA__;

const importFile = async (page) => {
  const Component = await import(`./pages/${page}.jsx`);
  return Component;
};

const data = await importFile(page);
const Component = data.default;

hydrateRoot(document.getElementById("root"), <Component {...props} />);
