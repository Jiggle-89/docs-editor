// preload.cjs

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Test function to verify IPC communication
  testIpc: () => ipcRenderer.invoke('test-ipc'),
  
  // הפונקציה הזו כבר קיימת
  getSiderContent: () => ipcRenderer.invoke('get-sider-content'),

  // =================================================================
  // ===== הוספנו את השורה הזו ======================================
  // =================================================================
  getPageContent: (pageName) => ipcRenderer.invoke('get-page-content', pageName),
  // הפונקציה החדשה מקבלת 'payload' (אובייקט עם כל הנתונים) ומעבירה אותו
  publishChanges: (payload) => ipcRenderer.invoke('publish-changes', payload),
  

});
