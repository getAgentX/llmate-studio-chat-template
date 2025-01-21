// import { createContext, useState, useEffect } from "react";

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedTheme = localStorage.getItem("theme");

//       if (storedTheme) {
//         setTheme(storedTheme);
//       } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
//         setTheme("dark");
//         localStorage.setItem("theme", "dark");
//       } else {
//         setTheme("light");
//         localStorage.setItem("theme", "light");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (theme) {
//       localStorage.setItem("theme", theme);
//       document.body.classList.remove("light", "dark");
//       document.body.classList.add(theme);
//     }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default state is 'light' instead of null
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");

      // Use stored theme if it exists, otherwise default to "light"
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        // Only needed if you want to immediately store the default in localStorage
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme);
      document.body.classList.remove("light", "dark");
      document.body.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
