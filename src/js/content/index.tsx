/**
 * @module index
 */

import App from './App';
import { createRoot } from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';

const app = document.createElement('x-qrcode');
const shadowRoot = app.attachShadow({ mode: 'closed' });
const root = createRoot(shadowRoot);

document.body.append(app);

root.render(
  <StyleProvider container={shadowRoot}>
    <App />
  </StyleProvider>
);
