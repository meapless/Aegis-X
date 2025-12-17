/* content.js - The Aegis-X Controller */

// 1. UI GENERATOR (The "Shield")
function createWarningBanner(verdict) {
    // Check if banner already exists to prevent duplicates
    if (document.getElementById('aegis-x-root')) return;

    // Find the email container to inject into
    const emailContainer = document.querySelector('.a3s.aiL');
    if (!emailContainer) return;

    // Create a Shadow Host (Isolates our CSS from Gmail)
    const host = document.createElement('div');
    host.id = 'aegis-x-root';
    host.style.marginBottom = '20px';
    
    // Insert at the VERY TOP of the email body
    emailContainer.prepend(host);

    // Create Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });

    // Define the color based on threat level
    const themeColor = verdict.is_threat ? '#d93025' : '#188038'; // Red or Green
    const icon = verdict.is_threat ? '⚠️' : '🛡️';
    const title = verdict.is_threat ? 'PHISHING THREAT DETECTED' : 'Verified Safe';

    // The HTML/CSS for the Banner
    shadow.innerHTML = `
        <style>
            .banner {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: ${verdict.is_threat ? '#FEF2F2' : '#F0FDF4'};
                border: 1px solid ${themeColor};
                border-left: 6px solid ${themeColor};
                border-radius: 4px;
                padding: 16px;
                display: flex;
                align-items: flex-start;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                animation: slideDown 0.5s ease-out;
            }
            .icon {
                font-size: 24px;
                margin-right: 16px;
                margin-top: -2px;
            }
            .content {
                flex: 1;
            }
            .title {
                color: ${themeColor};
                font-weight: 700;
                font-size: 16px;
                margin: 0 0 4px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .message {
                color: #374151;
                font-size: 14px;
                line-height: 1.5;
                margin: 0;
            }
            .score {
                font-size: 12px;
                color: #6B7280;
                margin-top: 8px;
                font-weight: 500;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
        <div class="banner">
            <div class="icon">${icon}</div>
            <div class="content">
                <h3 class="title">${title}</h3>
                <p class="message">${verdict.reason}</p>
                <div class="score">AI Risk Confidence: ${verdict.risk_score}%</div>
            </div>
        </div>
    `;
}

// 2. CONNECTION LOGIC
async function analyzeWithAI(safeText) {
    try {
        const response = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: safeText })
        });

        const verdict = await response.json();
        console.log("🤖 AI VERDICT:", verdict);

        // ONLY SHOW BANNER IF THREAT (Or strict mode)
        // For the Demo, we show it if threat is detected OR if we want to show "Safe" status
        if (verdict.is_threat) {
            createWarningBanner(verdict);
        }

    } catch (error) {
        console.error("AI Connection Error:", error);
    }
}

// 3. MAIN LOOP
const EMAIL_BODY_SELECTOR = '.a3s.aiL'; // Gmail's message body class
let lastProcessedText = "";

function extractEmailContent() {
    const emailBodies = document.querySelectorAll(EMAIL_BODY_SELECTOR);
    if (emailBodies.length > 0) {
        // Gmail loads multiple divs; the last one is usually the visible open email
        const activeEmail = emailBodies[emailBodies.length - 1];
        const rawText = activeEmail.innerText;

        // Debounce: Only process if text is new and substantial
        if (rawText && rawText !== lastProcessedText && rawText.length > 50) {
            lastProcessedText = rawText;
            
            // Clean DOM of old banners if user switched emails
            const existingBanner = document.getElementById('aegis-x-root');
            if (existingBanner) existingBanner.remove();

            // Run Privacy Engine (Sanitize.js must be loaded in manifest)
            // Ensure AegisPrivacy is defined (from sanitize.js)
            if (typeof AegisPrivacy !== 'undefined') {
                const sanitizedText = AegisPrivacy.redact(rawText);
                console.log("🔒 Sending Sanitized Data...");
                analyzeWithAI(sanitizedText);
            } else {
                console.error("❌ sanitize.js not loaded!");
            }
        }
    }
}

// Watch for page changes
const observer = new MutationObserver(() => {
    // Simple debounce to prevent freezing
    clearTimeout(window.executionDelay);
    window.executionDelay = setTimeout(extractEmailContent, 1000);
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("🛡️ Aegis-X Loaded.");