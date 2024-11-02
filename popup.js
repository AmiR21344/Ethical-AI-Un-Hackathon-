document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['lastAnalysis'], (result) => {
      if (result.lastAnalysis) {
        showLastResult(result.lastAnalysis);
      }
    });
  });
  
  function showLastResult(analysis) {
    const resultDiv = document.getElementById('result');
    resultDiv.className = `result ${analysis.isDeepfake ? 'suspicious' : 'genuine'}`;
    resultDiv.innerHTML = `
      <h3>${analysis.isDeepfake ? '⚠️ Potential Deepfake' : '✅ Genuine Media'}</h3>
      <p>Confidence: ${analysis.confidence.toFixed(1)}%</p>
      ${analysis.isDeepfake ? `
        <p>Suspicious features:</p>
        <ul>
          ${analysis.manipulatedFeatures.map(f => `<li>${f.replace(/_/g, " ")}</li>`).join("")}
        </ul>
      ` : ''}
    `;
  }