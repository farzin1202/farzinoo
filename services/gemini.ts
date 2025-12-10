import { GoogleGenAI } from "@google/genai";
import { MonthData } from "../types";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBacktest = async (
  monthData: MonthData,
  winRate: number,
  netPnL: number
): Promise<string | null> => {
  const ai = getClient();
  if (!ai) return null;

  try {
    const prompt = `
      Act as a world-class Forex Trading Psychology and Strategy Coach (like Mark Douglas or Tom Hougaard).
      Analyze the following backtesting data for the month of ${monthData.name}.
      
      STATS:
      - Win Rate: ${winRate}%
      - Net Profit/Loss: ${netPnL}%
      - Total Trades: ${monthData.trades.length}
      - User Notes: "${monthData.note || 'No notes provided'}"

      TRADES LOG (JSON):
      ${JSON.stringify(monthData.trades.map(t => ({
        pair: t.pair,
        dir: t.direction,
        rr: t.rr,
        result: t.result,
        maxPotential: t.maxRr
      })))}

      Please provide a concise but powerful analysis in PERSIAN (Farsi) language.
      1. Identify the biggest strength this month.
      2. Identify the biggest leakage/weakness (e.g. holding losers, not taking full targets).
      3. Give 3 actionable tips for the next month.
      
      Output strictly in Persian. Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    throw error;
  }
};