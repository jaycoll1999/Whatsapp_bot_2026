import PDFDocument from 'pdfkit';

/**
 * Service Packages catalog data
 */
export const PACKAGES = {
  wedding: {
    title: "Wedding Photography Package",
    category: "Wedding",
    price: "₹50,000",
    numericPrice: 50000,
    duration: "Full Day (8-10 Hours)",
    team: "2 Lead Candid & Traditional Photographers",
    deliverables: [
      "Full day pre-ceremony to reception coverage",
      "500+ High-Resolution, Professionally Color-Graded Photos",
      "Private Online Cloud Gallery (1-year access for family & friends)",
      "Premium USB Drive delivered with all raw and edited files",
      "Pre-wedding consultation & timeline planning session"
    ],
    recommendedAddons: [
      "Cinematic Wedding Film (Drone included): +₹75,000",
      "Luxury Custom Photo Album (Premium Leather/Hardcover): +₹15,000",
      "Aerial 4K Drone Photography: +₹20,000"
    ]
  },
  prewedding: {
    title: "Pre-Wedding Shoot Package",
    category: "Pre-Wedding",
    price: "₹25,000",
    numericPrice: 25000,
    duration: "4 - 6 Hours Coverage",
    team: "Lead Creative Photographer & Lighting Assistant",
    deliverables: [
      "Multiple scenic locations (outdoor / indoor scouting)",
      "2 - 3 Outfit Changes with style direction",
      "100+ High-Resolution Color-Graded Master Photos",
      "Cinematic Teaser & Video Highlights for Social Media Reels",
      "High-speed digital delivery via private download link"
    ],
    recommendedAddons: [
      "Aerial 4K Drone Couple Shots: +₹15,000",
      "Same-Day Edited Teaser: +₹10,000",
      "Designer Save-the-Date Digital Invite: +₹5,000"
    ]
  },
  portrait: {
    title: "Portrait & Model Shoot Package",
    category: "Portrait / Fashion",
    price: "₹15,000",
    numericPrice: 15000,
    duration: "2 - 3 Hours Session",
    team: "Lead Portrait Photographer & Lighting Technician",
    deliverables: [
      "Studio or outdoor natural light shoot in Pune",
      "Professional lighting and studio backdrops setup",
      "Wardrobe and posing consultation",
      "50+ Edited & Retouched Magazine-Grade Portraits",
      "Commercial print & digital usage rights release"
    ],
    recommendedAddons: [
      "Extra Outfit Look: +₹4,000",
      "Pro Makeup & Hair Artist on Set: +₹8,000"
    ]
  },
  event: {
    title: "Comprehensive Event Coverage",
    category: "Corporate / Birthday / Anniversary",
    price: "₹30,000",
    numericPrice: 30000,
    duration: "6 - 8 Hours Event Coverage",
    team: "2 Event Photographers (Candid & Group coverage)",
    deliverables: [
      "Stage, candids, guest interactions, and VIP portraits",
      "300+ Fully Edited High-Resolution Photos",
      "Same-day preview highlights for press/social media",
      "Complete online web gallery delivered within 48 hours"
    ],
    recommendedAddons: [
      "Live Photo Booth with Instant Prints: +₹25,000",
      "Full Event Highlight Video (3-5 min): +₹35,000"
    ]
  },
  all: {
    title: "Complete Studio Service Catalog & Price Guide",
    category: "Master Brochure",
    price: "Full Catalog",
    numericPrice: 0,
    duration: "Various Packages",
    team: "Sidography Creative Crew",
    deliverables: [
      "Wedding Photography: Starting at ₹50,000",
      "Pre-Wedding Shoots: Starting at ₹25,000",
      "Cinematic Videography & Films: Starting at ₹75,000",
      "Portrait & Model Portfolio: Starting at ₹15,000",
      "Event Coverage (Corporate & Private): Starting at ₹30,000",
      "Maternity & Newborn Baby Shoots: Custom Packages",
      "Aerial 4K Drone Photography: Starting at ₹20,000",
      "Handcrafted Luxury Photo Albums: Starting at ₹15,000"
    ],
    recommendedAddons: [
      "Destination Weddings across India & Worldwide: Custom Quotations"
    ]
  }
};

