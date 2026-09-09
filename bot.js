import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { generateQuotationPDF, generatePaymentReceiptPDF } from './pdfGenerator.js';

import fs from 'fs';

// Automatically load environment variables from .env file if present
if (fs.existsSync('.env') && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env');
  } catch (err) {
    console.warn("Notice: could not load .env file:", err.message);
  }
}

// OpenRouter API Key for Sidography AI
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const SYSTEM_PROMPT = `You are the official AI Assistant for "Sidography Photography & Films" (सिडोग्राफी फोटोग्राफी अँड फिल्म्स), founded and led by Sudarshan Tupare. You are responding directly to customer inquiries on WhatsApp.

### BUSINESS & STUDIO DETAILS:
- Founder & Lead Photographer: Sudarshan Tupare (Sidography)
- Location & Studio: Pune, Maharashtra, India.
- Availability: Shoots in Pune, all over Maharashtra, destination weddings across India, and international shoots.
- Experience & Milestones: Over 4+ to 8+ years of photography experience, 500+ happy clients, 1000+ successful photoshoots, 50+ industry awards.
- Photography Style: Cinematic lighting, raw candid emotions, artistic storytelling.
- Phone / WhatsApp: +91 96375 77691
- Email: sidographyfilms@gmail.com
- Instagram: @sidography.co.in
- Website: https://sidography.co.in

### PACKAGES & PRICING:
1. Wedding Photography (लग्नाची फोटोग्राफी):
   - Price: ₹50,000 (plus taxes)
   - Duration: Full Day (8-10 hours coverage)
   - Deliverables: 2 photographers, 500+ high-resolution edited photos, pre-wedding consultation, online gallery, USB drive with all photos.
2. Pre-wedding Shoot (प्री-वेडिंग शूट):
   - Price: ₹25,000 (plus taxes)
   - Duration: 4-6 hours
   - Deliverables: Location scouting, 2-3 outfit changes, professional editing, 100+ edited photos, cinematic video highlights, social media ready reels.
3. Portrait & Model Sessions (पोर्ट्रेट / मॉडेल फोटोशूट):
   - Price: ₹15,000 (plus taxes)
   - Duration: 2-3 hours
   - Deliverables: Studio or outdoor location, professional lighting, wardrobe consultation, 50+ edited photos, retouched portraits, print release.
4. Event Coverage (इव्हेंट फोटोग्राफी):
   - Price: ₹30,000 (plus taxes)
   - Duration: 6-8 hours
   - Deliverables: Corporate events, birthdays, anniversaries. Candid & posed shots, group photos, 300+ edited photos, same-day preview, online gallery within 48 hours.
5. Additional Add-ons:
   - Cinematic Videography: Starting at ₹75,000 (drone shots + movie-grade video edit)
   - Luxury Photo Albums: Starting at ₹15,000
   - Drone Photography: Starting at ₹20,000 (4K aerial shots)
   - Destination Weddings: Custom Quote based on location and days
   - Baby Shoot & Maternity Shoot: Custom packages available

### 4-STEP BOOKING PROCESS:
1. Consultation: Discuss your vision, dates, and requirements.
2. Booking: Confirm package and pay advance to lock the date.
3. Photoshoot: Professional shoot with top-tier camera and lighting gear.
4. Delivery: High-resolution photos & video delivery via online gallery.

### CRITICAL WHATSAPP & MULTILINGUAL RULES:
1. **LATEST MESSAGE LANGUAGE PRIORITY:**
   - If the user writes in **MARATHI** (मराठी or Roman Marathlish, e.g. "Lagnache charges kiti?"): Reply in polite, warm MARATHI (उदा. "नमस्कार! सिडोग्राफी मध्ये आपले स्वागत आहे...").
   - If the user writes in **HINDI** (हिंदी or Hinglish, e.g. "Pre-wedding me kya include hai?"): Reply in polite, warm HINDI (उदा. "नमस्ते! सिडोग्राफी में आपका स्वागत है...").
   - If the user writes in **ENGLISH**: Reply in crisp, professional ENGLISH.
   - If user switches language mid-conversation, immediately switch your response to their latest language!
2. **FORMATTING FOR WHATSAPP:**
   - Keep answers clean, friendly, and well-spaced. Use bullet points and appropriate emojis (📸, 💍, ✨, 📅).
   - For custom date availability or booking finalization, let them know Sudarshan will also directly connect with them on this WhatsApp chat.
3. **PDF & QUOTATION DOCUMENT REQUESTS:**
   - If the user asks for a PDF, quotation, brochure, rate card, or estimate:
     Acknowledge warmly and let them know that their official PDF document is being attached right below in this WhatsApp chat!
4. **PAYMENT & RECEIPT CONFIRMATION:**
   - If the user mentions that payment is done, advance token paid, or asks for a receipt/bill:
     Congratulate and thank them warmly! Confirm that their payment has been registered, event dates are locked on the calendar, and inform them that their official Booking Confirmation & Payment Receipt PDF is attached right below!
5. **ACCURACY:**
   - Strictly follow the packages and prices above.`;

