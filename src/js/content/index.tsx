import { ConfigProvider } from 'antd';
import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.createElement('x-qrcode');

const shadowRoot = app.attachShadow({ mode: 'closed' });

const root = createRoot(shadowRoot);

document.body.appendChild(app);

root.render(
  <ConfigProvider getPopupContainer={() => app} getTargetContainer={() => app}>
    <App />
  </ConfigProvider>
);
