import { prisma } from "../src/prismaClient";

async function unmarkManual(lang: string, key: string) {
    try {
        await prisma.translation.update({
            where: { key_language: { key, language: lang } },
            data: { manuallyEdited: false },
        });
        console.log(`♻️ Unmarked "${key}" in "${lang}" (AI can update it again).`);
    } catch (err) {
        console.error(`❌ Failed to unmark manual edit for ${lang}:${key}`, err);
    } finally {
        await prisma.$disconnect();
    }
}

const [lang, key] = process.argv.slice(2);

if (!lang || !key) {
    console.error("❌ Usage: npm run unmark-manual -- <lang> <key>");
    console.error("Example: npm run unmark-manual -- de welcome_message");
    process.exit(1);
}

unmarkManual(lang, key);
