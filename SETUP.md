# Setup (about 10 minutes, once)

You'll do three things: put the site on GitHub Pages, create your private Google Sheet backend, then connect each device.

## 1. Put the site online (GitHub Pages)

1. Open https://github.com/dpalate4185/application-tracker
2. Click **Add file → Upload files**, drag in `index.html`, `README.md`, `SETUP.md` and `Code.gs`, then click **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, **Branch** to `main` and folder `/ (root)`, then **Save**.
4. Wait 1–2 minutes. Your site is at **https://dpalate4185.github.io/application-tracker/**

## 2. Create your private Google Sheet backend

1. Go to https://sheets.new to create a new Google Sheet. Name it something like *Job Applications*. Keep it private (don't share it).
2. In the Sheet, open **Extensions → Apps Script**.
3. Delete everything in the editor, then paste the whole contents of `Code.gs` from this repo.
4. On the line `const PASSCODE = 'CHANGE-ME-to-four-random-words';`, replace the text inside the quotes with your own passcode. Use four random words, e.g. `maple-orbit-canyon-tulip`. Don't reuse a real password.
5. Click the **Save** icon.
6. Click **Deploy → New deployment**. Click the gear next to *Select type* and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**. Google asks you to authorize: choose your account, then **Advanced → Go to (project name) (unsafe) → Allow**. This warning appears for every personal script that Google hasn't reviewed; it's your own script running on your own Sheet.
8. Copy the **Web app URL** (it ends in `/exec`). Keep it somewhere safe, like a note on your phone.

"Who has access: Anyone" only lets the website reach the script without a Google login. Every request still has to carry your passcode, or the script returns nothing.

## 3. Connect each device

1. Open https://dpalate4185.github.io/application-tracker/
2. Paste the Web app URL and your passcode, then tap **Connect**.
3. That device remembers it. Do the same on your phone and laptop.

Tip: on your phone, use **Share → Add to Home Screen** (iPhone) or **⋮ → Add to Home screen** (Android) so it opens like an app.

## Changing things later

- **Change the passcode:** edit `PASSCODE` in Apps Script, save, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same. Reconnect each device with the new passcode.
- **Used a shared computer?** Tap **Forget this device** at the bottom of the tracker.
- **Your data** is always visible in the Sheet's *Applications* tab. Don't rename the tab or reorder its columns.
