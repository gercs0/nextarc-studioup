

import { Project, Offer } from '../types';
import { supabase } from '../lib/supabase';
import { PLATFORM_FEE_PERCENTAGE, PRO_PLATFORM_FEE_PERCENTAGE } from '../constants';

/**
 * Onboards a creator to Stripe Connect (Express) so they can receive payouts.
 * Returns the onboarding URL to redirect the user to.
 */
export const onboardCreator = async (userId: string, email: string): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('create-connect-account', {
            body: { 
                userId,
                email
            }
        });

        if (error) throw error;
        if (!data?.url) throw new Error("No onboarding URL returned.");

        return data.url;
    } catch (error) {
        console.error("Stripe Onboarding Failed:", error);
        throw error;
    }
};

/**
 * Initiates an Escrow Payment Session.
 * Funds are held by the platform (minus fee) until release.
 */
export const redirectToCheckout = async (project: Project, offer: Offer) => {
    try {
        // 1. Fetch Creator Profile to check Pro Status
        const { data: creatorProfile, error: profileError } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', offer.creatorId)
            .single();

        if (profileError) {
            console.warn("Could not fetch creator profile for fee calculation. Defaulting to standard fee.", profileError);
        }

        const isPro = creatorProfile?.is_pro || false;
        
        // 2. Determine Fee Percentage
        const appliedFeePercentage = isPro ? PRO_PLATFORM_FEE_PERCENTAGE : PLATFORM_FEE_PERCENTAGE;

        // 3. Calculate amounts
        const amountInCents = Math.round(offer.amount * 100);
        const feeInCents = Math.round(amountInCents * appliedFeePercentage);

        const { data, error } = await supabase.functions.invoke('create-escrow-checkout', {
            body: {
                projectId: project.id,
                offerId: offer.id,
                creatorId: offer.creatorId, // Used to look up the connected account ID on the server
                amount: amountInCents,
                applicationFee: feeInCents,
                serviceName: project.serviceType,
                customerEmail: project.email,
                successUrl: `${window.location.origin}/success?project_id=${project.id}&offer_id=${offer.id}`,
                cancelUrl: `${window.location.origin}/cancel`
            }
        });

        if (error) {
            console.error("Error invoking escrow checkout function:", error);
            throw error;
        }

        if (data?.url) {
            // Redirect to the real Stripe Checkout page
            window.location.href = data.url;
        } else {
            throw new Error("No checkout URL returned from payment service.");
        }

    } catch (error: any) {
        console.error("Stripe Checkout Failed:", error);
        // If the error suggests the creator isn't onboarded
        if (error.message?.includes("Connected account")) {
            alert("The creator has not set up their payouts yet. Please contact them.");
        } else {
            alert("Unable to initiate secure payment. Please try again later.");
        }
    }
};