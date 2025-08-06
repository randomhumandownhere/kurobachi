import React from "react";
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const pluginTagId = 'extension-root';
const existingInstance = document.getElementById('extension-root');
if (existingInstance) {
  console.log('existing instance found, removing');
  existingInstance.remove();
}
