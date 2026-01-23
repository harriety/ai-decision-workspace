import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const showBootError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = `<pre style="padding:16px;color:#b00020;">${message}</pre>`;
};

window.addEventListener('error', event => {
  showBootError(event.error || event.message);
});

window.addEventListener('unhandledrejection', event => {
  showBootError(event.reason);
});

try {
  createRoot(root).render(<App />);
} catch (error) {
  console.error(error);
  showBootError(error);
}
