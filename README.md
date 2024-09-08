# Local Password Manager

A locally hosted password manager that works with Chrome and Edge browsers. This project includes a backend server for storing passwords securely and a browser extension for managing and autofilling passwords.
For storing passwords it is using Sqlite.

## Features

- Store and retrieve passwords locally
- Autofill passwords on click
- Runs on startup

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- A modern web browser (Chrome or Edge)

## Setup Instructions

### 1. Clone the Repository

You can clone the repository to the Program Files directory on your C drive using one of the following methods:

**Option 1: Using Git Bash (recommended)**

Open Git Bash and run the following commands:
- git clone https://github.com/M2BARH/PASSWORD_MANAGER.git
- "C:\Program Files\PASSWORD_MANAGER"

**Option 2: Download ZIP file**

Click the "Code" dropdown button on the repository page and select "Download ZIP". Then, extract the ZIP file to the "C:\Program Files" directory. Rename the extracted folder to "PASSWORD_MANAGER".

### 2. Replace the code on start_server.bat with the following code

```
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd C:\Program Files\PASSWORD_MANAGER && start /min /b node index.js", 0, False
```

### 2. Add to startup

To run the server automatically on startup:

- Press Win + R, type `shell:startup`, and press Enter.
- Copy the `start_server.vbs` file from the cloned repository (`C:\Program Files\PASSWORD_MANAGER`) into the opened Startup folder.

### 3. Load the Extension in Chrome/Edge

- Open your browser and navigate to `chrome://extensions/` or `edge://extensions/`.
- Enable "Developer mode" (usually at the top right corner).
- Click "Load unpacked" and select the `C:\Program Files\PASSWORD_MANAGER` directory.

## Usage

### Store Password
- Click on the extension icon to open the popup.
- Fill in the "Site", "Username", and "Password" fields.
- Click the "Store" button to save the password.

### Retrieve Password
- Click on the extension icon to open the popup.
- Enter the site name in the "Retrieve Password" section.
- Click the "Retrieve" button to display stored passwords.
- Click on the displayed password to autofill it on the current page.