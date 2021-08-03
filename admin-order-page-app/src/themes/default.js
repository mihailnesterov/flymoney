import { ThemeProvider } from "styled-components";

// как работать с темами - 
// https://dev.to/aromanarguello/how-to-use-themes-in-styled-components-49h

const theme = {
    colors: {
        white: "#ffffff",
        light: "#e0e0e0",
        dark: "#666666",
        black: "#000000",
        green: "#91D110",
        blue: "#82C8EE",
        yellow: "#FDDB03",
        red: "#F8BAB6",
        gray: "#DBD9D9",
        transparent: "transparent",
        processing: '#F2FAFF',
        paid: '#F5FFDF',
        hold: '#FFFEF2',
        cancelled: '#FA9D96',
        refunded: '#EEEBEB',
        badge: '#48C6D9'
    },
    sizes: {
        none: 0,
        xsmall: "0.25rem",
        small: "0.5rem",
        medium: "1rem",
        large: "1.5rem",
        xlarge: "2rem"
    },
    fontWeight: {
        normal: "normal",
        lighter: "lighter",
        bolder: "bolder",
        bold: "bold"
    },
    shadow: {
        xsmall: "1px 1px 1px rgba(0,0,0,0.05)",
        small: "2px 2px 2px rgba(0,0,0,0.05)",
        medium: "4px 4px 4px rgba(0,0,0,0.1)",
        around: "1px 1px 4px rgba(0,0,0,0.15)"
    },
    display: {
        flex: 'flex',
        block: 'block',
        none: 'none'
    },
    flex: {
        one:1,
        two:2,
        three:3,
        four:4,
        five:5
    },
    alignItems: {
        center: 'center',
        start: 'flex-start',
        end: 'flex-end'
    },
    justifyContent: {
        start: 'flex-start',
        end: 'flex-end',
        center: 'center',
        between: 'space-between',
        around: 'space-around'
    },
    flexWrap: {
        wrap: 'wrap',
        noWrap: 'no-wrap',
    },
    textAlign: {
        center: 'center',
        left: 'left',
        right: 'right',
        justify: 'justify'
    },
    borderRadius: {
        none: 0,
        xsmall: "5px",
        small: "10px",
        medium: "20px",
        large: "50px",
        xlarge: "100px"
    }
};

const Theme = ({ children }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;