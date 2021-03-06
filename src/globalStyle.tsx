import { createGlobalStyle } from 'styled-components';
const webFontUrl = require('./resources/BMHANNAPro.woff');

export default createGlobalStyle`
  *, ::before, ::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @font-face {
    font-family: 'BMHANNAPro';
    src: url('${webFontUrl}') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  img,
  video,
  canvas {
    max-width: 100%;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    font-size: 0.69vmax;
  }

  html,
  body {
    width: 100%;
    height: 100%;
  }

  @keyframes body-background-pattern {
    from {
      background-position-y: 0;
    }

    to {
      background-position-y: 57px;
    }
  }

  body {
    font-family: 'BMHANNAPro', sans-serif;
    position: relative;
    background-color: #ffa800;
    background-size: 57px 57px;
    background-image: repeating-linear-gradient(-45deg,
        transparent,
        transparent 20px,
        rgba(255, 255, 255, 0.3) 20px,
        rgba(255, 255, 255, 0.3) 40px);
    animation: 1s body-background-pattern infinite linear;
    border: 1rem solid #000;
    overflow: hidden;
  }

  button {
    background-color: transparent;
    border: 0;
    cursor: pointer;
  }

  #root {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  video,
  canvas {
    transform: translate3d(0, -50%, 0) scaleX(-1);
    position: absolute;
    width: 100%;
    height: auto;
    top: 50%;
    left: 0;
    pointer-events: none;
    clip-path: inset(2.5rem);
  }

  video {
    z-index: -1;
    filter: brightness(1.1);
  }

  canvas {
    z-index: 15;
    opacity: 0.5;
  }
`;
