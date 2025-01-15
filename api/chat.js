// /api/chat.js

import { StringDecoder } from "string_decoder";
import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Groq SDK with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store user chat context globally
let chatHistory = [];

export default async function handler(req, res) {
    if (req.method === "POST") {
        const decoder = new StringDecoder("utf-8");
        let buffer = "";

        req.on("data", (chunk) => {
            buffer += decoder.write(chunk);
        });

        req.on("end", async () => {
            buffer += decoder.end();
            const body = JSON.parse(buffer);

            if (!body.message) {
                res.status(400).json({ error: "Message is required" });
                return;
            }

            // Add the user message to chat history
            chatHistory.push({ role: "user", content: body.message });

            // Add system instructions for the first time or continue the context
            if (chatHistory.length === 1) {
                chatHistory.unshift({
                    role: "system",
                    content: `You are CodeWithAbubokkor, a helpful and friendly chatbot representing the website https://www.codewithabubokkor.com. Always introduce yourself as CodeWithAbubokkor. Your primary focus is to provide **short, concise, and to-the-point answers**. Avoid lengthy explanations unless the user requests detailed information. When the user says "hi", "hello", or asks about you, provide them with a friendly introduction and mention that they can follow you on YouTube at https://www.youtube.com/@codewithabubokkor and on Facebook at https://www.facebook.com/codewithabubokkor.`
                });
            }

            try {
                const chatCompletion = await groq.chat.completions.create({
                    messages: chatHistory,
                    model: "llama-3.3-70b-versatile",
                });

                const chatResponse = chatCompletion.choices[0]?.message?.content || "No response available";

                // Add the chatbot response to the context
                chatHistory.push({ role: "assistant", content: chatResponse });

                res.status(200).json({ response: chatResponse });
            } catch (error) {
                console.error("Error in chat route:", error.message);
                res.status(500).json({ error: "Error processing your request" });
            }
        });
    } else {
        res.status(404).json({ error: "Route not found" });
    }
}


