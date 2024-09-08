document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login_username').focus();
});

document.getElementById("login-btn").addEventListener("click", handleLogin);

function loginUserFn() {
    return new Promise((resolve, reject) => {
        const username = document.getElementById("login_username").value;
        const password = document.getElementById("login_password").value;

        if (!username || !password) {
            showCustomAlert("error", "Username or Password cannot be empty.");
            reject(new Error("Username or Password cannot be empty."));
            return;
        }

        chrome.runtime.sendMessage(
            { action: "loginUser", username, password },
            (response) => {
                console.log("Response: ", response)
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    showCustomAlert("error", "An error occurred during login. \n\n" + chrome.runtime.lastError.message);
                    reject(chrome.runtime.lastError);
                } else if (response.error) {
                    console.error("Login error:", response.error);
                    showCustomAlert("error", "Failed to log in. \n\n" + response.error);
                    reject(new Error(response.error));
                } else if (response.userId) {
                    chrome.storage.local.set({ user_id: response.userId, login_time: Date.now() }, () => {
                        showCustomAlert("success", "User logged in successfully!");
                        resolve(response.userId);
                        setTimeout(() => {
                            window.close();
                        }, 1500);
                    });
                } else {
                    console.error("Unexpected response:", response);
                    showCustomAlert("error", "Unexpected response from server.");
                    reject(new Error("Unexpected response"));
                }
            }
        );
    });
}

async function handleLogin() {
    try {
        const userId = await loginUserFn();
        if (userId) {
            console.log("Login successful, user ID:", userId);
        }
    } catch (error) {
        console.error("Login error:", error);
    }
}

function showCustomAlert(type, message) {
    const alertBox = document.getElementById("custom-alert");
    const alertContent = document.getElementById("custom-alert-content");
    const alertMessage = document.getElementById("alert-message");

    alertMessage.textContent = message;

    alertContent.classList.remove("success", "error");
    if (type === "success") {
        alertContent.classList.add("success");
    } else if (type === "error") {
        alertContent.classList.add("error");
    }

    alertBox.style.display = "flex";
    setTimeout(() => {
        alertContent.classList.add("fade-out");
        setTimeout(() => {
            closeCustomAlert();
            alertContent.classList.remove("fade-out");
        }, 300);
    }, 3000);
}

function closeCustomAlert() {
    const alertBox = document.getElementById("custom-alert");
    alertBox.style.display = "none";
}

const closeBtn = document.getElementById("close-btn");
if (closeBtn) {
    closeBtn.addEventListener('click', closeCustomAlert);
} else {
    console.error("Close button not found");
}