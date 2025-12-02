import express from "express";
import cors from "cors";
import sgMail from "@sendgrid/mail";

const app = express();
const PORT = process.env.PORT || 3000;

// המשתנה הזה נכניס כ-Environment Variable ברנדר (לא בקוד!)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
// מייל שממנו ישלחו המיילים – נקבע גם כ-Env ברנדר
const DEFAULT_FROM = process.env.EMAIL_FROM || "noreply@reviewresq.com";

if (!SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY is not set. Emails will not be sent.");
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

app.use(
  cors({
    origin: [
      "https://reviewresq.com",
      "https://reviewresq.github.io"
      // אם יש דומיינים נוספים של הפאנל – תוסיף אותם כאן
    ],
    methods: ["POST"],
  })
);

app.use(express.json());

// health check – רק לראות שהשרת חי
app.get("/", (req, res) => {
  res.send("ReviewResQ email backend is running ✅");
});

// כאן ה־Frontend (email-service.js) יקרא
app.post("/send-automation-email", async (req, res) => {
  const { to, subject, text, html, meta } = req.body || {};

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      error: "Missing required fields: 'to', 'subject' and at least 'text' or 'html'.",
    });
  }

  const msg = {
    to,
    from: DEFAULT_FROM,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  try {
    await sgMail.send(msg);
    console.log("📧 Email sent", { to, subject, meta });
    res.json({ success: true });
  } catch (err) {
    console.error("SendGrid error:", err?.response?.body || err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Email backend listening on port ${PORT}`);
});
