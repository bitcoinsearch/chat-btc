import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  colors: {
    brand: {
      bg50: "#0D2333",
      bg100: "#102E44",
      bg_base_purple: "#24243e"
    },
    link: {
      400: "#78A9FF"
    },
    button: {
      primary: "#0F62FE",
      tertiary: "#C6C6C6",
      "accent.50": "rgba(198, 198, 198, .4)",
      "accent.100": "rgba(198, 198, 198, 1)"
    },
  },
  config,
});

export default theme;
