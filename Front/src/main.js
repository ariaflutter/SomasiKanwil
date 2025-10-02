// @ts-nocheck
import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('../public/sw.js')
      .then(reg => console.log('✅ Service Worker registered:', reg))
      .catch(err => console.log('❌ Service Worker failed:', err));
  });
}