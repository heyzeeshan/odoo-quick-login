/**
 * Odoo Quick Login - Popup Script
 * 
 * This script handles the extension popup functionality:
 * 1. Retrieving and displaying saved users for the current Odoo instance
 * 2. Adding new users to the storage
 * 3. Removing existing users
 * 4. Triggering login actions on the active tab
 * 
 * The popup provides a user-friendly interface for managing
 * credentials across different Odoo instances.
 */

/**
 * Retrieves saved users for a specific Odoo instance
 * 
 * @param {string} instanceKey - The unique identifier for the Odoo instance
 * @param {Function} cb - Callback function that receives the array of users
 */
function getUsersForInstance(instanceKey, cb) {
  chrome.storage.local.get({usersByInstance: {}}, (data) => {
    cb((data.usersByInstance && data.usersByInstance[instanceKey]) || []);
  });
}

/**
 * Saves users for a specific Odoo instance
 * 
 * @param {string} instanceKey - The unique identifier for the Odoo instance
 * @param {Array} users - Array of user objects with username and password
 * @param {Function} cb - Callback function called after saving
 */
function saveUsersForInstance(instanceKey, users, cb) {
  chrome.storage.local.get({usersByInstance: {}}, (data) => {
    data.usersByInstance[instanceKey] = users;
    chrome.storage.local.set({usersByInstance: data.usersByInstance}, cb);
  });
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
 * Renders the list of saved users in the popup
 * 
 * Creates interactive elements for each saved user:
 * - Button with username that triggers login when clicked
 * - Delete button to remove users from storage
 * 
 * @param {string} instanceKey - The unique identifier for the current Odoo instance
 */
function renderUsers(instanceKey) {
  getUsersForInstance(instanceKey, users => {
    const list = document.getElementById('user-list');
    list.innerHTML = '';
    
    // Show message if no users are saved
    if (users.length === 0) {
      list.innerHTML = '<div class="no-users">No users saved for this Odoo site.</div>';
      return;
    }
    
    // Create interactive elements for each saved user
    users.forEach((user, idx) => {
      const row = document.createElement('div');
      row.className = 'user-row';

      // Create main button with username
      const userBtn = document.createElement('button');
      userBtn.className = 'user-row-main-btn';
      userBtn.textContent = user.username;
      userBtn.onclick = () => loginUser(user);

      // Create delete button with X icon
      const rm = document.createElement('button');
      rm.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      rm.title = 'Remove user';
      rm.className = 'delete-btn';
      rm.onmouseover = () => {}; // Event handlers preserved for future styling
      rm.onmouseout = () => {};  // Event handlers preserved for future styling
      
      // Handle user deletion
      rm.onclick = (e) => {
        e.stopPropagation();
        users.splice(idx, 1);
        saveUsersForInstance(instanceKey, users, () => renderUsers(instanceKey));
      };

      row.appendChild(userBtn);
      row.appendChild(rm);
      list.appendChild(row);
    });
  });
}
// On popup load, get the current tab's Odoo instance key and render users
let currentInstanceKey = null;
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  const tabId = tabs[0].id;
  chrome.scripting.executeScript({
    target: {tabId},
    func: function() {
      const dbInput = document.querySelector('input[name="db"]');
      if (dbInput && dbInput.value) return 'db:' + dbInput.value;
      const meta = document.querySelector('meta[name="generator"]');
      if (meta && meta.content) return 'meta:' + meta.content;
      return 'origin:' + window.location.origin;
    }
  }, (results) => {
    console.log('detectOdooInstanceKey results:', results);
    currentInstanceKey = results && results[0] && results[0].result;
    if (!currentInstanceKey) {
      document.getElementById('user-list').innerHTML = '<div class="no-users">Not an Odoo login page. Open this popup on an Odoo login page.</div>';
      document.getElementById('add-user').disabled = true;
      return;
    }
    renderUsers(currentInstanceKey);
    document.getElementById('add-user').onclick = () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      if (!username || !password) return;
      getUsersForInstance(currentInstanceKey, users => {
        users.push({username, password});
        saveUsersForInstance(currentInstanceKey, users, () => {
          renderUsers(currentInstanceKey);
          document.getElementById('username').value = '';
          document.getElementById('password').value = '';
          
          // Refresh the content on the Odoo login page without reloading
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            chrome.scripting.executeScript({
              target: {tabId},
              func: function() {
                // This function will be injected into the page
                // Create a custom event to notify any extension content scripts
                const event = new CustomEvent('odooQuickLoginUserAdded');
                document.dispatchEvent(event);
              }
            });
          });
        });
      });
    };
  });
});
// Autofill and submit login form
function loginUser(user) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: {tabId: tabId, allFrames: false},
      func: (username, password) => {
        const u = document.querySelector('input[name="login"]');
        const p = document.querySelector('input[name="password"]');
        if (u && p) {
          u.value = username;
          p.value = password;
          const btn = document.querySelector('button[type="submit"], .btn-primary');
          if (btn) btn.click();
        }
      },
      args: [user.username, user.password]
    });
  });
}
