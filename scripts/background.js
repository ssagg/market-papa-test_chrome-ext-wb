console.log("service worker is online");

chrome.webRequest.onCompleted.addListener(
  function (details) {
    const response = details;
    console.log("requests receiving");
    console.log(response.url);
    if (response.url.startsWith("https://card.wb.ru/cards/detail?appType=")) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { url: response.url });
      });
    }
  },
  {
    urls: [
      "https://www.wildberries.ru/*",
      "https://wildberries.ru/*",
      "https://static-basket-01.wb.ru/*",
      "https://card.wb.ru/cards/*",
    ],
  },
  ["responseHeaders"]
);

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  if (change.status == "complete") {
    console.log("observing changes in tabs");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.includes("wildberries.ru/catalog")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "restartContentScript" });
      }
    });
  }
});
