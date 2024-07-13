async function registerUser(username, password) {
    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            return result.user_id;
        } else {
            const errorText = await response.text();
            console.error("!Register error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in registerUser:", error);
        throw error;
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password}),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            console.log("Login result:", result);
            return result.user_id;
        } else {
            const errorText = await response.text();
            console.error("!Login error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in loginUser:", error);
        throw error;
    }
}

async function storePassword(data) {
    try {
        const response = await fetch("http://localhost:3000/store-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            console.log("Store result:", result);
            return result;
        } else {
            const errorText = await response.text();
            console.error("!Store error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in storePassword:", error);
        throw error;
    }
}

async function getPassword(data) {
    try {
        const response = await fetch("http://localhost:3000/get-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            console.log("Get result:", result);
            return result;
        } else {
            const errorText = await response.text();
            console.error("!Get error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in getPassword:", error);
        throw error;
    }
}

async function editPassword(data) {
    try {
        const response = await fetch("http://localhost:3000/edit-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            console.log("Edit result:", result);
            return result;
        } else {
            const errorText = await response.text();
            console.error("!Edit error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in editPassword:", error);
        throw error;
    }
}

async function deletePassword(data) {
    try {
        const response = await fetch("http://localhost:3000/delete-password", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data),
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const result = await response.json();
            console.log("Delete result:", result);
            return result;
        } else {
            const errorText = await response.text();
            console.error("!Delete error:", errorText);
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error in deletePassword:", error);
        throw error;
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL("../html/register.html")});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender).then(sendResponse).catch(error => {
        console.error("Error in handleMessage:", error);
        sendResponse({error: error.message});
    });
    return true;
});

async function handleMessage(message, sender) {
    try {
        switch (message.action) {
            case 'registerUser':
                return await handleRegisterMessage(message);
            case 'loginUser':
                return await handleLoginMessage(message);
            case "storePassword":
            case "getPassword":
            case "editPassword":
            case "deletePassword":
                return await handlePasswordAction(message);
            default:
                throw new Error("Unknown action");
        }
    } catch (error) {
        console.error("Error handling message:", error);
        throw error;
    }
}

async function handleRegisterMessage(message) {
    try {
        const userId = await registerUser(message.username, message.password);
        console.log("Sending response with userId:", userId);
        return {userId: userId};
    } catch (error) {
        console.error("Register error:", error.message);
        throw error;
    }
}

async function handleLoginMessage(message) {
    try {
        const userId = await loginUser(message.username, message.password);
        console.log("Sending response with userId:", userId);
        return {userId: userId};
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
}

async function handlePasswordAction(message) {
    const userId = await getUserId();
    if (!userId) {
        await showLoginPrompt();
        throw new Error("User not logged in");
    }

    message.data.user_id = userId;
    switch (message.action) {
        case "storePassword":
            return await storePassword(message.data);
        case "getPassword":
            return await getPassword(message.data);
        case "editPassword":
            return await editPassword(message.data);
        case "deletePassword":
            return await deletePassword(message.data);
    }
}

async function getUserId() {
    return new Promise((resolve) => {
        chrome.storage.local.get("user_id", (result) => resolve(result.user_id));
    });
}

async function showLoginPrompt() {
    await new Promise((resolve) => {
        chrome.tabs.create({url: chrome.runtime.getURL("../html/login.html")}, resolve);
    });
}
