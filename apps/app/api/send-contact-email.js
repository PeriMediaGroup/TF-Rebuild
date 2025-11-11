// /api/send-contact-email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing fields" });
    }

    try {
        console.log("📤 Sending contact email via Resend", { name, email, message });

        const result = await resend.emails.send({
            from: "TriggerFeed Contact <contact@email.triggerfeed.com>",
            to: "support@triggerfeed.com",
            subject: `New Contact Message from ${name}`,
            reply_to: email,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, "<br/>")}</p>
            `,
        });

        console.log("✅ Resend result:", result);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Resend error:", err);
        return res.status(500).json({ error: "Email failed to send.", details: err.message });
    }
}
