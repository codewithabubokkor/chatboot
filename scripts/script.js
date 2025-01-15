// /scripts/script.js

document.getElementById("send-button").addEventListener("click", async () => {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    const messagesDiv = document.getElementById("messages");

    // Display user message
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.innerHTML = `<span>${userInput}</span>`;
    messagesDiv.appendChild(userMessage);

    document.getElementById("user-input").value = "";

    // Send user message to backend
    try {
        const response = await fetch("/api/chat", {  // Vercel API route
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
        });

        const data = await response.json();
        let botMessageContent = data.response || "No response available";

        // Replace newlines with <br> for better display
        botMessageContent = botMessageContent.replace(/\n/g, "<br>");

        // Display bot response with formatted text
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.innerHTML = `<span>${botMessageContent}</span>`;
        messagesDiv.appendChild(botMessage);

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Error:", error);
    }
});



