/**
 * @module index
 */

import App from './App';
import '@ant-design/v5-patch-for-react-19';
import { createRoot } from 'react-dom/client';

const app = document.getElementById('app')!;
const root = createRoot(app);

root.render(<App />);