/**
 * Generate a luxury PDF Quotation / Estimate / Brochure Buffer
 */
export function generateQuotationPDF(options = {}) {
  const opts = typeof options === 'string' ? { packageKey: options } : (options || {});
  const {
    clientName = "Valued Customer",
    clientPhone = "",
    packageKey = "wedding",
    customAddons = [],
    notes = ""
  } = opts;
  return new Promise((resolve, reject) => {
    try {
      const selectedPkg = PACKAGES[packageKey] || PACKAGES.wedding;
      const isMasterBrochure = packageKey === "all";

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Sidography - ${selectedPkg.title}`,
          Author: "Sidography Photography & Films",
          Subject: "Official Service Quotation & Estimate",
          Keywords: "Photography, Wedding, Pune, Sidography, Quotation"
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const goldColor = "#c89b3c";
      const darkCharcoal = "#161618";
      const lightGray = "#f4f4f5";
      const textMuted = "#6b7280";

      // -------------------------------------------------------------
      // 1. TOP HEADER BANNER (Luxury Charcoal & Gold)
      // -------------------------------------------------------------
      doc.rect(40, 40, 515, 80).fill(darkCharcoal);

      // Gold Accent line
      doc.rect(40, 118, 515, 3).fill(goldColor);

      // Title & Subtitle inside banner
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(goldColor)
        .text("SIDOGRAPHY PHOTOGRAPHY & FILMS", 55, 55, { characterSpacing: 1 });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor("#e4e4e7")
        .text("By Sudarshan Tupare  •  Pune, Maharashtra, India", 55, 82);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor("#a1a1aa")
        .text("WhatsApp: +91 96375 77691  |  Email: sidographyfilms@gmail.com  |  Web: sidography.co.in", 55, 98);

      // -------------------------------------------------------------
      // 2. DOCUMENT INFO & CLIENT BOX
      // -------------------------------------------------------------
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const quoteNo = `SIDO-${Date.now().toString().slice(-6)}`;

      doc.rect(40, 135, 515, 52).fill(lightGray);

      // Left column: Client info
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(darkCharcoal)
        .text("PREPARED FOR:", 55, 145);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor("#27272a")
        .text(`${clientName} ${clientPhone ? `(${clientPhone})` : ''}`, 55, 158);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textMuted)
        .text(`Inquiry Event: ${selectedPkg.category}`, 55, 172);

      // Right column: Quotation metadata
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(darkCharcoal)
        .text("QUOTATION REF:", 360, 145);

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(goldColor)
        .text(quoteNo, 360, 158);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textMuted)
        .text(`Issue Date: ${today}`, 360, 172);

      // -------------------------------------------------------------
      // 3. MAIN PACKAGE SECTION
      // -------------------------------------------------------------
      let currentY = 205;

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(darkCharcoal)
        .text(isMasterBrochure ? "SERVICES & PRICING BROCHURE" : "SELECTED PACKAGE DETAILS", 40, currentY);

      currentY += 22;

      // Package Box Container
      const boxHeight = isMasterBrochure ? 240 : 180;
      doc.roundedRect(40, currentY, 515, boxHeight, 6).strokeColor("#e4e4e7").stroke();

      // Package Header inside box
      doc.rect(40, currentY, 515, 34).fill("#27272a");

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor("#ffffff")
        .text(selectedPkg.title, 55, currentY + 10);

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(goldColor)
        .text(selectedPkg.price, 400, currentY + 10, { width: 140, align: 'right' });

      let insideY = currentY + 44;

      if (!isMasterBrochure) {
        // Duration & Crew
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(darkCharcoal)
          .text("Duration: ", 55, insideY);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor("#3f3f46")
          .text(selectedPkg.duration, 110, insideY);

        insideY += 16;

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(darkCharcoal)
          .text("Crew: ", 55, insideY);
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor("#3f3f46")
          .text(selectedPkg.team, 110, insideY);

        insideY += 22;

        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor(darkCharcoal)
          .text("Scope of Deliverables Included:", 55, insideY);

        insideY += 14;
      }

      // Deliverables list
      selectedPkg.deliverables.forEach(item => {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(goldColor)
          .text("• ", 55, insideY);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor("#27272a")
          .text(item, 68, insideY, { width: 470 });

        insideY += isMasterBrochure ? 20 : 16;
      });

      currentY += boxHeight + 18;

      // -------------------------------------------------------------
      // 4. RECOMMENDED ADD-ONS SECTION
      // -------------------------------------------------------------
      if (selectedPkg.recommendedAddons && selectedPkg.recommendedAddons.length > 0) {
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(darkCharcoal)
          .text("AVAILABLE UPGRADES & ADD-ONS", 40, currentY);

        currentY += 16;

        selectedPkg.recommendedAddons.forEach(addon => {
          doc
            .font('Helvetica-Bold')
            .fontSize(8.5)
            .fillColor(goldColor)
            .text("+", 55, currentY);

          doc
            .font('Helvetica')
            .fontSize(8.5)
            .fillColor("#3f3f46")
            .text(addon, 70, currentY, { width: 470 });

          currentY += 14;
        });

        currentY += 10;
      }

      // -------------------------------------------------------------
      // 5. BOOKING TERMS & POLICY
      // -------------------------------------------------------------
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(darkCharcoal)
        .text("TERMS & BOOKING POLICY", 40, currentY);

      currentY += 16;

      const terms = [
        "Date Confirmation: 25% advance token payment is required to lock your event date on our calendar.",
        "Deliverables Timeline: Edited photos and online gallery delivered within 15-20 days of the shoot.",
        "Travel & Lodging: For outstation / destination shoots outside Pune, travel & stay are arranged by client.",
        "Payment Modes: UPI, Bank Transfer, or Cash. Balance payment due on or before the event date."
      ];

      terms.forEach(t => {
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor(goldColor)
          .text("✓", 55, currentY);

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor("#52525b")
          .text(t, 70, currentY, { width: 470 });

        currentY += 13;
      });

      // -------------------------------------------------------------
      // 6. BOTTOM FOOTER & SIGN-OFF
      // -------------------------------------------------------------
      doc.rect(40, 755, 515, 1).fill("#e4e4e7");

      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(darkCharcoal)
        .text("Ready to reserve your date? Message us directly on WhatsApp at +91 96375 77691", 40, 765, {
          align: 'center',
          width: 515
        });

      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(textMuted)
        .text("Sidography Photography & Films  •  Crafting Timeless Visual Stories  •  Instagram: @sidography.co.in", 40, 778, {
          align: 'center',
          width: 515
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate a luxury PDF Booking Confirmation & Payment Receipt
 */
export function generatePaymentReceiptPDF(options = {}) {
  const opts = typeof options === 'string' ? { packageKey: options } : (options || {});
  const {
    clientName = "Valued Customer",
    clientPhone = "",
    packageKey = "wedding",
    paymentMethod = "UPI / Online Transfer",
    transactionRef = ""
  } = opts;
  return new Promise((resolve, reject) => {
    try {
      const selectedPkg = PACKAGES[packageKey] || PACKAGES.wedding;
      const totalAmount = selectedPkg.numericPrice || 50000;
      const advanceAmount = Math.round(totalAmount * 0.25); // 25% booking token
      const balanceAmount = totalAmount - advanceAmount;

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Sidography - Payment Receipt (${selectedPkg.title})`,
          Author: "Sidography Photography & Films",
          Subject: "Official Payment Receipt & Booking Confirmation",
          Keywords: "Receipt, Invoice, Photography, Sidography"
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      const goldColor = "#c89b3c";
      const darkCharcoal = "#161618";
      const lightGray = "#f4f4f5";
      const greenBadge = "#15803d";
      const textMuted = "#6b7280";

      // -------------------------------------------------------------
      // 1. TOP HEADER BANNER (Luxury Charcoal & Gold)
      // -------------------------------------------------------------
      doc.rect(40, 40, 515, 80).fill(darkCharcoal);
      doc.rect(40, 118, 515, 3).fill(goldColor);

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(goldColor)
        .text("SIDOGRAPHY PHOTOGRAPHY & FILMS", 55, 55, { characterSpacing: 1 });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor("#e4e4e7")
        .text("By Sudarshan Tupare  •  Pune, Maharashtra, India", 55, 82);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor("#a1a1aa")
        .text("WhatsApp: +91 96375 77691  |  Email: sidographyfilms@gmail.com  |  Web: sidography.co.in", 55, 98);

      // -------------------------------------------------------------
      // 2. PAYMENT CONFIRMATION BADGE
      // -------------------------------------------------------------
      doc.roundedRect(40, 132, 515, 30, 4).fill("#f0fdf4");
      doc.roundedRect(40, 132, 515, 30, 4).strokeColor("#bbf7d0").stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10.5)
        .fillColor(greenBadge)
        .text("✓  PAYMENT RECEIVED & EVENT DATES CONFIRMED", 55, 142);

      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(greenBadge)
        .text("STATUS: PAID (TOKEN)", 420, 142, { align: 'right', width: 120 });

      // -------------------------------------------------------------
      // 3. RECEIPT METADATA BOX
      // -------------------------------------------------------------
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const receiptNo = `REC-SIDO-${Date.now().toString().slice(-6)}`;
      const txnId = transactionRef || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      doc.rect(40, 172, 515, 60).fill(lightGray);

      // Column 1: Client
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(darkCharcoal)
        .text("CUSTOMER DETAILS:", 55, 182);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor("#27272a")
        .text(`${clientName}`, 55, 195);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textMuted)
        .text(`Phone: ${clientPhone || 'WhatsApp Client'}`, 55, 210);

      // Column 2: Receipt metadata
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(darkCharcoal)
        .text("RECEIPT NO:", 240, 182);

      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(goldColor)
        .text(receiptNo, 240, 195);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textMuted)
        .text(`Txn: ${txnId}`, 240, 210);

      // Column 3: Payment details
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(darkCharcoal)
        .text("PAYMENT DATE:", 400, 182);

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor("#27272a")
        .text(today, 400, 195);

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(textMuted)
        .text(`Mode: ${paymentMethod}`, 400, 210);

      // -------------------------------------------------------------
      // 4. FINANCIAL BREAKDOWN TABLE
      // -------------------------------------------------------------
      let currentY = 245;

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(darkCharcoal)
        .text("BOOKING & PAYMENT BREAKDOWN", 40, currentY);

      currentY += 20;

      // Table Header
      doc.rect(40, currentY, 515, 26).fill("#27272a");

      doc.font('Helvetica-Bold').fontSize(9).fillColor("#ffffff");
      doc.text("SERVICE / PACKAGE", 55, currentY + 8);
      doc.text("TOTAL AMOUNT", 290, currentY + 8, { width: 100, align: 'right' });
      doc.text("ADVANCE PAID", 410, currentY + 8, { width: 130, align: 'right' });

      currentY += 26;

      // Table Row
      doc.rect(40, currentY, 515, 45).fill("#ffffff").strokeColor("#e4e4e7").stroke();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(darkCharcoal)
        .text(selectedPkg.title, 55, currentY + 10);

      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor(textMuted)
        .text(`Coverage: ${selectedPkg.duration}  •  Crew: ${selectedPkg.team}`, 55, currentY + 25);

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(darkCharcoal)
        .text(`₹${totalAmount.toLocaleString('en-IN')}`, 290, currentY + 16, { width: 100, align: 'right' });

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(greenBadge)
        .text(`₹${advanceAmount.toLocaleString('en-IN')}`, 410, currentY + 16, { width: 130, align: 'right' });

      currentY += 55;

      // Financial Summary Box (Right Aligned)
      doc.rect(300, currentY, 255, 65).fill(lightGray).strokeColor("#e4e4e7").stroke();

      doc.font('Helvetica').fontSize(9).fillColor(textMuted);
      doc.text("Total Package Price:", 315, currentY + 10);
      doc.font('Helvetica-Bold').fillColor(darkCharcoal).text(`₹${totalAmount.toLocaleString('en-IN')}`, 430, currentY + 10, { width: 110, align: 'right' });

      doc.font('Helvetica').fillColor(textMuted).text("Advance Token Received:", 315, currentY + 26);
      doc.font('Helvetica-Bold').fillColor(greenBadge).text(`₹${advanceAmount.toLocaleString('en-IN')}`, 430, currentY + 26, { width: 110, align: 'right' });

      doc.font('Helvetica-Bold').fillColor(darkCharcoal).text("Balance Due on Event:", 315, currentY + 44);
      doc.font('Helvetica-Bold').fillColor(goldColor).text(`₹${balanceAmount.toLocaleString('en-IN')}`, 430, currentY + 44, { width: 110, align: 'right' });

      currentY += 80;

      // -------------------------------------------------------------
      // 5. WHAT'S NEXT & BOOKING TERMS
      // -------------------------------------------------------------
      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(darkCharcoal)
        .text("NEXT STEPS FOR YOUR SHOOT", 40, currentY);

      currentY += 16;

      const steps = [
        "Your event date has been locked in our official master schedule.",
        "Sudarshan Tupare will personally reach out to you 2 weeks prior to plan the timeline, shot list, and styling.",
        "Remaining balance amount will be settled on or before the day of the photoshoot.",
        "High-resolution edited photos and digital deliverables will be ready within 15-20 days."
      ];

      steps.forEach(s => {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(goldColor).text("✓", 55, currentY);
        doc.font('Helvetica').fontSize(8.5).fillColor("#3f3f46").text(s, 70, currentY, { width: 470 });
        currentY += 15;
      });

      currentY += 15;

      // -------------------------------------------------------------
      // 6. OFFICIAL STAMP & SIGNATURE BOX
      // -------------------------------------------------------------
      doc.roundedRect(40, currentY, 515, 65, 4).fill("#fafafa").strokeColor("#e4e4e7").stroke();

      // Digital Stamp Box (Left)
      doc.roundedRect(55, currentY + 10, 180, 45, 4).strokeColor(goldColor).stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor(goldColor).text("SIDOGRAPHY PHOTOGRAPHY & FILMS", 60, currentY + 18, { align: 'center', width: 170 });
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(greenBadge).text("DIGITALLY AUTHORIZED & SEALED", 60, currentY + 30, { align: 'center', width: 170 });
      doc.font('Helvetica').fontSize(6.5).fillColor(textMuted).text("Authorized Signatory: Sudarshan Tupare", 60, currentY + 42, { align: 'center', width: 170 });

      // Support text (Right)
      doc.font('Helvetica-Bold').fontSize(9).fillColor(darkCharcoal).text("Need any assistance or modifications?", 255, currentY + 16);
      doc.font('Helvetica').fontSize(8).fillColor("#52525b").text("Contact Sudarshan directly on WhatsApp at +91 96375 77691 or email us at sidographyfilms@gmail.com", 255, currentY + 30, { width: 280 });

      // Bottom Footer
      doc.rect(40, 770, 515, 1).fill("#e4e4e7");
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(textMuted)
        .text("Sidography Photography & Films  •  Crafting Timeless Visual Stories  •  Pune, Maharashtra  •  @sidography.co.in", 40, 778, {
          align: 'center',
          width: 515
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

