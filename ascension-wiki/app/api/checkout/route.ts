import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, packageCode } = await req.json(); // amount in USD (e.g., 5.00)

        // Ensure they don't buy less than $5
        if (amount < 5) {
            return NextResponse.json({ error: 'Minimum purchase is $5.00' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            client_reference_id: userId, // CRITICAL: This links the payment to the Clerk User ID for the Webhook
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Ascension Intelligence Tokens (${packageCode})`,
                            description: `${amount * 1000} Execution Credits`,
                            images: ['https://astraeus-livid.vercel.app/social-card.png'], // Placeholder
                        },
                        unit_amount: amount * 100, // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://astraeus-livid.vercel.app'}/control/governance?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://astraeus-livid.vercel.app'}/control/governance?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
