let selectedText = '';

document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection() {
  selectedText = window.getSelection().toString().trim();
  console.log('Selected text:', selectedText);
}

function saveSelection() {
  showLoadingSpinner();
  console.log('saveSelection function called');
  console.log('Selected text:', selectedText);
  const source = window.location.href;

  chrome.runtime.sendMessage({
    action: 'saveQuote',
    data: {
      text: selectedText,
      source: source
    }
  }, response => {
    hideLoadingSpinner();
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      showNotification('收藏失败，请重试');
    } else if (response && response.success) {
      showNotification('收藏成功');
    } else {
      showNotification('收藏失败，请重试');
    }
  });
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.id = 'save-notification';
  notification.className = 'notification';

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.onclick = () => document.body.removeChild(notification);

  notification.appendChild(closeButton);
  document.body.appendChild(notification);

  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 2000);
}

function showLoadingSpinner() {
  const spinner = document.createElement('div');
  spinner.id = 'loading-spinner';
  document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    document.body.removeChild(spinner);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'saveSelection') {
    saveSelection();
    sendResponse({ success: true });
  }
});

console.log('Content script loaded');