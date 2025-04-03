// const injectContext = (PassedComponent) => {
//     const StoreWrapper = (props) => {
//       // create your store context
//       return (
//         <Context.Provider value={{ store, actions }}>
//           <PassedComponent {...props} />
//         </Context.Provider>
//       );
//     };
  
//     return StoreWrapper;
//   };
  
//   export default injectContext;

import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";

import Layout from "./layout";
import injectContext from "./store/flux";

const LayoutWithContext = injectContext(Layout);

const root = createRoot(document.querySelector("#app"));
root.render(<LayoutWithContext />);

  