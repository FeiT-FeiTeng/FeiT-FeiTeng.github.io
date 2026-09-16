"use strict";

(() => {
  if (
    location.protocol !== "https:" ||
    location.hostname !== "feit-feiteng.github.io" ||
    location.port ||
    !["/", "/index.html"].includes(location.pathname) ||
    !document.getElementById("busuanzi_value_site_uv") ||
    document.getElementById("page-view-counter-script")
  ) {
    return;
  }

  const script = document.createElement("script");
  script.id = "page-view-counter-script";
  script.src =
    "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  script.async = true;
  document.head.appendChild(script);
})();
