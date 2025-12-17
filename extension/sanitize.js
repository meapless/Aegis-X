/**
 * Aegis-X Privacy Engine
 * runs locally in the browser.
 */

const AegisPrivacy = {
    // Regex Patterns
    patterns: {
        // Matches emails (e.g., victor@gmail.com)
        email: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
        
        // Matches Kenyan Phones: +2547xx, 07xx, 01xx
        phone: /\b(?:\+254|0)(?:7|1)\d{8}\b/g,
        
        // Matches Currency: KES 50,000, Ksh. 200, $500, 50,000/=
        money: /(?:Ksh|KES|Sh|USD|\$|€)\.?\s?[\d,]+(?:\.\d{2})?|[\d,]+\/=/gi,
        
        // Matches KRA PINs (A000...Z) - Basic pattern
        kraPin: /\b[A-Z]\d{9}[A-Z]\b/g,
        
        // Matches likely Account Numbers (8-16 digits)
        account: /\b\d{8,16}\b/g
    },

    redact: function(text) {
        if (!text) return "";
        
        let safeText = text;

        // 1. Redact Emails
        safeText = safeText.replace(this.patterns.email, '{{EMAIL_ID}}');

        // 2. Redact Phone Numbers
        safeText = safeText.replace(this.patterns.phone, '{{PHONE_ID}}');

        // 3. Redact Money
        safeText = safeText.replace(this.patterns.money, '{{MONEY_VAL}}');

        // 4. Redact KRA PINs
        safeText = safeText.replace(this.patterns.kraPin, '{{GOV_ID}}');

        // 5. Redact Long Numbers (Potential Bank Accounts)
        // We run this last to avoid breaking phone numbers if they weren't caught
        safeText = safeText.replace(this.patterns.account, '{{ACC_NUM}}');

        return safeText;
    }
};