import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "./pages/Home.jsx";
import { SocketProvider } from "./contexts/SocketProvider.jsx";
import Room from "./pages/Room.jsx";
import store from "./store/store.js";

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "room/:roomId",
        element: <Room />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <RouterProvider router={route} />
    </SocketProvider>
  </Provider>
);
