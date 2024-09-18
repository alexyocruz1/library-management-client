import { createGlobalStyle } from 'styled-components';
import { tokens } from './tokens';
import { colors } from './colors';

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
    font-family: 'KidsFont', sans-serif !important;
    font-size: ${tokens.fontSize.base};
    background-image: url('/images/kids-background.jpg');
    background-size: cover;
    background-attachment: fixed;
    background-position: center;
    min-height: 100vh;
    color: ${colors.text};
  }

  h1, h2, h3, h4, h5, h6, .ui.header {
    font-family: 'KidsFont', sans-serif !important;
    color: ${colors.primary} !important;
  }

  button, input, textarea, select, .ui.button, .ui.input > input, .ui.dropdown, .ui.menu, .ui.label {
    font-family: 'KidsFont', sans-serif !important;
  }

  .ui.card > .content > .header {
    font-family: 'KidsFont', sans-serif !important;
    color: ${colors.primary} !important;
  }

  .ui.card > .content > .description {
    color: ${colors.text} !important;
  }

  .ui.card > .extra {
    color: ${colors.lightText} !important;
  }

  .ui.pagination.menu .item {
    font-family: 'KidsFont', sans-serif !important;
  }

  .ui.message {
    font-family: 'KidsFont', sans-serif !important;
  }

  a {
    color: ${colors.secondary};
    &:hover {
      color: ${colors.primary};
    }
  }
`;
