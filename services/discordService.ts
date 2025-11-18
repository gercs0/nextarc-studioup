
import { Project } from '../types';

export const sendDiscordNotification = async (project: Omit<Project, 'id' | 'offers' | 'status'> & { id: string }) => {
    const webhookUrl = "https://discord.com/api/webhooks/1432151682426339359/e7KfLtzaWoxqkdkqcdvPnWYGm6mz3RqjREQhx7Q0AH-_T5q4A3OsTGI3iqVA0o_ejwHC";
    if (!webhookUrl) {
        console.error("Discord webhook URL is not configured.");
        return;
    }

    const embed = {
        title: `🚀 New Project Posted: ${project.serviceType}`,
        description: project.description,
        color: 0xff4d00, // Ember orange
        fields: [
            { name: "Athlete", value: project.athleteName, inline: true },
            { name: "Sport", value: project.sport, inline: true },
            { name: "Budget", value: `$${project.budget}`, inline: true },
            { name: "Deadline", value: new Date(project.deadline).toLocaleDateString(), inline: true },
        ],
        thumbnail: {
            url: project.images[0] || '',
        },
        footer: {
            text: `Project ID: ${project.id} | NextArc Studio`,
        },
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!response.ok) {
            console.error('Failed to send Discord notification:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
};
