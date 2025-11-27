import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress common ResizeObserver loop limit exceeded error which is benign
const originalError = console.error;
console.error = (...args) => {
  if (/ResizeObserver loop/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'Script error.') {
    e.stopImmediatePropagation();
    return;
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);