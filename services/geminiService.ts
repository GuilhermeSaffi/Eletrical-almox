
import { GoogleGenAI } from "@google/genai";
import { InventoryItem, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryInsights = async (items: InventoryItem[], categories: Category[]): Promise<string> => {
  try {
    const summary = items.map(i => ({
      name: i.name,
      qty: i.quantity,
      min: i.minQuantity,
      category: categories.find(c => c.id === i.categoryId)?.name || 'Unknown'
    }));

    const prompt = `
      Analise o seguinte inventário de componentes eletrônicos e forneça 3 insights estratégicos curtos.
      Identifique itens críticos (abaixo do mínimo) e sugira otimizações.
      
      Dados do Inventário:
      ${JSON.stringify(summary)}
      
      Responda em Português brasileiro, de forma profissional e direta. Use Markdown para formatação.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Erro ao processar análise do sistema.";
  }
};
