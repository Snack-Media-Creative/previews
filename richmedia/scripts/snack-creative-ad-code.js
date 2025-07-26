
  // --SNACK CREATIVE AD CODE--
  // --BUILT BY ATB_MD_01/01/23 -- DO NOT MODIFY

  function getQueryParams() {
    const params = {};
    const queryString = window.location.search.slice(1); // Remove "?"
    queryString.split("&").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    return params;
  }

  function getPageName() {
    const url = window.location.pathname;
    const pageName = url.split("/").pop().split("?")[0].split("#")[0];
    return pageName;
  }

  const pageName = getPageName();

  // Load external scripts
  const scripts = [
    {
      src: "//securepubads.g.doubleclick.net/tag/js/gpt.js",
      async: true,
    },
  ];

  scripts.forEach((script) => {
    const el = document.createElement("script");
    el.src = script.src;
    if (script.defer) el.defer = true;
    else if (script.async) el.async = true;
    if (script.onload) el.onload = script.onload;
    document.head.appendChild(el);
  });

  window.googletag = window.googletag || { cmd: [] };

  googletag.cmd.push(function () {
    // Size mappings
    const crown = googletag
      .sizeMapping()
      .addSize([1210, 0], [468, 60])
      .addSize([992, 0], [468, 60])
      .addSize([768, 0], [468, 60])
      .addSize([320, 0], [468, 60])
      .addSize([0, 0], [468, 60])
      .build();

    const interscroller = googletag
      .sizeMapping()
      .addSize([1210, 0], [970, 250])
      .addSize([992, 0], [300, 250])
      .addSize([768, 0], [300, 250])
      .addSize([320, 0], [300, 250])
      .addSize([0, 0], [300, 250])
      .build();

    const footer = googletag
      .sizeMapping()
      .addSize([1210, 0], [728, 90])
      .addSize([992, 0], [728, 90])
      .addSize([768, 0], [728, 90])
      .addSize([320, 0], [320, 100])
      .addSize([0, 0], [320, 100])
      .build();

    // Ad slots with real GAM unit paths
    const adSlots = [
      {
        name: "crownUnit",
        size: [468, 60],
        mapping: crown,
        path: "/6428571/Snack-creative.com/Snack-creative.com-crown",
      },
      {
        name: "interscrollerUnit",
        size: [970, 250],
        mapping: interscroller,
        path: "/6428571/Snack-creative.com/Snack-creative.com-interscroller",
      },
      {
        name: "footerUnit",
        size: [320, 100],
        mapping: footer,
        path: "/6428571/Snack-creative.com/Snack-creative.com-footer",
      },
    ];

    adSlots.forEach((slot) => {
      googletag
        .defineSlot(slot.path, slot.size, slot.name)
        .defineSizeMapping(slot.mapping)
        .addService(googletag.pubads());
    });

    googletag.pubads().enableLazyLoad({
      fetchMarginPercent: 5,
      renderMarginPercent: 2,
      mobileScaling: 2.0,
    });

    googletag.pubads().setTargeting("page", pageName);

    const queryParams = getQueryParams();

      if (queryParams.advertiser) {
    googletag.pubads().setTargeting("Preview-client", queryParams.advertiser);
  }

  if (queryParams.campaign) {
    googletag.pubads().setTargeting("preview-campaign", queryParams.campaign);
  }
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });