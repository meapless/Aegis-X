async function analyzeWithAI(safeText) {
    try {
        const response = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: safeText })
        });

        // The Python backend now returns a direct JSON object, no need to JSON.parse() again.
        const verdict = await response.json(); 

        console.log("🤖 AI VERDICT:", verdict);
        
        if (verdict.is_threat) {
            // Simple alert for now - UI Injection coming Day 4
            alert(`⚠️ AEGIS-X ALERT: ${verdict.reason}`);
        }

    } catch (error) {
        console.error("AI Connection Error:", error);
    }
}

console.log("Aegis-X: Content Script Loaded. Waiting for user to open an email...");

// Configuration
// '.a3s' is the class Gmail uses for the message body text. 
// '.h7' usually contains the sender info.
const EMAIL_BODY_SELECTOR = '.a3s'; 

let lastProcessedText = "";

// 1. The Extraction Function
function extractEmailContent() {
    // Attempt to find the email body
    const emailBodies = document.querySelectorAll(EMAIL_BODY_SELECTOR);
    
    // Gmail often keeps previous emails in the DOM (hidden). We usually want the last one (the visible one).
    if (emailBodies.length > 0) {
        const activeEmail = emailBodies[emailBodies.length - 1];
        const rawText = activeEmail.innerText;

        // Prevent spamming logs if the text hasn't changed
        if (rawText && rawText !== lastProcessedText) {
            lastProcessedText = rawText;
            
            // --- THE NEW PART ---
            // Run the Privacy Engine
            const sanitizedText = AegisPrivacy.redact(rawText);
            // --------------------

            console.log("----------------------------------------------------");
            console.log("🛡️ AEGIS-X PRIVACY ENGINE ACTIVE");
            console.log("----------------------------------------------------");
            console.log("RAW INPUT (Visible to User):");
            console.log(rawText.substring(0, 100) + "..."); 
            console.log("\n");
            console.log("SANITIZED OUTPUT (Safe for AI):");
            // Send to Backend
            analyzeWithAI(sanitizedText);
            console.log(sanitizedText); 
            console.log("----------------------------------------------------");
        }
    }
}

// 2. The Observer (The Watchdog)
// This watches the page for any changes (clicks, new elements loading)
const observer = new MutationObserver((mutations) => {
    // Whenever the DOM changes, try to extract content.
    // We use a debounce (timeout) to avoid running this 100 times per second while the page animates.
    clearTimeout(window.executionDelay);
    window.executionDelay = setTimeout(() => {
        extractEmailContent();
    }, 1000); // Wait 1 second after page activity stops to read the text
});

// Start observing the entire document body
observer.observe(document.body, {
    childList: true,
    subtree: true
});