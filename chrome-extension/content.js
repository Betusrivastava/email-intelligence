// Content script for Gmail integration
(function() {
  'use strict';
  
  let extractButton = null;
  let isButtonAdded = false;

  // Create extraction button
  function createExtractButton() {
    const button = document.createElement('button');
    button.id = 'email-intelligence-extract';
    button.innerHTML = `
      <span class="extract-icon">🔍</span>
      <span class="extract-text">Extract Organization Info</span>
    `;
    button.className = 'email-intelligence-btn';
    button.title = 'Extract organization information from this email';
    
    button.addEventListener('click', handleExtractClick);
    return button;
  }

  // Handle extract button click
  async function handleExtractClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.target.closest('.email-intelligence-btn');
    const originalHTML = button.innerHTML;
    
    try {
      // Show loading state
      button.innerHTML = `
        <span class="extract-spinner"></span>
        <span class="extract-text">Extracting...</span>
      `;
      button.disabled = true;

      // Extract email content
      const emailContent = extractEmailContent();
      
      if (!emailContent || emailContent.trim().length < 10) {
        throw new Error('No email content found');
      }

      // Send to backend
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailContent })
      });

      const result = await response.json();

      if (result.success) {
        // Store extracted data
        await chrome.storage.local.set({ 
          extractedData: result.data,
          timestamp: Date.now()
        });
        
        // Show success state
        button.innerHTML = `
          <span class="extract-icon">✅</span>
          <span class="extract-text">Extracted! Opening Dashboard...</span>
        `;
        
        // Create dashboard URL with extracted data
        const dashboardUrl = new URL('http://localhost:3000');
        dashboardUrl.searchParams.set('fromExtension', 'true');
        dashboardUrl.searchParams.set('extractedData', encodeURIComponent(JSON.stringify(result.data)));
        
        // Open dashboard
        setTimeout(() => {
          window.open(dashboardUrl.toString(), '_blank');
          button.innerHTML = originalHTML;
          button.disabled = false;
        }, 1500);
      } else {
        throw new Error(result.message || 'Extraction failed');
      }
    } catch (error) {
      console.error('Email intelligence extraction error:', error);
      
      // Show error state
      button.innerHTML = `
        <span class="extract-icon">❌</span>
        <span class="extract-text">Failed to extract</span>
      `;
      
      // Reset button after 3 seconds
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 3000);
    }
  }

  // Extract email content from Gmail
  function extractEmailContent() {
    const selectors = [
      '[data-message-id] .ii.gt > div',
      '.a3s.aiL',
      '.ii.gt div',
      '[role="listitem"] .a3s',
      '.aHU .a3s',
      '.Am .ii.gt',
      '.gs .a3s'
    ];

    let emailContent = '';
    
    // Try each selector to find email content
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        // Get the most recent/visible email content
        for (let i = elements.length - 1; i >= 0; i--) {
          const element = elements[i];
          const text = element.textContent || element.innerText || '';
          if (text.trim().length > 50 && isElementVisible(element)) {
            emailContent = text.trim();
            break;
          }
        }
        if (emailContent) break;
      }
    }

    // Fallback: get any visible email content
    if (!emailContent) {
      const messageElements = document.querySelectorAll('[data-message-id], .a3s, .ii');
      for (const element of messageElements) {
        if (isElementVisible(element)) {
          const text = element.textContent || element.innerText || '';
          if (text.trim().length > emailContent.length) {
            emailContent = text.trim();
          }
        }
      }
    }

    return emailContent;
  }

  // Check if element is visible
  function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           window.getComputedStyle(element).display !== 'none' &&
           window.getComputedStyle(element).visibility !== 'hidden';
  }

  // Add extract button to Gmail interface
  function addExtractButton() {
    if (isButtonAdded || !document.querySelector('[data-message-id]')) {
      return;
    }

    // Try different locations to add the button
    const targetSelectors = [
      '.ar.as',  // Gmail toolbar
      '.aqJ',    // Email actions area
      '.aAy',    // Header actions
      '.am.aP'   // Top toolbar
    ];

    for (const selector of targetSelectors) {
      const target = document.querySelector(selector);
      if (target) {
        extractButton = createExtractButton();
        target.appendChild(extractButton);
        isButtonAdded = true;
        break;
      }
    }

    // Fallback: add floating button
    if (!isButtonAdded) {
      const emailContainer = document.querySelector('[data-message-id]');
      if (emailContainer) {
        extractButton = createExtractButton();
        extractButton.style.position = 'fixed';
        extractButton.style.top = '10px';
        extractButton.style.right = '20px';
        extractButton.style.zIndex = '9999';
        document.body.appendChild(extractButton);
        isButtonAdded = true;
      }
    }
  }

  // Remove extract button
  function removeExtractButton() {
    if (extractButton) {
      extractButton.remove();
      extractButton = null;
      isButtonAdded = false;
    }
  }

  // Monitor Gmail for email changes
  function observeGmailChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if new email content was loaded
          const hasEmailContent = document.querySelector('[data-message-id]');
          const hasButton = document.querySelector('#email-intelligence-extract');

          if (hasEmailContent && !hasButton) {
            shouldUpdate = true;
          } else if (!hasEmailContent && hasButton) {
            removeExtractButton();
          }
        }
      });

      if (shouldUpdate) {
        setTimeout(addExtractButton, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize when page loads
  function initialize() {
    // Wait for Gmail to load
    setTimeout(() => {
      addExtractButton();
      observeGmailChanges();
    }, 2000);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();