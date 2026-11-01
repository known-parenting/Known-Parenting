# known: parenting

One small, intentional moment with each of your kids, every day.
This folder is the PWA beta: a web app you install on your phone from the browser. It needs no server and no build step. Everything is saved on the phone.

Version 0.5.3 · service worker `kp-v8`

---

## What's in this folder

```
index.html              the screens
styles.css, app.css     the look (app.css = full-screen phone layout)
app.js                  logic: saving, streaks + grace day, setup, memories, birthday
games.js                hangman, dots and boxes, connect four, memory match (tic-tac-toe is in app.js)
books.js                make a book: place and move pictures, draw freehand, write the words
art.js                  crayon drawings (placeholder art until the illustrator's set is ready)
content/                every card, verse and reminder (edit these, not app.js)
manifest.webmanifest    makes it installable
sw.js                   makes it work offline
icons/                  app icons
wrangler.jsonc, .assetsignore, _headers   Cloudflare hosting
.nojekyll               GitHub Pages hosting
```

---

## 1. Put it on GitHub (GitHub Desktop)

1. Unzip the download. Select everything inside, copy it.
2. Open File Explorer, go to `C:\dev\`, and make a new folder named `known-parenting`.
3. Open that folder and paste. (`index.html` should be directly inside `C:\dev\known-parenting`, not in a subfolder.)
4. Open **GitHub Desktop**.
5. Top left, click **Current repository**, then **Add**, then **Add existing repository…**
6. Click **Choose…**, pick `C:\dev\known-parenting`, click **Select Folder**.
7. It will say "this directory does not appear to be a Git repository." Click the blue **create a repository** link.
8. Name: `known-parenting`. Leave everything else alone. Click **Create repository**.
9. Click **Publish repository** (top right).
10. In the box that opens:
    - Organization / account: pick **Known's GitHub account**, not your pet-waste one.
    - **Keep this code private**: leave it checked if you'll host on Cloudflare. Uncheck it only if you choose GitHub Pages on a free plan (see step 2B).
11. Click **Publish repository**. Done.

**Every change after this:** paste the new files into `C:\dev\known-parenting` → GitHub Desktop → type a short summary bottom left → **Commit to main** → **Push origin**.

---

## 2. Put it on the internet (pick one)

First check how Known: Marriage is hosted today and match it, so you're managing one system, not two.

### 2A. Cloudflare Workers (repo can stay private)

1. Go to dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository**.
2. Connect GitHub if asked, then pick `known-parenting`.
3. Build command: **leave empty**. Deploy command: `npx wrangler deploy`.
4. Click **Deploy**. You get a link like `known-parenting.<you>.workers.dev`.
5. Every push from GitHub Desktop redeploys automatically.

### 2B. GitHub Pages

On a free GitHub account Pages only works with a **public** repo.

1. On github.com, open the repo → **Settings** → **Pages**.
2. Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)**. Click **Save**.
3. Wait about a minute. The link appears at the top of that page.

### Custom domain (knownparenting.com)

Buy it at Cloudflare Registrar (check the price when you buy; it was about $10.46/year in Oct 2026), then:
- Cloudflare Workers: your worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**.
- GitHub Pages: repo **Settings** → **Pages** → **Custom domain**, then add the DNS record GitHub shows you.

---

## 3. Install it on a phone

- **iPhone:** open the link in **Safari** → Share button → **Add to Home Screen**.
- **Android:** open the link in **Chrome** → ⋮ menu → **Install app**.

Once it's opened once, it works offline.

---

## 4. Every time you change something

1. Open `sw.js` and change `VERSION` (`kp-v8` → `kp-v9`).
2. Open `app.js` and change `APP_VERSION` at the top (`0.5.3` → `0.5.4`).
3. Commit and push.

Phones pick up the new version the next time the app is opened (it reloads itself once). You can check which version a phone has at the very bottom of **Settings**.

**Content edits** (cards, verses, reminders) go in the `content/` files only.

---

## 5. Things to test on real phones this week

- [ ] Onboarding, then each kid's page, for a week or two with your own kids
- [ ] **Add reminder to my calendar** on iPhone and Android (calendar files behave differently on each, so this one needs a real-phone check)
- [ ] **Back up my data**, then **Restore** on the same phone
- [ ] Android back button / iPhone swipe-back from a kid's page goes Home instead of closing the app
- [ ] Turn on airplane mode and open the app

---

## 6. Road to the App Store (later)

The plan that matches Known: Marriage: wrap this same web app with **Capacitor** for iOS and Android.

Things to have ready before submitting, because Apple reviews wrapped web apps closely (guideline 4.2, "minimum functionality"):

1. **Real notifications.** Capacitor's Local Notifications plugin can schedule the daily reminder on the phone itself, with no server. This replaces the calendar-file workaround and is the biggest "real app" feature to add.
2. **Premium through RevenueCat**, reusing the marriage setup. The beta flag is `const premium=true` in `app.js`.
3. **Accounts and sync (Supabase)** if you want both parents on one family. Not required for a first release.
4. **Privacy policy, support page and landing page** on knownparenting.com. Apple requires a privacy policy URL. Because the app is about kids, be accurate that it's for parents (not directed at children) and that kids' words stay on the parent's device.
5. **Real crayon art and app icon** from the illustrator.

When you're ready, the Capacitor setup is: `npm init -y`, `npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`, move these web files into a `www` folder, `npx cap init`, `npx cap add ios`. iOS builds need a Mac (or a cloud Mac service); the marriage app went through this already, so reuse whatever worked there.
