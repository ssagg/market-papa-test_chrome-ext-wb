let resp;

document.onreadystatechange = () => {
  if (document.readyState == "complete") {
    console.log("completed");
    initapp();
    chrome.runtime.sendMessage({ command: "getUrl" }, (response) => {
      resp = response;
      console.log(resp);
    });
  }
};

function addItem(stock, qty, days, hours) {
  const table = document.querySelector(".table");
  const item = document.createElement("div");
  item.classList.add("rows");
  const stockName = document.createElement("p");
  const qtyOnStocks = document.createElement("p");
  const deliveryTime = document.createElement("p");

  table.appendChild(item);
  item.appendChild(stockName).textContent = `${stock}:`;
  item.appendChild(qtyOnStocks).textContent = `${qty} шт.`;
  item.appendChild(deliveryTime).textContent = `${days} д. ${hours} ч.`;
}

// removing old blocks on refresh
function removeOldBlocks() {
  const list = document.querySelectorAll(".injected-block");
  for (const element of list) {
    element.remove();
  }
}

function initapp() {
  let stores;
  let indexUrl = window.location.href;
  let id = indexUrl.match(/\/(\d+)+[\/]?/);
  const storesDataUrl =
    "https://static-basket-01.wb.ru/vol0/data/stores-data.json";
  const url = `https://card.wb.ru/cards/detail?appType=1&curr=rub&appType=1&curr=rub&dest=-1257786&spp=32&nm=${id[1]}`;

  console.log(id);
  //toDo
  let wbRegex;
  let stockRegex;

  fetch(storesDataUrl)
    .then((resp) => resp.json())
    .then((resp) => {
      return (stores = resp);
    })
    .catch((error) => console.log(error));

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      let article = document.querySelector(".product-page__aside-sticky");
      if (article) {
        if (document.querySelectorAll(".injected-block")) {
          removeOldBlocks();
        }

        // create SPP block
        const spp = document.createElement("div");
        spp.classList.add(
          "product-page__seller-wrap",
          "section-border",
          "injected-block"
        );

        // create SPP -internal wrapper and header
        const wrapperSpp = document.createElement("div");
        wrapperSpp.classList.add("seller-info__header", "block__header");
        wrapperSpp.textContent = `Скидка постоянного покупателя`;
        const headerSpp = document.createElement("div");
        headerSpp.classList.add("block__title");
        headerSpp.textContent = `До СПП:  ${
          data.data.products[0].extended?.basicPriceU / 100 ||
          data.data.products[0].priceU / 100 ||
          0
        } р. / СПП: ${
          data.data.products[0].extended?.clientSale || 0

          // (
          //   100 -
          //   ((data.data.products[0].extended?.basicPriceU / 100) * 100) /
          //     (data.data.products[0].salePriceU / 100)
          // ).toFixed(2)
        } %`;

        //create new block
        const block = document.createElement("div");
        block.classList.add(
          "product-page__seller-wrap",
          "section-border",
          "injected-block"
        );
        // create blcok - internal wrapper and header
        const wrapper = document.createElement("div");
        wrapper.classList.add("seller-info__header", "block__header");
        wrapper.textContent = `Остатки на складах`;
        const header = document.createElement("div");
        header.classList.add("block__title");
        header.textContent = `Доставка со склада - ${stores
          .map((store) => {
            if (store.id === data.data.products[0].wh) return store.name;
          })
          .join("")} за ${Math.floor(
          (data.data.products[0].time1 + data.data.products[0].time2) / 24
        )} д. ${
          (data.data.products[0].time1 + data.data.products[0].time2) % 24
        } ч.`;

        //table with stocks
        const table = document.createElement("div");
        table.className = "table";

        //adding spp on page
        article.prepend(spp);
        spp.append(wrapperSpp);
        wrapperSpp.append(headerSpp);
        //adding stocks on page
        article.prepend(block);
        block.append(wrapper);
        wrapper.append(header);
        header.append(table);

        data.data.products[0].sizes[0].stocks.map((element) => {
          const storeName = stores
            .map((store) => {
              console.log(element.wh);
              if (store.id === element.wh) return store.name;
            })
            .join("");

          addItem(
            storeName,
            element.qty,
            (days = Math.floor((element.time1 + element.time2) / 24)),
            (hours = (element.time1 + element.time2) % 24)
          );

          console.log(element);
        });
      }
    })
    .catch((error) => console.log(error));
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "restartContentScript") {
    console.log("restart");
    initapp();
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "getUrl") {
    console.log("get url");
  }
});
