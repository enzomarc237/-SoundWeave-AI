import { GoogleGenAI, Type } from "@google/genai";
import { Note } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a user message to the AI Co-Pilot (Chat).
 */
export const sendCoPilotMessage = async (
  message: string, 
  projectContext: string
): Promise<string> => {
  try {
    const systemInstruction = `You are the SoundWeave AI Co-Pilot.
    Current Project Context: ${projectContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't process that request.";
  } catch (error) {
    console.error("CoPilot Error:", error);
    return "Error connecting to AI Co-Pilot.";
  }
};

/**
 * Generates musical note data for the internal synth.
 */
export const generateTrackNotes = async (
  trackName: string, 
  instrument: string,
  bpm: number,
  key: string
): Promise<{ name: string; notes: Note[] }> => {
  try {
    const prompt = `Compose a 4-bar musical sequence for a "${instrument}" track named "${trackName}".
    The song is in ${key} at ${bpm} BPM.
    Return a list of notes. 
    For Drums: Use C3 for Kick, D3 for Snare, F#3 for HiHat.
    For Melodic instruments: Use standard note names (e.g., C3, G#4).
    Ensure rhythm is interesting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  note: { type: Type.STRING },
                  start: { type: Type.NUMBER, description: "Start time in bars (0.0 to 4.0)" },
                  duration: { type: Type.NUMBER, description: "Duration in bars" },
                  velocity: { type: Type.NUMBER, description: "Volume 0.0 to 1.0" }
                }
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Generation Error:", error);
    // Fallback: Basic beat
    return {
      name: "Fallback Beat",
      notes: [
        { note: "C3", start: 0, duration: 0.1, velocity: 1 },
        { note: "D3", start: 1, duration: 0.1, velocity: 0.8 },
        { note: "C3", start: 2, duration: 0.1, velocity: 1 },
        { note: "D3", start: 3, duration: 0.1, velocity: 0.8 },
      ]
    };
  }
};

export const analyzeMix = async (trackListDescription: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this track list and suggest mixing improvements: ${trackListDescription}`,
        });
        return response.text || "Mix looks okay.";
    } catch (e) {
        return "Could not analyze mix.";
    }
}

/**
 * Generates a creative text-based idea/concept for a track layer.
 */
export const generateTrackIdea = async (
  contextName: string,
  style: string,
  bpm: number
): Promise<{ name: string; description: string }> => {
  try {
    const prompt = `Generate a creative music production idea for a new layer.
    Context: ${contextName}, Style: ${style}, BPM: ${bpm}.
    Return a JSON object with a 'name' and a short 'description'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Idea Generation Error:", error);
    return {
      name: "Atmospheric Pad",
      description: "A slow-attack pad to add texture."
    };
  }
};
