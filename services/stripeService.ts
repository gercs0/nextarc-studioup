

import { Project, Offer } from '../types';
import { supabase } from '../lib/supabase';

export const redirectToCheckout = async (project: Project, offer: Offer) => {
    // COMMERCIAL USE: Initiating real Stripe Checkout session via Supabase Edge Function.
    // Ensure you have deployed the 'create-checkout-session' function and configured Stripe keys.
    
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                projectId: project.id,
                offerId: offer.id,
                amount: offer.amount, // Amount in dollars, function should convert to cents
                serviceName: project.serviceType,
                customerEmail: project.email // Passed for pre-filling, optional
            }
        });

        if (error) {
            console.error("Error invoking checkout function:", error);
            throw error;
        }

        if (data?.url) {
            // Redirect to the real Stripe Checkout page
            window.location.href = data.url;
        } else {
            throw new Error("No checkout URL returned from payment service.");
        }

    } catch (error) {
        console.error("Stripe Checkout Failed:", error);
        alert("Unable to initiate secure payment. Please ensure the payment backend is deployed and configured.");
        // Note: We do not fallback to mock checkout here as the user requested "Live" behavior only.
    }
};