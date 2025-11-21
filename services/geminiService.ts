import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

// Initialize Gemini Client
// NOTE: In a real production app, you would proxy this through a backend or use a secure way to inject the key.
// The prompt instructions say to use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateEventTimeline = async (eventType: string, startTime: string, durationHours: number): Promise<string> => {
  if (!process.env.API_KEY) {
    return "MOCK TIMELINE: \n10:00 AM - Setup\n11:00 AM - Guest Arrival\n12:00 PM - Ceremony\n01:00 PM - Lunch\n03:00 PM - Wrap up (AI Key Missing)";
  }

  try {
    const prompt = `
      Create a detailed minute-by-minute event timeline for a ${eventType}.
      Start Time: ${startTime}
      Duration: ${durationHours} hours.
      Include arrival of vendors (photographer, caterer) in the timeline.
      Format the output as a clean list.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate timeline.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating timeline. Please check your network or API key.";
  }
};

export const suggestVendors = async (budget: number, eventType: string, location: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Based on your budget, we recommend looking for 'Standard' tier vendors in your area. (AI Key Missing)";
  }

  try {
    const prompt = `
      I am planning a ${eventType} in ${location} with a total budget of ₹${budget}.
      Suggest how I should allocate this budget across Venue, Catering, Photography, and Makeup.
      Give me a breakdown of estimated costs for each category.
      Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate suggestions.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating suggestions.";
  }
};

export const askEventAssistant = async (query: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "I am your Event AI Assistant. Please configure the API Key to chat with me!";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a helpful Event Planning Assistant. Answer the following query briefly and professionally: ${query}`
        });
        return response.text || "I didn't catch that.";
    } catch (error) {
        console.error("Gemini Error", error);
        return "Sorry, I am having trouble connecting right now.";
    }
}

export const translateText = async (text: string, sourceLang: Language, targetLang: Language): Promise<string> => {
    if (!process.env.API_KEY) {
        return `[MOCK TRANSLATION ${sourceLang}->${targetLang}]: ${text}`;
    }
    if (sourceLang === targetLang) return text;

    try {
        const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translated text, nothing else. Text: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text?.trim() || text;
    } catch (error) {
        console.error("Translation Error", error);
        return text;
    }
}