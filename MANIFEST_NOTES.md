# Manifest.json Documentation

Since JSON doesn't allow comments, this document explains the purpose of each section in the `manifest.json` file.

## Permissions

- **storage**: Required for storing user credentials in Chrome's local storage
- **scripting**: Allows the extension to execute scripts in tabs (used for detecting Odoo instances)
- **activeTab**: Grants access to the currently active tab's information

## Host Permissions

Currently includes:
- `http://localhost:8018/web/login*`: For development testing

For production use, you would want to expand this to include your Odoo instances, or use broader patterns like:
- `*://*.odoo.com/web/login*`
- `*://*odoo*/web/login*`

## Extension Popup

- **default_popup**: Points to the HTML file that appears when clicking the extension icon
- **default_icon**: Defines icons at different sizes for various UI contexts

## Content Scripts

- Injects `content.js` into all URLs (`<all_urls>`)
- This is needed to detect Odoo login pages anywhere and inject the dropdown

## Future Improvements

- Consider adding background scripts for more complex functionality
- Add web_accessible_resources if you need to inject images or other resources
- Implement content_security_policy for enhanced security
