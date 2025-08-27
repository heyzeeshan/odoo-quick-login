// This function will be injected into the page to get a unique Odoo instance key
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