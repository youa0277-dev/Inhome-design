# Car Damage Estimate for Base44: code and setup guide

This folder is the car damage estimator rewritten for Base44. It works like the original:

- the customer's location comes first (US state or Canadian province/territory)
- photo-clarity requirements are shown, and the customer must confirm them
- Claude scans the photos
- the estimate is adjusted for location
- a separate "potential damages" section gives its own "between" cost

You need three things, set up in this order:

1. **An Anthropic API key**, which the estimator uses to analyze photos (Part 1).
2. **The code in your Base44 app** (Part 2).
3. **Optional: connect Claude to Base44 through MCP.** This lets Claude make Base44 changes for you (Part 3). The estimator does not need it to work.

> Base44's menus change from time to time. If a button isn't exactly where this guide says, look for the same name nearby, or ask Base44's AI chat where it is.

---

## What's in this folder

| File in this folder | Where it goes in your Base44 app |
|---|---|
| `base44/functions/analyze-damage/entry.ts` | Backend function named **`analyze-damage`** |
| `base44/entities/DamageEstimate.json` | Entity (data table) **`DamageEstimate`**. Optional: saves each estimate |
| `src/pages/CarEstimate.jsx` | Page **`CarEstimate`** |
| `src/components/estimate/EstimatorShell.jsx` | `components/estimate/EstimatorShell.jsx` |
| `src/components/estimate/LocationStep.jsx` | `components/estimate/LocationStep.jsx` |
| `src/components/estimate/PhotoGuidelines.jsx` | `components/estimate/PhotoGuidelines.jsx` |
| `src/components/estimate/EstimateResults.jsx` | `components/estimate/EstimateResults.jsx` |
| `src/components/estimate/pricing.js` | `components/estimate/pricing.js` |
| `src/components/estimate/regions.js` | `components/estimate/regions.js` |
| `src/components/estimate/sample.js` | `components/estimate/sample.js` |
| `src/components/estimate/prepareImage.js` | `components/estimate/prepareImage.js` |
| `src/components/estimate/cx.js` | `components/estimate/cx.js` |

Keep the file names exactly as shown, because the files import each other by name.

---

## Part 1: Get your Anthropic (Claude) API key

The API is billed separately from a Claude.ai Pro or Max subscription. It is pay-as-you-go.

1. Go to **https://console.anthropic.com** and sign up or log in.
2. Open **Settings → Billing** and add credits. Start small, for example $10–20.
3. Open **Settings → Limits** and set a monthly spend limit, so a bug or abuse can't run up a large bill.
4. Open **Settings → API Keys → Create Key**. Name it something like `Base44 car estimator`.
5. **Copy the key now.** It starts with `sk-ant-` and is shown only once. Paste it somewhere safe for the next step.
   Never put the key in page or component code, because anyone can read those files in their browser. It only goes in Base44's secrets (Part 2, step 2).

**Cost per scan:** the estimator uses Claude Opus 5.5, at $4 per million input tokens and $20 per million output tokens. My rough estimate for a scan with a few photos is **$0.10–$0.30**. This hasn't been measured on real photos yet, so check your real usage in the Console after your first few scans.

---

## Part 2: Add the estimator to your Base44 app

### Step 1: Turn on backend functions

In your app's **Dashboard → Settings**, enable **Backend Functions**.

Base44's documentation says this "requires appropriate plan". If you can't turn it on, your plan may need upgrading.

### Step 2: Add the API key as a secret

1. In your app's **Dashboard → Settings → Environment variables** (also called *Secrets*), add a new variable:
   - **Name:** `ANTHROPIC_API_KEY` (exactly like this)
   - **Value:** the `sk-ant-…` key from Part 1
2. Save it.

*If you use the Base44 command line instead:* `base44 secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here`

If your app is already published, **publish it again** after adding or changing the secret. The published version can keep the old value until you do.

### Step 3: Add the backend function

1. Open your app's **Code** tab and find **Functions**.
2. Create a new function named **`analyze-damage`**.
3. Replace its contents with everything in `base44/functions/analyze-damage/entry.ts`, then save or deploy it.

If Base44 won't accept the name `analyze-damage` (for example, it forces `analyzeDamage`), use the name it gives you. Then open `EstimatorShell.jsx` and change this line to match:

```js
const ANALYZE_FUNCTION = "analyze-damage";
```

**Who can run scans:** the function only accepts **signed-in users** of your app, because every scan costs money. If anonymous visitors must be able to get estimates, change `const REQUIRE_LOGIN = true;` to `false` near the top of `entry.ts`. Only do that with a spend limit set (Part 1, step 3).

### Step 4 (optional): Add the `DamageEstimate` entity

This saves every estimate to your app's data, so you and the customer can find it later.

