// index.js

import express from "express";
import cors from "cors";
import sgMail from "@sendgrid/mail";

const app = express();

// מאפשר בקשות מהדומיין של הפורטל שלך
app.use(cors());
app.use(express.json());

// מגדירים את API KEY של SendGrid מתוך משתני הסביבה של Render
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// בריאות – כדי לראות שהשרת חי
app.get("/", (req, res) => {
  res.send("ReviewResQ email backend is running");
});

// הנתיב שאתה קורא אליו: /send-email
app.post("/send-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const msg = {
      to,
      from: process.env.FROM_EMAIL, // support@reviewresq.com
      subject,
      text: message,
    };

    await sgMail.send(msg);

    res.status(200).json({ success: true, message: "Email sent!" });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Render מריץ את האפליקציה על הפורט שהוא נותן ב-PROCESS.ENV.PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
