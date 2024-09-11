const onLoad = async (tabId, domain) => {
  const stores = await chrome.cookies.getAllCookieStores();
  const store = stores.find(x => x.tabIds.includes(tabId));

  if(!store) return;

  const cookies = (await chrome.cookies.getAll({
    storeId: store.id
  })).filter(x => x.domain === domain);
  
  const cookieStr = cookies.map(x => x.name + "=" + x.value).join("; ");
  let csrf = "";
  if(domain == "thecavillgroup.agentboxcrm.com.au") {
    csrf = cookies.find(x => x.name == "_csrf")?.value;
  } else if (domain == "rpp.corelogic.com.au") {
    csrf = cookies.find(x => x.name == "APP2SESSION-XSRF")?.value;
  }
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
  if (changeInfo.status == 'complete' && tab.active) {
    if(tab.url.startsWith("https://thecavillgroup.agentboxcrm.com.au")) {
      onLoad(tabId, "thecavillgroup.agentboxcrm.com.au");
    } else if(tab.url.startsWith("https://rpp.corelogic.com.au")) {
      onLoad(tabId, "rpp.corelogic.com.au");
    }
  }
});