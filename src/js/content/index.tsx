import App from './App';
import { createRoot } from 'react-dom/client';

const app = document.createElement('div');

const shadowRoot = app.attachShadow({ mode: 'closed' });

const root = createRoot(shadowRoot);

root.render(<App />);