// In-memory conversation history per WhatsApp JID
const userSessions = new Map();

/**
 * Detect customer's inquiry package and whether they want service details / PDF / brochure / rates
 */
function detectServiceOrPdfRequest(text, sessionHistory = []) {
  const lower = text.toLowerCase();

  // 1. Detect service package type
  let detectedPackage = null;
  const isPrewedding = /pre[- ]?wedding|प्री[- ]?वेडिंग|prewed|कपल्स शूट/i.test(text);
  const isPortrait = /portrait|model|पोर्ट्रेट|मॉडेल|portfolio|पोर्टफोलिओ|हेडशॉट|headshot/i.test(text);
  const isEvent = /event|इव्हेंट|इवेंट|birthday|वाढदिवस|corporate|कॉर्पोरेट|anniversary|party|समारंभ/i.test(text);
  const isWedding = /wedding|लग्न|विवाह|शादी|marriage|engagement|साखरपुडा|हळद|haldi|reception|रिसेप्शन/i.test(text);

  if (isPrewedding) detectedPackage = 'prewedding';
  else if (isPortrait) detectedPackage = 'portrait';
  else if (isEvent) detectedPackage = 'event';
  else if (isWedding) detectedPackage = 'wedding';

  // If no package detected in current message, look back at recent conversation history!
  if (!detectedPackage && sessionHistory.length > 0) {
    for (let i = sessionHistory.length - 1; i >= 0; i--) {
      const pastText = sessionHistory[i].content || '';
      if (/pre[- ]?wedding|प्री[- ]?वेडिंग/i.test(pastText)) { detectedPackage = 'prewedding'; break; }
      if (/portrait|model|पोर्ट्रेट|मॉडेल/i.test(pastText)) { detectedPackage = 'portrait'; break; }
      if (/event|इव्हेंट|birthday|corporate/i.test(pastText)) { detectedPackage = 'event'; break; }
      if (/wedding|लग्न|विवाह|शादी/i.test(pastText)) { detectedPackage = 'wedding'; break; }
    }
  }

  // 2. Detect if customer wants PDF, quotation, price, rates, charges, details, packages, services
  const hasDocOrServiceIntent = 
    /pdf|पीडीएफ|quotation|कोटेशन|brochure|ब्रोशर|estimate|अंदाजे|रेट|rate|rates|card|कार्ड|catalogue|catalog|कॅटलॉग|दर|माहिती|details|डिटेल्स|charges|fees|खर्च|किंमत|price|pricing|पॅकेज|package|packages|list|सर्व्हिसेस|services|service|ऑफर|offer|photoshoot|फोटोग्राफी|shoot|द्या|sang|sanga|pathva/i.test(text);

  if (!hasDocOrServiceIntent) return null;
  return detectedPackage || 'all';
}

/**
 * Detect if customer performed Payment, sent transaction details, or asked for payment receipt
 */
