(()=>{"use strict";const e=document.getElementById("stage");chrome.tabs.query({active:!0,currentWindow:!0},(([t])=>{chrome.runtime.sendMessage({data:t.url,action:"GetQRCode"},(t=>{t.ok?e.innerHTML=`<img src="${t.src}" alt="QRCode" />`:e.innerHTML=`<pre class="error">${t.message}</pre>`}))})),document.addEventListener("contextmenu",(e=>e.preventDefault()),!1)})();