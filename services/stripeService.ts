
import { Project, Offer } from '../types';

export const redirectToCheckout = async (project: Project, offer: Offer) => {
    // In a real app, you would call your backend here to create a Stripe Checkout Session
    // and then redirect to the URL provided by Stripe.
    // For this MVP, we will redirect to a mock checkout page.
    
    const checkoutUrl = `/#/mock-checkout?project_id=${project.id}&offer_id=${offer.id}`;

    // Simulate a brief delay then redirect
    return new Promise<void>(resolve => {
        setTimeout(() => {
            window.location.href = checkoutUrl;
            resolve();
        }, 500);
    });
};
