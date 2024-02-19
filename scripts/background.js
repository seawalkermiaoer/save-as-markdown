// 创建右键菜单
chrome.contextMenus.create({
  id: "save_to_local",
  contexts: ['all'],
  title: "Save to Local",
  documentUrlPatterns: ["<all_urls>"], // 限制菜单选项仅应用于URL匹配给定模式之一的页面

});


async function onSaveClick(data) {
  //获取当前打开的tab
  console.log('onSaveClick');
  (async () => {
    //获取当前的tab页面
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "save", url: tab.url });
  })();

};


//event from content script.
chrome.contextMenus.onClicked.addListener(function (data) {
  if (data.menuItemId == 'save_to_local') {
    onSaveClick(data)
  }
});



// open option page.
chrome.notifications.onButtonClicked.addListener((notificationId) => {
  switch (notificationId) {
    case "overTheLimit":
      chrome.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});