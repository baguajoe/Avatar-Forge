//import react into the bundle
import React from "react";
import ReactDOM from "react-dom";

//include your index.scss file into the bundle
import "../styles/index.css";

//import your own components
import Layout from "./layout";

//render your react application
ReactDOM.render(<Layout />, document.querySelector("#app"));

// import React from "react";
// import { createRoot } from "react-dom/client";
// import "../styles/index.css";

// import Layout from "./layout";
// import injectContext from "./store/flux";

// const LayoutWithContext = injectContext(Layout);

// const root = createRoot(document.querySelector("#app"));
// root.render(<LayoutWithContext />);

  