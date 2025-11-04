import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        'sk_test_51SOKnxRqbXtZqBVb9ZIQ7BUDgXyo38QGNIh6w7Jp7NWYdlKAyhOlrFPf6D0SET9TIN18DQaZcFzth4URYSDJCdzd00AsevC5mb',
      {
        apiVersion: '2025-10-29.clover',
      },
    );
  }

  async createPaymentAndRedirect(amount: number, item: string, res: Response) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: item },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payments/success',
      cancel_url: 'http://localhost:3000/payments/failure',
    });

    return res.redirect(303, session.url || 'http://localhost:3000');
  }
}
