import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `2.5" Vinyl Sticker`,
                        },
                        unit_amount: 100, // $1.00 in cents
                    },
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.origin}/merch?success=true`,
            cancel_url: `${req.headers.origin}/merch?canceled=true`,
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("Stripe error:", err);
        return res.status(500).json({ error: "Stripe checkout failed.", details: err.message });
    }
}