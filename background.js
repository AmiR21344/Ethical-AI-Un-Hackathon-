// Register service worker
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

// DeepfakeDetector object
const DeepfakeDetector = {
  apiKey: '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',
  apiEndpoint: 'https://api-inference.huggingface.co/models/deepfakedetection/deepfake-detection-v1',

  async analyzeMedia(mediaUrl) {
    try {
      console.log('Analyzing media URL:', mediaUrl);
      
      // Fetch the image with necessary CORS headers
      const imageResponse = await fetch(mediaUrl, {
        mode: 'cors',
        headers: {
          'Origin': chrome.runtime.getURL(''),
        }
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      // Convert the response to array buffer instead of blob
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Data = this.arrayBufferToBase64(arrayBuffer);
      
      console.log('Sending request to Hugging Face API...');
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: base64Data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return this.processResult(result);

    } catch (error) {
      console.error('Detailed error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  },

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  processResult(result) {
    try {
      console.log('Processing result:', result);
      
      let probability = 0;
      
      if (Array.isArray(result)) {
        probability = result[0]?.score || result[0]?.fake_probability || 0;
      } else if (typeof result === 'object') {
        probability = result.score || result.fake_probability || 0;
      }

      return {
        isDeepfake: probability > 0.5,
        confidence: (probability * 100).toFixed(2),
        manipulatedFeatures: this.getManipulatedFeatures(probability)
      };
    } catch (error) {
      console.error('Error processing result:', error);
      throw error;
    }
  },

  getManipulatedFeatures(probability) {
    const features = [];
    
    if (probability > 0.5) {
      features.push("Suspicious visual patterns detected");
    }
    if (probability > 0.7) {
      features.push("Strong indicators of manipulation");
    }
    if (probability > 0.9) {
      features.push("Very high likelihood of artificial generation");
    }

    return features;
  }
};

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeMedia",
    title: "Analyze for Deepfake",
    contexts: ["image"]  // Removed video since we're only handling images for now
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyzeMedia") {
    try {
      console.log('Starting analysis for URL:', info.srcUrl);
      chrome.tabs.sendMessage(tab.id, { action: "showLoading" });
      
      const result = await DeepfakeDetector.analyzeMedia(info.srcUrl);
      console.log('Analysis complete:', result);
      
      chrome.storage.local.set({ lastAnalysis: result });
      chrome.tabs.sendMessage(tab.id, {
        action: "showResult",
        result: result
      });
    } catch (error) {
      console.error('Handler error:', error);
      chrome.tabs.sendMessage(tab.id, {
        action: "showError",
        error: error.message
      });
    }
  }
});