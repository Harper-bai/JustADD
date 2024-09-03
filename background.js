console.log('Background script loaded');

// 检查并创建右键菜单项
chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: "saveSelection",
    title: "收藏选中文本",
    contexts: ["selection"]
  });
});

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  if (info.menuItemId === "saveSelection") {
    chrome.tabs.sendMessage(tab.id, { action: "saveSelection" }, (response) => {
      console.log('Response from content script:', response);
    });
  }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  if (command === "save-selection") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "saveSelection" }, (response) => {
          console.log('Response from content script:', response);
        });
      }
    });
  }
});

// 处理来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  if (request.action === 'saveQuote') {
    chrome.storage.sync.get('quotes', (data) => {
      const quotes = data.quotes || [];
      const formattedQuote = `${request.data.text}；${request.data.source}`;
      quotes.push({ text: request.data.text, formattedQuote: formattedQuote });
      chrome.storage.sync.set({ quotes: quotes }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ success: false });
        } else {
          console.log('Quote saved:', request.data);
          sendResponse({ success: true });
        }
      });
    });
    return true; // 异步响应
  }
});

// 可选：扩展安装或更新时的初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated');
  // 这里可以添加一些初化代码，比如设置默认选项等
});

// 可选：监听标页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tab.url);
    // 这里可以添加一些在页面加载完成后执行的代码
  }
});