
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Try to find the mount point used in LuCI first, then fallback to local dev 'root'
const rootElement = document.getElementById('mybaby-root') || document.getElementById('root');

if (!rootElement) {
  console.error("Could not find root element to mount to (looked for 'mybaby-root' and 'root')");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
