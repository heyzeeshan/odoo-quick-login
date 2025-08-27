# Odoo Quick Login - Chrome Extension

A modern, user-friendly Chrome extension that streamlines the login process for Odoo ERP systems. This extension allows users to save and quickly access multiple Odoo user accounts without repeatedly typing usernames and passwords.

![Odoo Quick Login](icon.png)

## Features

- **Save Multiple User Credentials**: Store login credentials for multiple Odoo users securely in your browser.
- **Quick Login Dropdown**: Select saved users from a sleek Material UI dropdown directly on the Odoo login page.
- **Instance-Specific Logins**: Credentials are stored per Odoo instance, allowing you to manage users across different Odoo deployments.
- **One-Click Login**: Automatically fill and submit login forms with a single click.
- **Modern UI Design**: Clean, modern interface following Material Design principles while maintaining Odoo's brand colors.
- **No Server Dependencies**: All data is stored locally in your browser - no external servers needed.

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## Usage

### Adding Users

1. Navigate to your Odoo login page
2. Click the Odoo Quick Login extension icon in your browser toolbar
3. Enter the username and password you want to save
4. Click "Add User"
5. Your credentials are now saved for that specific Odoo instance

### Quick Login

1. On any Odoo login page, you'll see a dropdown at the top of the form
2. Select a saved user from the dropdown
3. The form will be automatically filled and submitted
4. You're now logged in!

### Managing Users

1. Click the extension icon in your browser toolbar
2. View all saved users for the current Odoo instance
3. Click the "X" icon next to any user to remove them

## Technical Details

### Files

- **manifest.json**: Extension configuration and permissions
- **popup.html/popup.js**: User interface and logic for the extension popup
- **content.js**: Content script that injects the dropdown into Odoo login pages
- **detect_odoo.js**: Helper script for detecting Odoo instances
- **icon.png**: Extension icon

### Storage

- All user credentials are stored in Chrome's local storage
- Data is organized by Odoo instance to keep different deployments separate
- No data is transmitted to external servers

### Security

- Credentials are stored locally in your browser
- The extension requires minimal permissions (storage, scripting, activeTab)
- No data is shared between different Odoo instances

## Future Development Possibilities

### Enhanced Security
- **Password Encryption**: Implement local encryption for stored passwords
- **Master Password**: Add a master password option to protect all saved credentials
- **Biometric Authentication**: Integrate with the WebAuthn API for fingerprint/face authentication where supported

### Improved User Experience
- **UI Themes**: Add light/dark theme support and user-customizable colors
- **Credential Management**: Implement bulk import/export of saved credentials
- **Automatic Detection**: Improve Odoo instance detection for custom deployments
- **Context Menu Integration**: Add right-click context menu options for quick login
- **Keyboard Shortcuts**: Add customizable keyboard shortcuts for power users

### Extended Functionality
- **Multi-Factor Authentication**: Support for MFA workflows in Odoo
- **Session Management**: Display currently active sessions and allow remote logout
- **Multiple Profiles**: Create profiles for different sets of credentials
- **Workspace Integration**: Quick access to recent modules or workspaces after login
- **Sync Support**: Optional sync between devices via Chrome sync or custom backend

### Enterprise Features
- **Team Management**: Allow administrators to distribute credentials to team members
- **Usage Analytics**: Anonymous usage statistics for admins (with user opt-in)
- **Role-Based Access**: Manage who can access which accounts
- **Custom Branding**: Allow organizations to customize the extension with their branding
- **SSO Integration**: Support for Single Sign-On providers used with Odoo

## Technical Improvements
- **TypeScript Migration**: Convert codebase to TypeScript for better type safety
- **Unit Testing**: Implement comprehensive test suite for reliability
- **Performance Optimization**: Reduce resource usage and optimize rendering
- **Code Modularization**: Better separation of concerns and component architecture
- **Browser Compatibility**: Extend support to Firefox, Edge, and other browsers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Odoo Community for their fantastic ERP platform
- Material Design for UI inspiration
- All contributors and users of this extension
