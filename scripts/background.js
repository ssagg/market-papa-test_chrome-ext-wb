console.log("service worker");

// Create an object to store ongoing requests and their responses
const ongoingRequests = {};

chrome.webRequest.onCompleted.addListener(
  function (details) {
    // Check if the request is part of an ongoing request
    // if (details.requestId in ongoingRequests) {
    // Process the response here
    const response = details;
    console.log("works");
    console.log(response);
    console.log(response.url);
    // Store or process the response as needed
    // For example, log the response data
    if (response.url.includes("card.wb.ru/cards")) {
      console.log(`Response received from URL: ${response.url}`);
      return response.url;
    }

    // If you need to notify your content script or popup, send a message
    // chrome.runtime.sendMessage({ response: response.responseText });
    // }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.command === "getUrl") {
    sendRequest(response.url).then((response) => {
      sendResponse(response);
    });
  }
});

async function sendRequest(url) {
  var data;
  await fetch(url)
    .then((response) => response.text())
    .then((response) => {
      data = JSON.parse(response);
    });
  return data;
}

// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     // Check if this is the first response for the request
//     if (!(details.requestId in ongoingRequests)) {
//       ongoingRequests[details.requestId] = details;
//     }
//   },
//   { urls: ["<all_urls>"] },
//   ["requestHeaders"]
// );

// You can add an onCompleted listener to clear completed requests if needed
// chrome.webRequest.onCompleted.addListener(
//   function (details) {
//     if (details.requestId in ongoingRequests) {
//       delete ongoingRequests[details.requestId];
//     }
//   },
//   { urls: ["<all_urls>"] },
//   ["responseHeaders"]
// );

// chrome.runtime.onMessageExternal.addListener(
//   async (request, sender, sendResponse) => {
//     console.log("🔰 Message From Injected Script 🔰");
//     console.log(request);
//     if (request.message == "Intercepted Request Response") {
//       console.log(request.Intercepted_response);
//       sendResponse("done");
//     }
//   }
// );

// chrome.webRequest.onCompleted.addListener(
//   function (details) {
//     console.log("Det: " + details.requestId);
//     console.log("Response received from URL: " + details.url);
//     console.log("Response data: " + details.responseText); // Access the response text
//     console.log(details.responseBody);
//     if (details.url === "https://card.wb.ru/cards/v1/detail?appType*") {
//       // Request completed, parse the response
//       fetch(details.url)
//         .then((response) => response.json())
//         .then((data) => {
//           // Do something with the parsed data
//           console.log(data);
//         })
//         .catch((error) => {
//           console.error(error);
//         });
//     }
//   },
//   { urls: ["<all_urls>"] }, // Match all URLs
//   ["responseHeaders"]
// );

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.status === "complete") {
//     chrome.scripting
//       .executeScript({
//         target: { tabId: tabId },
//         files: ["content.js"],
//       })
//       .then(() => console.log("script injected"));
//   }
// });

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  if (change.status == "complete") {
    console.log("I see changes in tabs");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "restartContentScript" });
    });
  }
});

// chrome.webNavigation.onCompleted.addListener((details) => {
//   console.log("loaded baend");
// });
