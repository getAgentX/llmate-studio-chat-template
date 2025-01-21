import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "../store";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/pivotchart.css";
import "@/styles/BlockNote.css";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
            <ToastContainer
              toastStyle={{
                backgroundColor: "#0F0F10",
                color: "#FFF",
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </Provider>
    </>
  );
}
