import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import dotenv from "dotenv";
dotenv.config();

const translateClient = new TranslateClient({ region: process.env.AWS_REGION });

/**
 * Translate text using AWS Translate
 * @param source English text
 * @param targetLang ISO language code (e.g., "fr", "de", "es")
 */
export async function translateText(source: string, targetLang: string): Promise<string> {
    try {
        const command = new TranslateTextCommand({
            SourceLanguageCode: "en",
            TargetLanguageCode: targetLang,
            Text: source,
        });

        const response = await translateClient.send(command);
        return response.TranslatedText || source;
    } catch (error) {
        console.error(`❌ AWS Translation failed (${targetLang}):`, error);
        return source; // fallback to English
    }
}
