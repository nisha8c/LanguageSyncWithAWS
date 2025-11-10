import fs from "fs";
import path from "path";
import { prisma } from "../prismaClient";
import { translateText } from "./translateAI";
import { backendMessages } from "../messages/en";

export async function syncTranslations() {
    const baseLang = "en";
    const enFile = path.resolve(__dirname, "../../locales/en.json");
    const configFile = path.resolve(__dirname, "../../locales/config.json");
    const localesDir = path.resolve(__dirname, "../../locales");

    console.log("⚙️ Starting Translation Sync...\n");

    // 🧩 Combine frontend + backend English text
    const frontendData = JSON.parse(fs.readFileSync(enFile, "utf8")) as Record<string, string>;
    const combinedData = { ...frontendData, ...backendMessages };

    console.log(`📦 Loaded ${Object.keys(frontendData).length} frontend keys`);
    console.log(`📦 Loaded ${Object.keys(backendMessages).length} backend keys`);
    console.log(`🧩 Total combined English keys: ${Object.keys(combinedData).length}\n`);

    const { supportedLangs } = JSON.parse(
        fs.readFileSync(configFile, "utf8")
    ) as { supportedLangs: string[] };
    const targetLangs = supportedLangs.filter((l) => l !== baseLang);

    console.log(`🌐 Supported languages: ${supportedLangs.join(", ")}`);
    console.log(`🌍 Target languages (to translate): ${targetLangs.join(", ")}\n`);

    console.log("🔄 --- Step 1: Upserting and Updating Translations ---");

    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const [key, newText] of Object.entries(combinedData)) {
        const oldEnglish = await prisma.translation.findUnique({
            where: { key_language: { key, language: baseLang } },
        });

        const englishChanged = oldEnglish && oldEnglish.text !== newText;

        // Upsert English
        await prisma.translation.upsert({
            where: { key_language: { key, language: baseLang } },
            update: { text: newText },
            create: { key, language: baseLang, text: newText },
        });

        // Handle other languages
        for (const lang of targetLangs) {
            const existing = await prisma.translation.findUnique({
                where: { key_language: { key, language: lang } },
            });

            // 🧠 Skip manual translations, always preserve them
            if (existing?.manuallyEdited) {
                console.log(`✋ [${lang}] Skipped (manually edited) → ${key}`);
                skippedCount++;
                continue;
            }

            // Only translate if new or English changed
            if (!existing) {
                const translated = await translateText(newText, lang);
                await prisma.translation.create({
                    data: { key, language: lang, text: translated },
                });
                console.log(`🌐 [${lang}] Created new → ${key}`);
                newCount++;
            } else if (englishChanged) {
                const translated = await translateText(newText, lang);
                await prisma.translation.update({
                    where: { key_language: { key, language: lang } },
                    data: { text: translated },
                });
                console.log(`🔁 [${lang}] Updated → ${key}`);
                updatedCount++;
            } else {
                skippedCount++;
            }
        }
    }

    console.log(`\n✅ Step 1 Done — Created: ${newCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}\n`);

    // 🧹 Step 2: Cleanup obsolete keys
    console.log("🧹 --- Step 2: Cleaning up obsolete keys ---");

    const allKeys = Object.keys(combinedData);

    const obsolete = await prisma.translation.findMany({
        where: {
            language: baseLang,
            NOT: { key: { in: allKeys } },
        },
    });

    if (obsolete.length > 0) {
        const deletedKeys = obsolete.map((t) => t.key);
        console.log(`🗑 Found ${deletedKeys.length} obsolete keys to remove: ${deletedKeys.join(", ")}`);
        await prisma.translation.deleteMany({ where: { key: { in: deletedKeys } } });
    } else {
        console.log("✅ No obsolete keys found — database is up-to-date.");
    }

    // 🧾 Step 3: Rebuild locale JSONs
    console.log("\n🧾 --- Step 3: Rebuilding locale JSON files ---");

    for (const lang of supportedLangs) {
        const translations = await prisma.translation.findMany({ where: { language: lang } });
        const data = Object.fromEntries(translations.map((t) => [t.key, t.text]));
        const filePath = path.join(localesDir, `${lang}.json`);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        console.log(`💾 Wrote ${Object.keys(data).length} keys → ${lang}.json`);
    }

    console.log("\n✅ --- Translation Sync Completed Successfully ---");
}

if (require.main === module) {
    syncTranslations()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("❌ Sync failed:", err);
            process.exit(1);
        });
}
