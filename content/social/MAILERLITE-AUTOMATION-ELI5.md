# MailerLite Automation Setup ELI5

**Goal:** Set up 5 emails that fire automatically after someone buys the $2.97 guide.

**You already did the hard part:** created the BTC Buyers group (ID 194751098908575220). The Stripe webhook is wired to that group. So every buyer lands there automatically.

**What's left:** teach MailerLite to send 5 emails when someone lands in that group.

This walkthrough assumes zero prior experience with MailerLite automations. Read it once. Do it once. Never do it again.

---

## Before you start

Open two browser tabs:

1. **Tab 1:** Log into MailerLite → `dashboard.mailerlite.com`
2. **Tab 2:** Open your repo → GitHub → `content/emails/` folder. You will copy-paste from 5 files inside it: `BTC01-day0-welcome.md` through `BTC05-day14-purium.md`

Keep both tabs open the whole time.

---

## Step 1. Find the Automations page

- In MailerLite left sidebar, look for **"Automation"**. Click it.
- Top-right of the page, click the orange **"Create automation"** button.
- Give it a name: `Break The Cycle Buyer Sequence`
- Click **"Save and continue"** or **"Create"** (whatever the button says).

You will land on the automation builder. It looks like a flowchart with one green circle at the top that says **"Trigger"**.

---

## Step 2. Set the trigger (this is what starts the emails)

- Click the green **"Trigger"** circle.
- A menu opens. Pick **"When subscriber joins a group"** (sometimes worded "Subscriber joins group").
- It will ask which group. Pick your **BTC Buyers** group (the one you already created).
- Click **"Save"** or **"Done"**.

Now the flowchart shows: Trigger → (empty).

---

## Step 3. Add Email 1 (Day 0 — Welcome)

- Below the trigger, click the **"+"** button (add step).
- Menu opens. Pick **"Email"**.
- MailerLite drops in an empty email step. Click **"Design email"** or **"Create email"**.
- It opens the email editor. Do this in order:

  **3a. Set the subject line:**
  - Field labeled "Subject." Paste: `You got the guide. Now read it before you sleep.`
  - Preview text / preheader field. Paste: `Your PDF is inside. The rule that changes everything is on page 3.`
  - From name: `KING SUMMERBODY`
  - From email: `contact@sweatdepartment.com`

  **3b. Design the email body:**
  - Pick the "drag-and-drop editor" (not the plain text one).
  - Delete any placeholder blocks that are there by default.
  - Add ONE **Text block**.
  - Open `BTC01-day0-welcome.md` from your repo. Everything under `## BODY` and above `## CTA` — copy that whole chunk. Paste it into the Text block. Make sure `[First Name]` at the top becomes a MailerLite personalization field (in the toolbar, look for a `{ }` icon or "Merge tag" option, insert `name` field there).
  - Add a **Button block** below the text.
    - Button text: `HIT REPLY TO KING`
    - Button URL: `mailto:contact@sweatdepartment.com?subject=Page%203%20takeaway`
    - Button color: `#F15002`
    - Text color: white
  - Add another **Text block** below the button.
    - Paste the "SECONDARY" section from the same file.
  - Add another **Text block** for the sign-off, P.S., and P.P.S. (paste from the same file).
  - Save.

  **3c. Set send timing:**
  - Look for a "When to send" or "Delay" field for this email step.
  - Set it to **"Send immediately"** or **"Wait 0 minutes"**.
  - Save.

---

## Step 4. Add the other 4 emails (repeat step 3 pattern)

Same pattern as Step 3, but with these files and delays:

| # | File | Subject | Delay before sending |
|---|---|---|---|
| 2 | `BTC02-day2-nextrightchoice.md` | Did you make the next right choice today? | **2 days** after email 1 |
| 3 | `BTC03-day5-discoverycall.md` | The 5 Pillars. And why I don't put them in the guide. | **3 days** after email 2 (so Day 5 total) |
| 4 | `BTC04-day10-proof.md` | 220 lbs is not where I meant to stop. | **5 days** after email 3 (Day 10 total) |
| 5 | `BTC05-day14-purium.md` | The one product I use every day. Not the one you think. | **4 days** after email 4 (Day 14 total) |

For each one:
1. Click "+" to add a step
2. Pick **"Delay"** first, set the number of days
3. Then click "+" again after the delay, pick **"Email"**
4. Fill in subject, preheader, body from the matching `.md` file
5. Save

So the final flowchart looks like:
```
Trigger (joins BTC Buyers group)
  ↓
Email 1 (Day 0)
  ↓
Delay 2 days
  ↓
Email 2
  ↓
Delay 3 days
  ↓
Email 3
  ↓
Delay 5 days
  ↓
Email 4
  ↓
Delay 4 days
  ↓
Email 5
  ↓
End
```

---

## Step 5. Turn it ON

- Top-right of the automation builder, there is a toggle or button labeled **"Enable"**, **"Activate"**, or **"Start"**.
- Click it. It turns green / says "Active."
- If it asks for confirmation, click **"Yes, activate."**

The automation is now live. New buyers will get the first email within a few minutes of purchase.

---

## Step 6. Test it (do this once, do not skip)

1. Open `sweatdepartment.com/guide` in an incognito window
2. Buy your own guide for $2.97 with a real card
3. Wait 60 seconds
4. Check your MailerLite → BTC Buyers group. **Your email should show up.**
5. Wait 3 more minutes. **Email 1 should hit your inbox.**
6. Go to Stripe → refund the payment to yourself (Payments → your payment → Refund).

If email 1 didn't arrive:
- Check Stripe Dashboard → Webhooks → your endpoint. Should show green checkmarks. If not, that's the webhook not firing.
- Check Netlify → Functions → `stripe-purchase-hook` → View logs. Look for `stripe_purchase_processed`. If that line is missing, the function didn't run.
- Check MailerLite → BTC Buyers group. If your email is there but no email fired, the automation is not active or the delay is wrong.
- Paste any error you see back to Claude and we debug.

---

## What to do if you get stuck (real talk)

If MailerLite's UI changed since I wrote this and a button doesn't look like what I described:
1. Take a screenshot of the screen you are stuck on
2. Paste it in the chat
3. Say "stuck here"
4. I will tell you the next click based on the screenshot

Do not spend more than 5 minutes stuck. Screenshot + ask.
