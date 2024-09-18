import { createGlobalStyle } from 'styled-components';
import { colors } from './colors';
import { tokens } from './tokens';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'KidsFont';
    src: url('/fonts/half-term-schools-out-font/HalfTermSchoolsOut-V4q5l.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: 'KidsFont', sans-serif;
    font-size: ${tokens.fontSize.base};
    background-image: url('/images/kids-background.jpg');
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    min-height: 100vh;
  }

  button, input, textarea, select, .ui.pagination.menu, .ui.pagination.menu .item {
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.base};
  }
`;
