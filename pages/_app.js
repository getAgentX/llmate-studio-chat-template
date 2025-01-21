import "@/styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/pivotchart.css";
import "@/styles/BlockNote.css";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App({ Component, pageProps }) {
  return (
    <>
      <ThemeProvider>
        <Component {...pageProps} />
        <ToastContainer
          toastStyle={{
            backgroundColor: "#0F0F10",
            color: "#FFF",
          }}
        />
      </ThemeProvider>
    </>
  );
}
