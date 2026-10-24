// CheatGradient - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'cg_make_gradient',
    title: '🌈 CheatGradient ile Renklendir',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'cg_make_gradient' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'context_menu_gradient',
      text: info.selectionText
    }).catch(() => {
      // In case content script is not injected on this page yet
    });
  }
});
