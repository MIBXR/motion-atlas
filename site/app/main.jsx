import { createRoot } from 'react-dom/client';
import { ToastStack, ToastStackProvider } from './components/ui';
import { PreferencesProvider } from './state/preferences';
import { App } from './App';
import './arc/registry/foundation.css';
import './styles/theme.css';
import './styles/shell.css';
createRoot(document.getElementById('app')).render(
  <ToastStackProvider duration={3e3}>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
    <ToastStack label="操作提示" position="bottom-center" />
  </ToastStackProvider>,
);
