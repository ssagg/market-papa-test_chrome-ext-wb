chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.url) {
    //for future use - dynamically getting url from requests intercepter
    // console.log(message.url);
    // let mainUrl = message.url;
  }
});

//reserv start
document.onreadystatechange = () => {
  if (document.readyState == "complete") {
    console.log("completed");
    initapp();
  }
};

function addItem(stock, qty, sz, days, hours) {
  const table = document.querySelector(".block__table");
  const item = document.createElement("div");

  const stockName = document.createElement("p");
  const qtyOnStocks = document.createElement("p");
  const deliveryTime = document.createElement("p");
  if (sz) {
    itemSize = document.createElement("p");
    itemSize.classList.add("rows__size");
    item.classList.add("rows__size-column");
  } else null;
  item.classList.add("rows");
  qtyOnStocks.classList.add("rows__qty");

  table.appendChild(item);
  item.appendChild(stockName).textContent = `${stock}:`;
  item.appendChild(qtyOnStocks).textContent = `${qty} шт.`;
  if (sz) {
    item.appendChild(itemSize).textContent = `р. ${sz}`;
  }
  item.appendChild(deliveryTime).textContent = `${days} д. ${hours} ч.`;
}

// removing old blocks on refresh
function removeOldBlocks() {
  const oldBlocks = document.querySelectorAll(".injected-block");
  for (const element of oldBlocks) {
    element.remove();
  }
}

async function initapp(mainUrl) {
  let stores;
  let indexUrl = window.location.href;
  let id = indexUrl.match(/\/(\d+)+[\/]?/);
  const storesDataUrl =
    "https://static-basket-01.wb.ru/vol0/data/stores-data.json";
  const url = `https://card.wb.ru/cards/detail?appType=1&curr=rub&appType=1&curr=rub&dest=-1257786&spp=32&nm=${id[1]}`;

  await fetch(storesDataUrl)
    .then((resp) => resp.json())
    .then((resp) => {
      return (stores = resp);
    })
    .catch((error) => console.log(error));

  await fetch(url, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      let targetBlock = document.querySelector(".product-page__aside-sticky");
      if (targetBlock) {
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

        // create SPP block -internal wrapper and header
        const wrapperSpp = document.createElement("div");
        wrapperSpp.classList.add("seller-info__header", "block__header");
        wrapperSpp.textContent = `Скидка постоянного покупателя`;

        const headerSpp = document.createElement("div");
        headerSpp.classList.add("block__title");
        headerSpp.textContent = `Цена до СПП:  ${
          data.data.products[0].extended?.basicPriceU / 100 ||
          data.data.products[0].priceU / 100 ||
          0
        } р. / СПП: ${data.data.products[0].extended?.clientSale || 0} %`;

        //create warehouse stocks block
        const block = document.createElement("div");
        block.classList.add(
          "product-page__seller-wrap",
          "section-border",
          "injected-block"
        );
        // create warehouse stocks block - internal wrapper and header
        const wrapper = document.createElement("div");
        wrapper.classList.add("seller-info__header", "block__header");
        wrapper.textContent = `Остатки на складах`;
        const header = document.createElement("div");
        header.classList.add("block__title");
        header.textContent = `Доставят из - ${stores
          .map((store) => {
            if (store.id === data.data.products[0].wh)
              return store.name.replace(" WB", "");
          })
          .join("")} за ${Math.floor(
          (data.data.products[0].time1 + data.data.products[0].time2) / 24
        )} д. ${
          (data.data.products[0].time1 + data.data.products[0].time2) % 24
        } ч.`;

        //table with stocks
        const table = document.createElement("div");
        table.className = "block__table";

        //adding spp on page
        targetBlock.prepend(spp);
        spp.append(wrapperSpp);
        wrapperSpp.append(headerSpp);
        //adding stocks on page
        targetBlock.prepend(block);
        block.append(wrapper);
        wrapper.append(header);
        header.append(table);

        data.data.products[0].sizes.map((size) => {
          let sz = size.name;
          size.stocks.map((stock) => {
            const storeName = stores
              .map((store) => {
                if (store.id === stock.wh) return store.name.replace(" WB", "");
              })
              .join("");

            addItem(
              storeName,
              stock.qty,
              sz,
              (days = Math.floor((stock.time1 + stock.time2) / 24)),
              (hours = (stock.time1 + stock.time2) % 24)
            );
          });
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
