// AIForm Browser Extension Background Script

// 扩展安装或启动时的处理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AIForm扩展已安装/更新', details);
  
  // 设置默认配置
  chrome.storage.sync.set({
    apiKey: '',
    apiUrl: '',
    provider: 'openai',
    autoSave: true,
    enableHistory: true
  });
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  switch (request.action) {
    case 'getConfig':
      // 获取配置
      chrome.storage.sync.get(['apiKey', 'apiUrl', 'provider'], (result) => {
        sendResponse(result);
      });
      return true; // 表示异步响应
      
    case 'saveConfig':
      // 保存配置
      chrome.storage.sync.set(request.data, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ error: '未知操作' });
  }
});

// 处理扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  // 打开设置页面或执行其他操作
  chrome.tabs.create({
    url: chrome.runtime.getURL('popup.html')
  });
});

console.log('AIForm扩展后台脚本已加载'); 