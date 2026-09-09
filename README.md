# 📸 Sidography Photography & Films - WhatsApp AI Bot

Automated AI Assistant for WhatsApp that connects your existing WhatsApp phone number to automatically respond to customer inquiries in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 🚀 How to Start (कसे चालू करावे)

### Option A: One-Click Startup (सर्वात सोपे)
Simply double-click:
`start_whatsapp_bot.bat` (in the project root) or `whatsapp_bot/start_bot.bat`

### Option B: Terminal Command
Open PowerShell or Command Prompt:
```powershell
cd d:\Sudarshan_Tupare_Photography_Website20256\whatsapp_bot
npm install
npm start
```

---

## 📱 How to Connect Your WhatsApp (कसे कनेक्ट करावे)

1. When you start the bot, a **QR Code** will be displayed inside your terminal window.
2. Open WhatsApp on your mobile phone.
3. Go to **Settings** (or 3 dots in the top-right) ➔ **Linked Devices** ➔ **Link a Device**.
4. Scan the QR code from the terminal screen.
5. **Done!** The terminal will say `✅ SUCCESS: Connected to WhatsApp!`.
6. You only need to scan **once**. The login session is saved automatically in `auth_info/`. Next time you start the bot, it reconnects automatically!

---

## 🤖 Features & Capabilities

- **Automatic Language Detection**:
  - If a customer messages in **Marathi** (Devanagari or Marathlish like *"Pre-wedding che charges kay ahet?"*), the bot replies in **Marathi**.
  - If a customer messages in **Hindi** (Devanagari or Hinglish like *"Wedding photography me kya milega?"*), the bot replies in **Hindi**.
  - If a customer messages in **English**, the bot replies in **English**.
- **Accurate Studio Knowledge**:
  - Wedding Photography (₹50,000)
  - Pre-wedding Shoot (₹25,000)
  - Portrait / Model Sessions (₹15,000)
  - Event Coverage (₹30,000)
  - Add-ons (Drone starting ₹20k, Cinematic Video starting ₹75k, Photo Albums)
  - Studio Location (Pune, Maharashtra, travels across India & abroad)
- **Automatic PDF Quotation & Brochure Delivery (NEW)**:
  - Whenever a customer asks for a **PDF**, **Quotation (कोटेशन)**, **Estimate**, **Bill**, or **Brochure**:
    - The bot recognizes the package (Wedding, Pre-Wedding, Portrait, Event, or All).
    - It generates a luxury gold & charcoal branded **Official PDF Document** in memory in < 200ms.
    - Sends both a friendly text reply AND the **PDF file attachment** directly in the customer's WhatsApp chat!
- **Safety Filters**:
  - Ignores group chats and WhatsApp status updates.
  - Only responds to direct 1-on-1 customer messages.
  - Does not reply to messages sent by yourself.
  - Shows `typing...` indicator on customer's WhatsApp while generating answers.