function detectPaymentOrReceiptRequest(text, hasMedia = false, sessionHistory = []) {
  const lower = text.toLowerCase();

  // 1. Any image/screenshot sent to business chat is treated as payment confirmation
  if (hasMedia) {
    let pkg = 'wedding';
    if (sessionHistory.length > 0) {
      for (let i = sessionHistory.length - 1; i >= 0; i--) {
        const past = sessionHistory[i].content || '';
        if (/pre[- ]?wedding|प्री[- ]?वेडिंग/i.test(past)) { pkg = 'prewedding'; break; }
        if (/portrait|model|पोर्ट्रेट|मॉडेल/i.test(past)) { pkg = 'portrait'; break; }
        if (/event|इव्हेंट|birthday|corporate/i.test(past)) { pkg = 'event'; break; }
        if (/wedding|लग्न|विवाह|शादी/i.test(past)) { pkg = 'wedding'; break; }
      }
    }
    return pkg;
  }

  // 2. Direct transaction or reference proof
  const hasTxnProof = /utr|txn|transaction|upi ref|ref no|reference no|screenshot|screen shot|स्क्रीनशॉट/i.test(lower);

  // 3. Payment indicators across English, Hinglish, Marathi, Hindi
  const payWord = /payment|पेमेंट|paise|पैसे|advance|अॅडव्हान्स|token|टोकन|अग्रिम|paid|gpay|google pay|phonepe|phone pe|paytm|upi/i.test(lower);
  const actionWord = /done|kela|keli|kelay|kele|kel|zale|jhale|zal|jhal|झाले|केले|केलं|दिले|दिला|दिली|dila|dili|dile|pathavle|pathavla|pathavli|पाठवले|पाठवला|पाठवली|takle|टाकले|transfer|sent|bhetle|bhetla|ho gaya|bhej diya|check|confirm|booking/i.test(lower);

  const receiptWord = /receipt|पावती|pavti|bill|बिल|invoice|इनव्हॉइस/i.test(lower);

  // Numeric amount mentioned with payment/transfer
  const isNumericPay = 
    /(paid|sent|transfer|दिले|पाठवले|टाकले)[\s:]*([₹rs.]*\s*\d+)/i.test(lower) || 
    /([₹rs.]*\s*\d+)[\s:]*(paid|sent|transfer|advance|token|दिले|पाठवले|टाकले)/i.test(lower);

  const isExplicitQuickPay = /^(paid|done|payment done|paid advance|token paid)$/i.test(lower.trim());

  if (!hasTxnProof && !receiptWord && !isNumericPay && !(payWord && actionWord) && !isExplicitQuickPay) {
    return null;
  }

  // Determine specific service package
  if (/pre[- ]?wedding|प्री[- ]?वेडिंग/i.test(text)) return 'prewedding';
  if (/portrait|model|पोर्ट्रेट|मॉडेल/i.test(text)) return 'portrait';
  if (/event|इव्हेंट|birthday|corporate/i.test(text)) return 'event';
  if (/wedding|लग्न|विवाह|शादी/i.test(text)) return 'wedding';

  // Check history
  if (sessionHistory.length > 0) {
    for (let i = sessionHistory.length - 1; i >= 0; i--) {
      const past = sessionHistory[i].content || '';
      if (/pre[- ]?wedding|प्री[- ]?वेडिंग/i.test(past)) return 'prewedding';
      if (/portrait|model|पोर्ट्रेट|मॉडेल/i.test(past)) return 'portrait';
      if (/event|इव्हेंट|birthday|corporate/i.test(past)) return 'event';
      if (/wedding|लग्न|विवाह|शादी/i.test(past)) return 'wedding';
    }
  }

  return 'wedding';
}


// Helper to query OpenRouter AI
async function getAIReply(jid, userText) {
  let history = userSessions.get(jid) || [];
  
  if (history.length > 8) {
    history = history.slice(-8);
  }

  history.push({ role: 'user', content: userText });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sidography.co.in",
        "X-Title": "Sidography Photography WhatsApp Assistant"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 450
      })
    });

    if (!response.ok) {
      console.error("OpenRouter API Error:", response.status, await response.text());
      return "नमस्कार! सध्या काही तांत्रिक अडचण येत आहे. सुदर्शन लवकरच थेट तुमच्याशी या WhatsApp चॅटवर बोलतील. धन्यवाद!";
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) {
      history.push({ role: 'assistant', content: reply });
      userSessions.set(jid, history);
      return reply;
    }

    return "Hello! Thank you for reaching out to Sidography Photography & Films. Sudarshan will assist you shortly on this chat!";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Thank you for contacting Sidography Photography & Films! We will get back to you shortly.";
  }
}

