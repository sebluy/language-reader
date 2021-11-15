// preload.js

const SideBar = require('./side-bar');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => new SideBar())