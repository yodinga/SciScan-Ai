import { GoogleGenAI } from "@google/genai";
import { AnalysisSchema } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

// We define the schema as a string for the prompt because we cannot use responseSchema
// simultaneously with the googleSearch tool in the current API version constraints for this context.
const jsonStructurePrompt = `
Responda EXCLUSIVAMENTE com um objeto JSON válido. Não use Markdown code blocks (\`\`\`json). O JSON deve seguir estritamente esta estrutura:
{
  "title": "string (O título do artigo original)",
  "authors": ["string", "string"],
  "publicationDate": "string (Data estimada)",
  "executiveSummarySimple": "string (Resumo explicativo. Mantenha os termos técnicos, mas explique-os brevemente entre parênteses ou logo após. Ex: '...uso de AINEs (anti-inflamatórios)...'. NÃO trate o usuário como criança, seja didático.)",
  "executiveSummaryAcademic": "string (Resumo técnico de alto nível, utilizando jargão adequado da área, focado na metodologia e estatística para pares acadêmicos)",
  "freeTranslation": "string (A tradução do TÍTULO do artigo para o Português)",
  "researchQuestion": "string (A principal questão de pesquisa)",
  "methodology": {
    "type": "string (Ex: Quantitativa, Qualitativa, etc)",
    "description": "string (Breve descrição dos métodos)",
    "sampleSize": "string (Tamanho da amostra se houver)"
  },
  "keyFindings": ["string", "string", "string"],
  "limitations": ["string", "string"],
  "implications": "string",
  "critique": "string (Crítica acadêmica construtiva sobre qualidade/validade)",
  "score": {
    "total": number (1 a 10, nota geral),
    "methodology": number (1 a 10, rigor metodológico),
    "novelty": number (1 a 10, inovação/originalidade),
    "clarity": number (1 a 10, clareza da escrita),
    "justification": "string (Uma frase curta justificando a nota)"
  },
  "keywords": ["string", "string"]
}
`;

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cleanJsonText = (text: string): string => {
  // Find the first '{' and the last '}' to extract the JSON object, 
  // ignoring any conversational preamble or markdown code blocks.
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return text.trim();
  }

  return text.substring(startIndex, endIndex + 1);
};

export const analyzeArticle = async (
  text: string, 
  pdfFile: File | null
): Promise<AnalysisSchema> => {
  
  // Using Pro model for reasoning + tools
  const modelName = 'gemini-3-pro-preview'; 
  
  let contents;
  let tools: any[] = [];
  
  // Define parts
  const parts: any[] = [];

  // If a file is provided, add it to parts
  if (pdfFile) {
    const base64Data = await fileToGenerativePart(pdfFile);
    parts.push({
      inlineData: {
        mimeType: pdfFile.type,
        data: base64Data
      }
    });
  } else {
    // Only enable search if NO file is present to avoid conflicting modalities or excessive noise,
    // unless the text specifically looks like a URL.
    tools = [{ googleSearch: {} }];
  }

  // Add the text prompt
  const promptText = text.trim() 
    ? `Analise o seguinte conteúdo:\n\n${text}\n\n${pdfFile ? "Considere o arquivo PDF anexado como a fonte principal." : "Se for um link, acesse-o para extrair as informações reais."}`
    : "Analise este artigo científico completo seguindo o esquema JSON solicitado.";
    
  parts.push({ text: promptText });

  contents = { parts: parts };

  const systemInstruction = `
    Você é um cientista sênior e analista de pesquisa de classe mundial. 
    Sua tarefa é analisar profundamente o documento, texto ou link fornecido e estruturar os dados para uma aplicação web.
    
    INSTRUÇÕES:
    1. Gere DOIS resumos: um 'Simple' (didático, explicativo, nível graduação) e um 'Academic' (técnico, nível doutorado).
    2. No resumo simples, ao usar siglas ou termos complexos, explique-os brevemente. Ex: "PCR (Reação em Cadeia da Polimerase)".
    3. Responda EXCLUSIVAMENTE em Português do Brasil.
    4. Siga estritamente o formato JSON solicitado.
    
    ${jsonStructurePrompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        temperature: 0.2, 
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");

    try {
      const cleanedJson = cleanJsonText(responseText);
      return JSON.parse(cleanedJson) as AnalysisSchema;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", responseText);
      throw new Error("Falha ao processar a resposta da IA. O formato retornado não foi válido.");
    }
    
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};