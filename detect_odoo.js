/**
 * Odoo Quick Login - Odoo Detection Helper
 * 
 * This standalone utility function is designed to be injected into pages
 * to detect Odoo instances and generate unique identifiers for them.
 * 
 * The function is used by both the content script and popup to ensure
 * consistent instance identification across the extension.
 */

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
    // Try to get database name from hidden input (Odoo login form)
    const dbInput = document.querySelector('input[name="db"]');
    if (dbInput && dbInput.value) return 'db:' + dbInput.value;
    // Try to get Odoo version from meta tag
    const meta = document.querySelector('meta[name="generator"]');
    if (meta && meta.content) return 'meta:' + meta.content;
    // Fallback: use window.location.origin
    return 'origin:' + window.location.origin;
  }