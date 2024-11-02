chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case "showLoading":
        showLoadingOverlay();
        break;
      case "showResult":
        hideLoadingOverlay();
        showResultOverlay(message.result);
        break;
      case "showError":
        hideLoadingOverlay();
        showErrorOverlay(message.error);
        break;
    }
  });
  
  function showLoadingOverlay() {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Analyzing media...</p>
    `;
    document.body.appendChild(overlay);
  }
  
  function showResultOverlay(result) {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <h3>${result.isDeepfake ? '⚠️ Potential Deepfake Detected' : '✅ Likely Genuine'}</h3>
      <p>Confidence: ${result.confidence.toFixed(1)}%</p>
      ${result.isDeepfake ? `
        <p>Suspicious features:</p>
        <ul>
          ${result.manipulatedFeatures.map(f => `<li>${f.replace(/_/g, " ")}</li>`).join("")}
        </ul>
      ` : ''}
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 5000);
  }
  
  function showErrorOverlay(error) {
    const overlay = createOverlay();
    overlay.innerHTML = `
      <h3>❌ Analysis Error</h3>
      <p>${error}</p>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  }
  
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      background-color: white;
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 300px;
    `;
    return overlay;
  }
  
  function hideLoadingOverlay() {
    const existing = document.querySelector('.deepfake-overlay');
    if (existing) existing.remove();
  }