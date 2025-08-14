// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';         // ← import Provider
import { store } from './redux/store';          // ← import your store
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>                      {/* ← wrap App in Provider */}
    <App />
  </Provider>
);
