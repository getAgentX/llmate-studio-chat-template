/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        link: {
          DEFAULT: "var(--link)",
        },

        hover: {
          DEFAULT: "var(--hover)",
        },

        page: "var(--bg-page)",
        "page-light": "var(--bg-page-light)",
        "page-hover": "var(--bg-page-hover)",
        "page-selected": "var(--bg-page-selected)",

        primary: "var(--bg-primary)",
        "primary-hover": "var(--bg-primary-hover)",
        "primary-selected": "var(--bg-primary-selected)",

        "secondary-bg": "var(--bg-secondary)",
        "secondary-hover-bg": "var(--bg-secondary-hover)",
        "secondary-selected-bg": "var(--bg-secondary-selected)",

        "active-bg": "var(--active-bg)",
        "active-text": "var(--active-text)",
        "active-border": "var(--active-border)",
        "active-icon": "var(--active-icon)",
        "active-bg-hover": "var(--active-bg-hover)",

        "primary-text": "var(--text-primary)",
        "secondary-text": "var(--text-secondary)",
        "label-text": "var(--text-label)",

        "btn-primary": "var(--btn-primary-bg)",
        "btn-primary-hover": "var(--btn-primary-hover)",
        "btn-primary-text": "var(--btn-primary-text)",
        "btn-primary-icon": "var(--btn-primary-icon)",
        "btn-primary-disable": "var(--btn-primary-disable-bg)",
        "btn-primary-disable-text": "var(--btn-primary-disable-text)",

        "btn-secondary-bg": "var(--btn-secondary-bg)",
        "btn-secondary-hover": "var(--btn-secondary-hover)",
        "btn-secondary-text": "var(--btn-secondary-text)",
        "btn-secondary-text-hover": "var(--btn-secondary-text-hover)",
        "btn-secondary-icon": "var(--btn-secondary-icon)",
        "btn-secondary-disable-bg": "var(--btn-secondary-disable-bg)",
        "btn-secondary-disable-text": "var(--btn-secondary-disable-text)",

        "btn-primary-outline": "var(--btn-primary-outline)",
        "btn-primary-outline-bg": "var(--btn-primary-outline-bg)",
        "btn-primary-outline-text": "var(--btn-primary-outline-text)",
        "btn-primary-outline-hover": "var(--btn-primary-outline-hover)",
        "btn-primary-outline-icon": "var(--btn-primary-outline-icon)",
        "btn-primary-outline-disable": "var(--btn-primary-outline-disable)",
        "btn-primary-outline-disable-text":
          "var(--btn-primary-outline-disable-text",

        "btn-normal-text": "var(--btn-normal-text)",
        "btn-normal-icon": "var(--btn-normal-icon)",
        "btn-normal-hover": "var(--btn-normal-hover)",
        "btn-normal-active": "var(--btn-normal-active)",
        "btn-normal-disable": "var(--btn-normal-disable)",

        "link-primary-color": "var(--link-primary-color)",
        "link-primary-hover": "var(--link-primary-hover)",
        "link-primary-disable-color": "var(--link-primary-disable-color)",

        "link-secondary-color": "var(--link-secondary-color)",
        "link-secondary-hover": "var(--link-secondary-hover)",
        "link-secondary-disable-color": "var(--link-secondary-disable-color)",
        "range-slider": "var(--range-slider)",

        modal: "var(--modal-bg)",
        "modal-overlay": "var(--modal-overlay)",

        "border-color": "var(--border-color)",
        "border-hover-color": "var(--border-hover-color)",
        "outline-color": "var(--outline-color)",
        "border-active-color": "var(--border-active-color)",
        "border-box-color": "var(--border-box-color)",

        "input-bg": "var(--input-bg)",
        "input-bg-hover": "var(--input-bg-hover)",
        "input-bg-focus": "var(--input-bg-focus)",
        "input-bg-disabled": "var(--input-bg-disabled)",
        "input-icon": "var(--input-icon)",

        "input-border": "var(--input-border)",
        "input-border-hover": "var(--input-border-hover)",
        "input-border-focus": "var(--input-border-focus)",
        "input-border-disabled": "var(--input-border-disabled)",

        "input-text": "var(--input-text)",
        "input-text-inactive": "var(--input-text-inactive)",
        "input-placeholder": "var(--input-text-placeholder)",
        "input-disabled": "var(--input-text-disabled)",

        "input-error-bg": "var(--input-error-bg)",
        "input-error-text": "var(--input-error-text)",
        "input-success-bg": "var(--input-success-bg)",
        "input-success-text": "var(--input-success-text)",
        "input-error-border": "var(--input-error-border)",

        "icon-color": "var(--icon-color)",
        "icon-color-hover": "var(--icon-color-hover)",
        "icon-color-disabled": "var(--icon-color-disabled)",
        "icon-bg-hover": "var(--icon-bg-hover)",

        "icon-selected-bg": "var(--icon-selected-bg)",
        "icon-selected-color": "var(--icon-selected-color)",
        "icon-selected-border": "var(--icon-selected-border)",

        "tabs-text": "var(--tabs-text)",
        "tabs-icon": "var(--tabs-icon)",
        "tabs-hover": "var(--tabs-hover)",
        "tabs-active": "var(--tabs-active)",
        "tabs-border": "var(--tabs-border)",

        "dropdown-bg": "var(--dropdown-bg)",
        "dropdown-text": "var(--dropdown-text)",
        "dropdown-hover": "var(--dropdown-hover)",
        "dropdown-active": "var(--dropdown-active)",
        "dropdown-border": "var(--dropdown-border)",
        "dropdown-icon": "var(--dropdown-icon)",
        "dropdown-icon-bg": "var(--dropdown-icon-bg)",
        "tags-text": "var(--tags-text)",
        "tags-bg": "var(--tags-bg)",
        "toggle-circle": "var(--toggle-circle)",
        "toggle-circle-bg": "var(--toggle-circle-bg)",
        "toggle-bg-color": "var(--toggle-bg-color)",
        "toggle-bg-disable": "var(--toggle-bg-disable)",
        "workspace-icon-bg": "var(--workspace-icon-bg)",
        "user-prompt-bg": "var(--user-prompt-bg)",
        "user-icon": "var(--user-icon)",
        "main-icon-color": "var(--main-icon-color)",
        "main-icon-color-bg": "var(--main-icon-color-bg)",
        "bot-icon-bg": "var(--bot-icon-bg)",
        "icon-secondary": "var(--icon-secondary)",
        "icon-secondary-bg": "var(--icon-secondary-bg)",
        "icon-fill-color": "var(--icon-fill-color)",
        "icon-fill-color-disabled": "var(--icon-fill-color-disabled)",
        "page-new": "var(--bg-page-new)",
        "assistant-icon-color": "var(--assistant-icon)",
        "home-icon": "var(--home-icon)",
        "label-hover": "var(--label-hover)",
        "version-bg": "var(--version-bg)",
        "version-text": "var(--version-text)",
        "upgrade-plan-bg": "var(--upgrade-plan-bg)",
        "upgrade-plan-text": "var(--upgrade-plan-text)",
      },

      fontFamily: {
        inter: ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },

      screens: {
        xsm: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