async function startWhatsAppBot() {
  console.log("==================================================");
  console.log("  Sidography Photography & Films - WhatsApp AI Bot");
  console.log("==================================================\n");

  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  });

  // Handle connection updates
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 SCAN THE QR CODE BELOW WITH WHATSAPP TO CONNECT:\n");
      qrcode.generate(qr, { small: true });
      console.log("\nSteps on Mobile: Open WhatsApp -> Settings / 3 Dots -> Linked Devices -> Link a Device\n");
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed (status: ${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000);
      } else {
        console.log("Logged out from WhatsApp. Please delete 'auth_info' folder and scan again.");
      }
    } else if (connection === 'open') {
      console.log("✅ SUCCESS: Connected to WhatsApp!");
      console.log("🚀 AI Assistant is now active and listening for customer inquiries...\n");
    }
  });

  // Save authentication credentials whenever updated
  sock.ev.on('creds.update', saveCreds);

  // Listen for incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) continue;

      // Ignore status broadcasts & group chats (only private 1-on-1 customer chats)
      if (remoteJid === 'status@broadcast' || remoteJid.endsWith('@g.us')) {
        continue;
      }

      // Detect if user sent media (image/screenshot or document)
      const isImage = !!msg.message?.imageMessage;
      const isDocument = !!msg.message?.documentMessage;

      // Extract text message content or media caption
      let userText = 
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.documentMessage?.caption ||
        "";

      // If user sent a photo/screenshot with no caption, assume payment receipt proof
      if ((isImage || isDocument) && !userText.trim()) {
        userText = "पेमेंट स्क्रीनशॉट / ट्रान्झॅक्शन पावती पाठवली आहे";
      }

      if (!userText.trim()) continue;

      const senderNumber = remoteJid.split('@')[0];
      console.log(`\n📩 Incoming message from +${senderNumber}: "${userText}"`);

      // Show typing indicator on customer's WhatsApp
      try {
        await sock.sendPresenceUpdate('composing', remoteJid);
      } catch (e) {
        // non-fatal
      }

      // Fetch user session history for context
      const sessionHistory = userSessions.get(remoteJid) || [];

      // 1. Check if customer performed Payment or requested Services / Quotation PDF
      const paymentPkgKey = detectPaymentOrReceiptRequest(userText.trim(), isImage || isDocument, sessionHistory);
      const pdfPackageKey = !paymentPkgKey ? detectServiceOrPdfRequest(userText.trim(), sessionHistory) : null;

      // 2. Start parallel execution: AI text response + PDF generation concurrently!
      const aiPromise = getAIReply(remoteJid, userText.trim());
      let pdfPromise = null;
      let isReceipt = false;

      if (paymentPkgKey) {
        isReceipt = true;
        console.log(`🧾 Payment detected! Generating Payment Receipt PDF for "${paymentPkgKey}"...`);
        pdfPromise = generatePaymentReceiptPDF({
          packageKey: paymentPkgKey,
          clientPhone: `+${senderNumber}`
        });
      } else if (pdfPackageKey) {
        console.log(`📄 Service / PDF requested! Generating Quotation PDF for "${pdfPackageKey}"...`);
        pdfPromise = generateQuotationPDF({
          packageKey: pdfPackageKey,
          clientPhone: `+${senderNumber}`
        });
      }

      // Wait for both AI text and PDF buffer in parallel for instant response
      const [aiReply, pdfBuffer] = await Promise.all([
        aiPromise,
        pdfPromise ? pdfPromise.catch(e => { console.error("❌ PDF Generation Error:", e); return null; }) : null
      ]);

      console.log(`🤖 AI Reply to +${senderNumber}:\n${aiReply}\n`);

      // 3. Send text reply message first
      try {
        await sock.sendMessage(remoteJid, { text: aiReply });
      } catch (sendTextErr) {
        console.error("❌ Error sending text reply:", sendTextErr);
      }

      // 4. Send PDF document attachment immediately right after
      if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
        try {
          if (isReceipt) {
            console.log(`📤 Dispatching Payment Receipt PDF (${pdfBuffer.length} bytes) to +${senderNumber}...`);
            await sock.sendMessage(remoteJid, {
              document: Buffer.from(pdfBuffer),
              mimetype: 'application/pdf',
              fileName: 'Sidography_Booking_Payment_Receipt.pdf',
              caption: '🧾 Sidography Photography & Films - Official Payment Receipt & Booking Confirmation'
            });
            console.log(`✅ Payment Receipt PDF delivered successfully to +${senderNumber}!`);
          } else {
            const fileNames = {
              wedding: "Sidography_Wedding_Quotation.pdf",
              prewedding: "Sidography_PreWedding_Quotation.pdf",
              portrait: "Sidography_Portrait_Quotation.pdf",
              event: "Sidography_Event_Quotation.pdf",
              all: "Sidography_Services_Catalog_2026.pdf"
            };
            const fileName = fileNames[pdfPackageKey] || "Sidography_Services_Catalog_2026.pdf";

            console.log(`📤 Dispatching Quotation PDF (${pdfBuffer.length} bytes) to +${senderNumber}...`);
            await sock.sendMessage(remoteJid, {
              document: Buffer.from(pdfBuffer),
              mimetype: 'application/pdf',
              fileName: fileName,
              caption: '📸 Sidography Photography & Films - Official Quotation PDF'
            });
            console.log(`✅ Quotation PDF delivered successfully to +${senderNumber}!`);
          }
        } catch (pdfSendErr) {
          console.error("❌ Error sending PDF on WhatsApp:", pdfSendErr);
        }
      } else if (paymentPkgKey || pdfPackageKey) {
        console.warn(`⚠️ Warning: PDF was triggered (pkg: ${paymentPkgKey || pdfPackageKey}) but pdfBuffer was null!`);
      }
    }
  });
}

// Start the service
startWhatsAppBot().catch((err) => {
  console.error("Fatal error starting WhatsApp bot:", err);
});
