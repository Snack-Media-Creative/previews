  $w.onReady(function () {
  // Add the GPT script to the page
  const gptScript = document.createElement("script");
  gptScript.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
  gptScript.async = true;
  gptScript.crossOrigin = "anonymous";
  document.head.appendChild(gptScript);

  // Wait for GPT script to load
  gptScript.onload = () => {
    window.googletag = window.googletag || { cmd: [] };

    googletag.cmd.push(function () {
      googletag.defineSlot(
        '/6428571/Snack-creative.com/Snack-creative.com-crown',
        [468, 60],
        'div-gpt-ad-1753194013326-0'
      ).addService(googletag.pubads());

      googletag.pubads().enableSingleRequest();
      googletag.pubads().collapseEmptyDivs();
      googletag.enableServices();
      googletag.display('div-gpt-ad-1753194013326-0');
    });
  };

  // Inject the ad container div into the page (you can change its location)
  const adDiv = document.createElement("div");
  adDiv.id = "div-gpt-ad-1753194013326-0";
  adDiv.style.width = "468px";
  adDiv.style.height = "60px";

  // Append the ad container to the page body or a specific element
  document.body.appendChild(adDiv); // Or target a specific container if needed
});