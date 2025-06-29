// Chrome extension popup functionality
document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const status = document.getElementById('status');

  // Show status message
  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }

  // Extract organization information from current email
  extractBtn.addEventListener('click', async function() {
    extractBtn.disabled = true;
    showStatus('🔄 Extracting organization information...', 'loading');

    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('mail.google.com')) {
        showStatus('❌ Please open Gmail to extract email content', 'error');
        extractBtn.disabled = false;
        return;
      }

      // Inject content script to extract email content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractEmailContent
      });

      const emailContent = results[0].result;
      
      if (!emailContent || emailContent.trim().length < 10) {
        showStatus('❌ No email content found. Please open an email first.', 'error');
        extractBtn.disabled = false;
        return;
      }

      // Send to backend for AI processing
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent })
      });

      const result = await response.json();

      if (result.success) {
        // Save extracted data to Chrome storage for the popup to access
        await chrome.storage.local.set({ 
          extractedData: result.data,
          timestamp: Date.now()
        });
        
        showStatus('✅ Organization information extracted successfully!', 'success');
        
        // Create a new tab and pass data via URL parameters
        const dashboardUrl = new URL('http://localhost:3000');
        dashboardUrl.searchParams.set('fromExtension', 'true');
        dashboardUrl.searchParams.set('extractedData', encodeURIComponent(JSON.stringify(result.data)));
        
        // Open dashboard in new tab after 1 second
        setTimeout(() => {
          chrome.tabs.create({ url: dashboardUrl.toString() });
        }, 1000);
      } else {
        showStatus(`❌ Extraction failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      showStatus('❌ Failed to extract information. Check if the backend is running.', 'error');
    } finally {
      extractBtn.disabled = false;
    }
  });

  // Open dashboard
  dashboardBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});

// Function to be injected into Gmail page
function extractEmailContent() {
  // Try multiple selectors to find email content
  const selectors = [
    '[data-message-id] .ii.gt > div',
    '.a3s.aiL',
    '.ii.gt',
    '[role="listitem"] .a3s',
    '.aHU .a3s'
  ];

  let emailContent = '';
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      // Get the last (most recent) email content
      const lastElement = elements[elements.length - 1];
      emailContent = lastElement.textContent || lastElement.innerText || '';
      if (emailContent.trim().length > 10) {
        break;
      }
    }
  }

  // Fallback: try to get any visible email content
  if (!emailContent || emailContent.trim().length < 10) {
    const bodyElements = document.querySelectorAll('[data-message-id]');
    for (const element of bodyElements) {
      const text = element.textContent || element.innerText || '';
      if (text.trim().length > emailContent.length) {
        emailContent = text;
      }
    }
  }

  return emailContent.trim();
}