- **In the Code tab:** create an entity named `DamageEstimate` and paste the contents of `base44/entities/DamageEstimate.json`.
- **Or in Base44's AI chat:** paste *"Create an entity called DamageEstimate with exactly this JSON schema:"* followed by the file's contents.

If you skip this step, the estimator still works and simply doesn't save.

### Step 5: Add the components

In the **Code** tab, create a folder **`components/estimate`**. Create each of the 9 files listed in the table above inside it, and paste in each file's contents.

### Step 6: Add the page

Create a page named **`CarEstimate`** (`pages/CarEstimate.jsx`) and paste the contents of `src/pages/CarEstimate.jsx`.

Then add a link to it in your app's menu or home page. Base44's AI chat can do this: *"Add a 'Get a repair estimate' button to the home page that opens the CarEstimate page."*

**Pasting through the AI chat instead of the Code tab:** for each file, write *"Create the file `components/estimate/pricing.js` with exactly this content, don't change anything:"* and paste the file. Do one file per message.

### Step 7: Publish and test

1. Publish the app, then open the CarEstimate page while signed in.
2. Choose **Canada → Ontario**, or a US state. The rest of the form unlocks.
3. Add 2–3 clear photos of real car damage, enter the make and model, tick the confirmation box, and click **Scan & estimate**. It usually takes under a minute.
4. Check that you see a "Between $X and $Y" estimate, damage line items, a **Potential additional damage** section, and that changing the province or state updates the price.

**If something goes wrong:**

| Message or symptom | Fix |
|---|---|
| "Photo analysis isn't configured yet" | The `ANTHROPIC_API_KEY` secret is missing or misspelled. Re-check Step 2, then publish again. |
| "The Anthropic API key was rejected" | The key was copied wrong or deleted. Create a new key (Part 1) and update the secret. |
| "Please sign in to get an estimate" | Sign in to your app, or see *Who can run scans* in Step 3. |
| "Couldn't analyze the photos…" right away | The function name doesn't match. Compare the function's name in Base44 with `ANALYZE_FUNCTION` in `EstimatorShell.jsx`. |
| "We're handling a lot of requests" | You hit your Anthropic rate limit or ran out of credits. Check Billing in the Console. |
| A blank page or an error about a missing icon | Your app's `lucide-react` icon package is very old. Ask the Base44 AI chat to update `lucide-react`. |
| An estimate appears but nothing is saved | The `DamageEstimate` entity is missing or named differently (Step 4). This is optional. |

To see detailed errors, open the function's **logs** in the Base44 dashboard.

---

## Part 3 (optional): Connect Claude to Base44 with MCP

**MCP is not the API key.**

- The **API key** (Parts 1–2) is what your estimator uses to analyze customers' photos. It is **required**.
- **MCP** lets *Claude, your assistant,* sign in to your Base44 account and work on your apps for you: create pages, edit code, manage data. With it, Claude could install this estimator into your app directly instead of you pasting files. It is **optional**.

Requirements: a **Base44 Builder plan or higher**, according to Base44's docs, and a **paid Claude plan** (Pro, Max, Team or Enterprise) for custom connectors.

### In Claude.ai (web or desktop app)

1. Go to **Settings → Connectors**.
2. If **Base44** is already listed (it was already added to this account, but not signed in), click **Connect**. Otherwise click **Add custom connector** and enter:
   - **Name:** `Base44`
   - **URL:** `https://app.base44.com/mcp`
3. Click **Connect**. Sign in to Base44 and **choose the workspace** your app is in. The connection stays tied to that workspace.
4. On the consent screen, allow the access you want. To let Claude edit your app's code, allow write/sandbox access.
5. Start a new conversation and ask, for example: *"Install the car damage estimator from base44-app in my Inhome-design repo into my Base44 app called …"*

### In Claude Code (terminal)

```bash
claude mcp add --transport http base44 https://app.base44.com/mcp
```

Then type `/mcp` inside Claude Code, select **base44**, and choose **Authenticate** to sign in.

---

## Notes and limits

- **Photo privacy:** photos are uploaded with Base44's standard `UploadFile`, which stores them in public storage. The links are long and hard to guess, but anyone who has a link can open it. Mention this in your privacy policy.
- **Regional rates are approximations:** the per-state and per-province labor rates and taxes in `regions.js`, and the USD→CAD parts conversion (1.38), are my estimates, not sourced data. Check them against real local shop rates before relying on the prices.
- **What was tested:** the screens were tested in a browser using a fake Base44 client. The backend function was tested with a simulated Claude reply. Neither has run inside Base44 yet, and no real photos have gone through Claude yet. Do Step 7 carefully the first time, and send any error messages to Claude to fix.
