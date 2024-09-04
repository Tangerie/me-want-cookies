const onLoad = async (tabId) => {
  const stores = await chrome.cookies.getAllCookieStores();
  const store = stores.find(x => x.tabIds.includes(tabId));

  if(!store) return;

  const cookies = (await chrome.cookies.getAll({
    storeId: store.id
  })).filter(x => x.domain === "thecavillgroup.agentboxcrm.com.au");
  
  const cookieStr = cookies.map(x => x.name + "=" + x.value).join("; ");
  const csrf = cookies.find(x => x.name == "_csrf")?.value;
  await chrome.scripting.executeScript({
    target: {
      tabId
    },
    func: (cookieStr, csrf) => {
      document.head.setAttribute("__cookie", cookieStr);
      document.head.setAttribute("__csrf", csrf);
    },
    args: [ cookieStr, csrf ]
  })
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active && tab.url.startsWith("https://thecavillgroup.agentboxcrm.com.au")) {
    onLoad(tabId);
  }
});
