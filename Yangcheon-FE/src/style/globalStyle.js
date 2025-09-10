//GlobalStyle.js
import { createGlobalStyle } from "styled-components";

// reset.css
export const GlobalStyle = createGlobalStyle`

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
  display: block;
}
body {
  line-height: 1;
}
ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}

input[type="date"] {
  font-size: 1rem;
}

input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.4); /* 아이콘 컬러 조정 옵션 */
}


body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

// box-sizing 적용
* {
  box-sizing: border-box;
}

a {
  text-decoration: none;
  color: inherit;
}

div::-webkit-scrollbar {
        width: 0.5rem;
        height: 0.5rem;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(78, 185, 96); /* 스크롤바 색상 */
        border-radius: 10px; /* 스크롤바 둥근 테두리 */
      }
      &::-webkit-scrollbar-button:end:increment {
        /*  스크롤의 화살표가 포함된 영역   */
        display:block;
        height:8px;
        background-color: 0;
      }

`;

export default GlobalStyle;
