import { prisma } from "../src/prismaClient";

async function markManual(lang: string, key: string) {
    try {
        await prisma.translation.update({
            where: { key_language: { key, language: lang } },
            data: { manuallyEdited: true },
        });
        console.log(`✅ Marked "${key}" in "${lang}" as manually edited.`);
    } catch (err) {
        console.error(`❌ Failed to mark manual edit for ${lang}:${key}`, err);
    } finally {
        await prisma.$disconnect();
    }
}

// 🧠 Get args from CLI
const [lang, key] = process.argv.slice(2);

if (!lang || !key) {
    console.error("❌ Usage: npm run mark-manual -- <lang> <key>");
    console.error("Example: npm run mark-manual -- de welcome_message");
    process.exit(1);
}

markManual(lang, key);
