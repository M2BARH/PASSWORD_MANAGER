# Local Password Manager

A locally hosted password manager that works with Chrome and Edge browsers. This project includes a backend server for storing passwords securely and a browser extension for managing and autofilling passwords.

## Features

- Store and retrieve passwords locally
- Autofill passwords on click
- Runs on startup

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- A modern web browser (Chrome or Edge)

## Setup Instructions

### 1. Clone the Repository

git clone https://github.com/yourusername/PASSWORD_MANAGER.git
cd PASSWORD_MANAGER

### 2. Add to startup

To run the server automatically on startup:

- Press Win + R, type shell:startup, and press Enter.
- Copy the start_server.bat file into the opened Startup folder.

### 3. Load the Extension in Chrome/Edge

- Open your browser and navigate to chrome://extensions/ or edge://extensions/.
- Enable "Developer mode" (usually at the top right corner).
- Click "Load unpacked" and select the PASSWORD_MANAGER directory.

## Usage

### Store Password
- Click on the extension icon to open the popup.
- Fill in the "Site", "Username", and "Password" fields.
- Click the "Store" button to save the password.

### Retrieve Password
- Click on the extension icon to open the popup.
- Enter the site name in the "Retrieve Password" section.
- Click the "Retrieve" button to display stored passwords.
- Click on the displayed password to autofill it on the current page