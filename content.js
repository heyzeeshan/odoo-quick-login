// content.js
/**
 * Odoo Quick Login - Content Script
 * 
 * This script is injected into all web pages and does the following:
 * 1. Detects Odoo login pages
 * 2. Retrieves saved user credentials for the specific Odoo instance
 * 3. Creates and injects a Material UI styled dropdown menu
 * 4. Handles user selection to auto-fill and submit login forms
 * 
 * The script includes error handling to gracefully handle Chrome extension
 * context invalidation and other potential runtime errors.
 */

// Check if extension context is valid before initializing
let extensionContextValid = true;
try {
  // Test if we can access the chrome API
  if (!chrome || !chrome.storage) {
    extensionContextValid = false;
  }
} catch (error) {
  extensionContextValid = false;
  console.error('Extension context invalid:', error);
}

/**
 * Generates a unique key to identify different Odoo instances
 * 
 * The function attempts multiple methods to identify an Odoo instance:
 * 1. Database name from input field (most specific)
 * 2. Generator meta tag content (contains Odoo version)
 * 3. Page origin as fallback (least specific)
 * 
 * @returns {string} A unique identifier for the current Odoo instance
 */
function detectOdooInstanceKey() {
  const dbInput = document.querySelector('input[name="db"]');
  if (dbInput && dbInput.value) return 'db:' + dbInput.value;
  const meta = document.querySelector('meta[name="generator"]');
  if (meta && meta.content) return 'meta:' + meta.content;
  return 'origin:' + window.location.origin;
}

/**
 * Retrieves saved users for a specific Odoo instance
 * 
 * @param {string} instanceKey - The unique identifier for the Odoo instance
 * @param {Function} cb - Callback function that receives the array of users
 */
function getUsersForInstance(instanceKey, cb) {
  try {
    chrome.storage.local.get({usersByInstance: {}}, (data) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        cb([]);
        return;
      }
      cb((data.usersByInstance && data.usersByInstance[instanceKey]) || []);
    });
  } catch (error) {
    console.error('Error accessing chrome storage:', error);
    cb([]);
  }
}

/**
 * Determines if the current page is an Odoo login page
 * 
 * Uses multiple detection methods to identify Odoo login pages:
 * 1. Presence of login form with proper action URL
 * 2. Odoo generator meta tag
 * 
 * @returns {boolean} True if the current page is an Odoo login page
 */
