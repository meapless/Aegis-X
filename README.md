# Aegis-X: The Zero-Knowledge Semantic Firewall

### 🛡️ AI Security without the Privacy Compromise.

**Aegis-X** is a browser-based security agent that protects users from Business Email Compromise (BEC) and sophisticated phishing attacks. It utilizes a novel **"Redact-then-Reason"** architecture to leverage the power of Large Language Models (LLMs) while ensuring that no Personally Identifiable Information (PII) ever leaves the user's device.

built for the **NIRU AI Hackathon 2025**.

---

## 🚀 The Problem

Traditional cybersecurity tools defend the network, not the human.
1.  **Context Blindness:** Firewalls cannot "read" the psychological manipulation in text-only phishing emails.
2.  **Privacy Deadlock:** Organizations cannot use cloud-based AI to analyze internal emails due to strict Data Protection laws (e.g., Kenya Data Protection Act 2019).

**Aegis-X allows high-security organizations to use AI for threat detection without leaking state secrets or user data.**

## ⚙️ How It Works

Aegis-X operates as a strictly decoupled pipeline:

1.  **The Sensor (Client-Side):** A Chrome Extension monitors the DOM for opened emails.
2.  **The Sanitizer (Edge Logic):** A WebAssembly/JS engine identifies and redacts PII (Names, IDs, Phone Numbers, Financials) *locally* using regex patterns.
3.  **The Brain (Server-Side):** The sanitized "skeleton" of the email is sent to our stateless Python API.
4.  **The Verdict:** The AI analyzes the structural intent (e.g., "False Urgency," "Authority Mimicry") and returns a verdict.
5.  **The Shield:** If a threat is detected, an alert overlay is injected into the user's email client explaining the risk in plain English.

## 🛠️ Tech Stack

*   **Frontend:** Chrome Extension (Manifest V3), JavaScript (ES6+), DOM MutationObservers.
*   **Privacy Engine:** Custom Regex & `compromise.js` for Client-Side NER (Named Entity Recognition).
*   **Backend API:** Python (FastAPI), Uvicorn.
*   **AI Model:** OpenAI GPT-4o-mini (Optimized for JSON output).

## 📦 Installation & Setup

### Prerequisites
*   Google Chrome / Brave / Edge
*   Python 3.9+
*   OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/aegis-x.git
cd aegis-x
