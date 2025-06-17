// AIForm Browser Extension Popup Script

interface AIFormConfig {
  apiKey: string;
  apiUrl: string;
  provider: string;
  autoSave: boolean;
  enableHistory: boolean;
}

// DOM元素
let apiKeyInput: HTMLInputElement;
let apiUrlInput: HTMLInputElement;
let providerSelect: HTMLSelectElement;
let autoSaveCheckbox: HTMLInputElement;
let enableHistoryCheckbox: HTMLInputElement;
let saveButton: HTMLButtonElement;
let statusDiv: HTMLDivElement;

// 初始化popup界面
function initPopup() {
  // 获取DOM元素
  apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
  providerSelect = document.getElementById('provider') as HTMLSelectElement;
  autoSaveCheckbox = document.getElementById('autoSave') as HTMLInputElement;
  enableHistoryCheckbox = document.getElementById('enableHistory') as HTMLInputElement;
  saveButton = document.getElementById('saveButton') as HTMLButtonElement;
  statusDiv = document.getElementById('status') as HTMLDivElement;

  // 加载当前配置
  loadConfig();

  // 绑定事件
  saveButton.addEventListener('click', saveConfig);
}

// 加载配置
function loadConfig() {
  chrome.storage.sync.get(['apiKey', 'apiUrl', 'provider', 'autoSave', 'enableHistory'], (result) => {
    if (apiKeyInput) apiKeyInput.value = result.apiKey || '';
    if (apiUrlInput) apiUrlInput.value = result.apiUrl || '';
    if (providerSelect) providerSelect.value = result.provider || 'openai';
    if (autoSaveCheckbox) autoSaveCheckbox.checked = result.autoSave !== false;
    if (enableHistoryCheckbox) enableHistoryCheckbox.checked = result.enableHistory !== false;
  });
}

// 保存配置
function saveConfig() {
  const config: AIFormConfig = {
    apiKey: apiKeyInput.value.trim(),
    apiUrl: apiUrlInput.value.trim(),
    provider: providerSelect.value,
    autoSave: autoSaveCheckbox.checked,
    enableHistory: enableHistoryCheckbox.checked
  };

  chrome.storage.sync.set(config, () => {
    // 显示成功消息
    showStatus('配置已保存', 'success');
    
    // 通知content script配置已更新
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id!, { action: 'configUpdated', data: config });
      }
    });
  });
}

// 显示状态消息
function showStatus(message: string, type: 'success' | 'error') {
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', initPopup);

console.log('AIForm扩展popup脚本已加载'); 