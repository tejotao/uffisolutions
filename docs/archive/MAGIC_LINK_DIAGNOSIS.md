# 🚨 Critical: Magic Link Configuration Action Required

**Issue Identified:**
The error screenshot (`ERR_CONNECTION_REFUSED` on `localhost:3000`) confirms that Supabase is redirecting you to `localhost` instead of your actual live Preview URL. 

This happens because your specific Preview URL is not whitelisted in Supabase, so it falls back to the default "Site URL" (which is set to localhost).

**Solution (You must do this in Supabase Dashboard):**

1.  **Copy your current Preview URL.**
    *   Look at your browser address bar right now (e.g., `https://7da2389a-....preview.hostinger.com`).
    *   Copy the base part (the origin), e.g., `https://7da2389a-....preview.hostinger.com`.

2.  **Go to Supabase Dashboard.**
    *   Navigate to **Authentication** > **URL Configuration**.

3.  **Update "Site URL":**
    *   Change the "Site URL" from `http://localhost:3000` to your copied Preview URL.

4.  **Update "Redirect URLs":**
    *   Add your Preview URL to the **Redirect URLs** list.
    *   It is highly recommended to add the specific dashboard path as well:
        *   `https://<your-preview-url>/dashboard`
        *   `https://<your-preview-url>/`
        *   `http://localhost:3000/**` (keep this for local testing if needed)

**Why this works:**
Our code specifically requests a redirect to `${window.location.origin}/dashboard`. Supabase checks this request against your "Redirect URLs" whitelist. If it finds a match, it sends the correct link. If it doesn't, it ignores our request and sends the user to the default Site URL (localhost), causing the error you see.