function isOdooLoginPage() {
  const loginInput = document.querySelector('input[name="login"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const form = loginInput && loginInput.closest('form');
  if (loginInput && passwordInput && form && form.action.includes('/web/login')) {
    return true;
  }
  const meta = document.querySelector('meta[name="generator"]');
  if (meta && meta.content && meta.content.toLowerCase().includes('odoo')) {
    return true;
  }
  return false;
}

/**
 * Creates and injects the user selection dropdown into Odoo login pages
 * 
 * This is the main function that:
 * 1. Verifies we're on an Odoo login page
 * 2. Creates a Material UI styled dropdown
 * 3. Populates it with saved users for this instance
 * 4. Handles selection events to auto-fill credentials
 * 5. Positions the dropdown appropriately on the page
 * 
 * The function includes multiple fallback strategies for positioning
 * and error handling to ensure graceful operation in various scenarios.
 */
function insertUserButtons() {
  try {
    // Check if extension context is still valid
    if (!extensionContextValid) {
      console.log('Extension context invalid, skipping insertion');
      return;
    }
    
    if (!isOdooLoginPage()) return;
    const usernameInput = document.querySelector('input[name="login"]');
    if (!usernameInput) {
      // If login input not found, retry after a short delay
      // This handles cases where the page is still loading
      setTimeout(function() {
        try {
          insertUserButtons();
        } catch (error) {
          console.error('Error in delayed insertion:', error);
        }
      }, 300);
      return;
    }
    
    // Clear existing elements if they exist
    const existingContainer = document.getElementById('odoo-quick-login-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create container for the dropdown
    const container = document.createElement('div');
    container.id = 'odoo-quick-login-container';
    container.style.margin = '20px auto';
    container.style.width = '80%';
    container.style.maxWidth = '400px';
    container.style.position = 'relative';
    container.style.fontFamily = 'Roboto, "Segoe UI", Arial, sans-serif';
    container.style.zIndex = '9999';
    
    // Add header
    const header = document.createElement('div');
    header.textContent = 'ODOO QUICK LOGIN';
    header.style.backgroundColor = '#875A7B';
    header.style.color = 'white';
    header.style.padding = '12px 16px';
    header.style.fontSize = '16px';
    header.style.fontWeight = '500';
    header.style.textAlign = 'center';
    header.style.borderRadius = '4px 4px 0 0';
    header.style.letterSpacing = '1px';
    header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    container.appendChild(header);
    
    // Get the instance key and users
    const instanceKey = detectOdooInstanceKey();
  
  getUsersForInstance(instanceKey, users => {
    if (users.length === 0) return; // Don't show anything if no users saved
    
    // Create the select element with custom styling
    const selectContainer = document.createElement('div');
    selectContainer.style.position = 'relative';
    selectContainer.style.width = '100%';
    
    // Create a styled wrapper for the dropdown
    const selectWrapper = document.createElement('div');
    selectWrapper.style.position = 'relative';
    selectWrapper.style.width = '100%';
    selectWrapper.style.backgroundColor = '#ffffff';
    selectWrapper.style.borderRadius = '4px';
    selectWrapper.style.boxShadow = '0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2)';
    selectWrapper.style.marginBottom = '16px';
    selectWrapper.style.border = '2px solid #875A7B';
    selectWrapper.style.transition = 'all 0.3s ease';
    
    const select = document.createElement('select');
    select.id = 'odoo-quick-login-select';
    select.style.width = '100%';
    select.style.padding = '12px 16px';
    select.style.backgroundColor = 'transparent';
    select.style.color = 'rgba(0, 0, 0, 0.87)';
    select.style.border = 'none';
    select.style.borderBottom = '1px solid rgba(0, 0, 0, 0.42)';
    select.style.borderRadius = '4px 4px 0 0';
    select.style.fontSize = '16px';
    select.style.fontFamily = 'Roboto, sans-serif';
    select.style.appearance = 'none';
    select.style.webkitAppearance = 'none';
    select.style.mozAppearance = 'none';
    select.style.cursor = 'pointer';
    select.style.paddingRight = '36px'; // Space for the arrow
    select.style.outline = 'none';
    select.style.transition = 'border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1)';
    select.style.height = '52px';
    
    // Default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a saved user...';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.style.fontSize = '16px';
    defaultOption.style.padding = '16px';
    defaultOption.style.color = 'rgba(0, 0, 0, 0.6)';
    select.appendChild(defaultOption);
    
    // Add dropdown arrow
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.right = '16px';
    arrow.style.top = '50%';
    arrow.style.transform = 'translateY(-50%)';
    arrow.style.pointerEvents = 'none';
    arrow.style.width = '24px';
    arrow.style.height = '24px';
    arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M7 10l5 5 5-5z" fill="#875A7B"/></svg>';
    arrow.style.transition = 'transform 0.2s ease';
    
    // Add user options
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = JSON.stringify(user); // Store the user data as JSON
      option.textContent = user.username;
      option.style.padding = '16px';
      option.style.fontSize = '16px';
      option.style.lineHeight = '1.5';
      option.style.color = 'rgba(0, 0, 0, 0.87)';
      select.appendChild(option);
    });
    
    // Handle selection change
    select.addEventListener('change', function() {
      if (this.value) {
        const selectedUser = JSON.parse(this.value);
        const u = document.querySelector('input[name="login"]');
        const p = document.querySelector('input[name="password"]');
        
        if (u && p) {
          u.value = selectedUser.username;
          p.value = selectedUser.password;
          
          // Focus the login button
          const form = u.closest('form');
          const btn = document.querySelector('button[type="submit"], .btn-primary');
          
          if (btn) {
            btn.focus();
            btn.click();
            btn.dispatchEvent(new Event('mousedown', {bubbles: true}));
            btn.dispatchEvent(new Event('mouseup', {bubbles: true}));
          }
          
          if (form) {
            setTimeout(() => {
              if (window.location.href.includes('/web/login')) {
                form.requestSubmit ? form.requestSubmit() : form.submit();
              }
            }, 500);
          }
        }
        
        // Reset selection to placeholder after action
        setTimeout(() => {
          this.value = '';
        }, 1000);
      }
    });
    
    // Add elements to the DOM
    selectWrapper.appendChild(select);
    selectWrapper.appendChild(arrow);
    selectContainer.appendChild(selectWrapper);
    container.appendChild(selectContainer);
    
    // Create a floating label for the dropdown
    const floatingLabel = document.createElement('div');
    floatingLabel.textContent = 'Saved Odoo Users';
    floatingLabel.style.position = 'absolute';
    floatingLabel.style.top = '-8px';
    floatingLabel.style.left = '12px';
    floatingLabel.style.fontSize = '12px';
    floatingLabel.style.color = '#875A7B';
    floatingLabel.style.backgroundColor = '#ffffff';
    floatingLabel.style.padding = '0 4px';
    floatingLabel.style.pointerEvents = 'none';
    floatingLabel.style.transition = 'all 0.2s ease';
    floatingLabel.style.fontWeight = '500';
    selectWrapper.appendChild(floatingLabel);
    
    // Add a helper text below the dropdown
    const helperText = document.createElement('div');
    helperText.textContent = 'Click to select a user for quick login';
    helperText.style.fontSize = '12px';
    helperText.style.color = 'rgba(0, 0, 0, 0.6)';
    helperText.style.marginTop = '4px';
    helperText.style.marginLeft = '12px';
    selectContainer.appendChild(helperText);
    
    // Find the best place to insert the dropdown
    const loginForm = document.querySelector('form');
    const loginCard = document.querySelector('.card, .oe_login_form, .container');
    
    if (loginCard) {
      // Option 1: Insert at the top of the login card
      loginCard.insertBefore(container, loginCard.firstChild);
    } else if (loginForm) {
      // Option 2: Insert at the top of the form
      loginForm.insertBefore(container, loginForm.firstChild);
    } else {
      // Option 3: Create a fixed floating container
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '16px';
      container.style.borderRadius = '8px';
      document.body.appendChild(container);
    }
    
    // Add focus and hover effects
    select.addEventListener('focus', function() {
      this.style.borderBottom = '2px solid #875A7B';
      selectWrapper.style.boxShadow = '0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)';
    });
    
    select.addEventListener('blur', function() {
      this.style.borderBottom = '1px solid rgba(0, 0, 0, 0.42)';
      selectWrapper.style.boxShadow = '0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2)';
    });
    
    select.addEventListener('mouseover', function() {
      this.style.borderBottom = '1px solid rgba(0, 0, 0, 0.87)';
      selectWrapper.style.boxShadow = '0 3px 3px 0 rgba(0,0,0,0.14), 0 1px 7px 0 rgba(0,0,0,0.12), 0 3px 1px -1px rgba(0,0,0,0.2)';
    });
    
    select.addEventListener('mouseout', function() {
      if (this !== document.activeElement) {
        this.style.borderBottom = '1px solid rgba(0, 0, 0, 0.42)';
        selectWrapper.style.boxShadow = '0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2)';
      }
    });
    
    // Add animation on open/close
    select.addEventListener('mousedown', function() {
      arrow.querySelector('svg').style.transform = 'rotate(180deg)';
    });
    
    document.addEventListener('mouseup', function() {
      arrow.querySelector('svg').style.transform = 'rotate(0deg)';
    });
  });
  } catch (error) {
    console.error('Error in insertUserButtons:', error);
  }
}

// Initial insertion of buttons
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    try {
      insertUserButtons();
    } catch (error) {
      console.error('Error during initial insertion:', error);
    }
  });
} else {
  try {
    insertUserButtons();
  } catch (error) {
    console.error('Error during initial insertion:', error);
  }
}

// Listen for the custom event from the popup
document.addEventListener('odooQuickLoginUserAdded', function() {
  console.log('User added event detected, refreshing buttons');
  try {
    insertUserButtons(); // Refresh the buttons when a new user is added
  } catch (error) {
    console.error('Error during event-triggered refresh:', error);
  }
});

// Also refresh periodically to catch any changes
setInterval(function() {
  try {
    insertUserButtons();
  } catch (error) {
    console.error('Error during periodic refresh:', error);
  }
}, 5000);