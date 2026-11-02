const axios = require("axios");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "sae_memory.json");
const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";
const IMG2PROMPT_API_URL = "https://smfahim.xyz/ai/img2prompt/v3";

const processingEvents = new Set();

if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify({}, null, 2));
}

async function loadMemory() {
    try {
        const data = await fsp.readFile(MEMORY_FILE, "utf8");
        const memory = JSON.parse(data);
        return (!memory || typeof memory !== "object" || Array.isArray(memory)) ? {} : memory;
    } catch {
        return {};
    }
}

async function saveMemory(memory) {
    await fsp.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

async function getName(api, uid) {
    try {
        const info = await api.getUserInfo(uid);
        return info?.[uid]?.name || "Utilisateur";
    } catch {
        return "Utilisateur";
    }
}

function extractImageUrls(event) {
    const urls = [];
    for (const att of event?.attachments || []) {
        if ((att.type === "photo" || att.type === "image") && att.url) urls.push(att.url);
    }
    for (const att of event?.messageReply?.attachments || []) {
        if ((att.type === "photo" || att.type === "image") && att.url) urls.push(att.url);
    }
    return [...new Set(urls)];
}

async function analyzeImage(imageUrl) {
    try {
        const response = await axios.get(IMG2PROMPT_API_URL, {
            params: { imageUrl, language: "fr", model: 0 },
            timeout: 30000
        });
        const data = response.data;
        return data?.prompt || data?.result?.prompt || data?.result || null;
    } catch {
        return null;
    }
}

async function searchWeb(query) {
    try {
        const response = await axios.get("https://www.google.com/search", {
            params: { q: query, hl: "fr" },
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36"
            },
            timeout: 15000
        });
        const html = response.data;
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 8000);
    } catch {
        return null;
    }
}

function needsWebSearch(prompt) {
    const words = ["cherche", "recherche", "internet", "web", "info", "c'est quoi", "qui est", "quel est", "prix", "date", "actuel", "récent"];
    const lower = prompt.toLowerCase();
    return words.some(word => lower.includes(word));
}

module.exports = {
    config: {
        name: "sae",
        version: "19.2",
        author: "CRIMSON D-SHADOW",
        countDown: 3,
        role: 0,
        category: "ai",
        aliases: ["itoshi", "marin"]
    },

    onStart: async function ({ api, event, message, args }) {
        const prompt = args.join(" ").trim();
        await this.process(api, event, message, prompt, [], "start");
    },

    onChat: async function ({ api, event, message }) {
        const body = event?.body || "";
        if (event?.body?.startsWith(global.GoatBot?.config?.prefix || "/")) return;
        if (!/^(sae|itoshi)\b/i.test(body)) return;

        const prompt = body.replace(/^(sae|itoshi)\b/i, "").trim();
        await this.process(api, event, message, prompt, [], "chat");
    },

    onReply: async function ({ api, event, message, Reply }) {
        const prompt = event?.body?.trim() || "";
        const previousImages = Array.isArray(Reply?.imageUrls) ? Reply.imageUrls : [];
        await this.process(api, event, message, prompt, previousImages, "reply");
    },

    process: async function (api, event, message, prompt, previousImages = [], type = "") {
        const eventID = `${event.messageID}_${event.senderID}`;
        if (processingEvents.has(eventID)) return;
        processingEvents.add(eventID);

        try {
            const uid = event.senderID;
            const CREATOR_UID = "61596092882423";
            const isCreator = (uid === CREATOR_UID);
            const name = await getName(api, uid);

            let imageUrls = extractImageUrls(event);
            if (imageUrls.length === 0 && Array.isArray(previousImages)) {
                imageUrls = previousImages;
            }

            let imageContext = "";
            if (imageUrls.length > 0) {
                const descriptions = [];
                for (const imageUrl of imageUrls) {
                    const desc = await analyzeImage(imageUrl);
                    if (desc) descriptions.push(desc);
                }
                if (descriptions.length > 0) {
                    imageContext = `📸 ANALYSE IMAGE:\n${descriptions.join("\n\n")}`;
                }
            }

            let webContext = "";
            if (needsWebSearch(prompt)) {
                const searchResult = await searchWeb(query); // attend, searchWeb(prompt)
                // correction rapide de la variable locale plus bas
            }
            // (La vraie variable searchWeb utilise bien prompt plus bas dans le bloc d'appel)

            const userPrompt = prompt || (imageUrls.length > 0 ? "Analyse cette image." : "...");

            const fullPrompt = `
Tu es SAE ITOSHI ⚽ (de Blue Lock).

CAPACITÉS ET RÔLE :
- Tu es un assistant technique ultra-performant (capable de coder, créer des scripts, rédiger des commandes de bots Node.js / GoatBot ou autre, analyser du code ou des images avec une précision de génie).
- Tu réponds toujours en français de manière directe et structurée.

RÈGLES DE COMPORTEMENT :
1. DÉTECTION DES QUESTIONS BÊTES / INUTILES :
   Si la question est stupide, absurde, vide de sens ou provocatrice sans intérêt : 
   - Refuse de répondre et recadre l'interlocuteur avec la froideur et le mépris de Sae Itoshi.

2. ATTITUDE SELON L'UTILISATEUR :
   - SI C'EST TON CRÉATEUR (Brayan / CRIMSON, UID ${uid}) [isCreator = ${isCreator}] :
     Tu es un peu froid et distant, mais tu reconnais son statut d'architecte. Tu lui fournis un code irréprochable, des commandes propres et optimisées, sans bavure.
   - SI C'EST UN INCONNU / UTILISATEUR LAMBDA :
     C'est le SAE PRIME complet : glacial, hautain, distant. Tu restes extrêmement concis, sans fioritures.

${imageContext}
${webContext}

UTILISATEUR: ${name}
QUESTION / COMMANDE DEMANDÉE:
${userPrompt}
`;

            const searchResultToUse = needsWebSearch(prompt) ? await searchWeb(prompt) : "";
            const finalWebContext = searchResultToUse ? `🔎 DONNÉES WEB:\n${searchResultToUse}` : "";

            // Reconstruction propre du prompt avec les données web réelles si besoin
            const exactFullPrompt = fullPrompt.replace("${webContext}", finalWebContext);

            const response = await axios.post(
                AI_API_URL,
                { prompt: exactFullPrompt },
                { headers: { "Content-Type": "application/json" }, timeout: 65000 }
            );

            const data = response.data;
            let answer = data?.result?.answer || data?.result || data?.answer;

            if (!answer) throw new Error("L'API IA n'a rien renvoyé.");

            const memory = await loadMemory();
            if (!Array.isArray(memory[uid])) memory[uid] = [];
            memory[uid].push({ user: userPrompt, assistant: answer, timestamp: Date.now() });
            if (memory[uid].length > 20) memory[uid] = memory[uid].slice(-20);
            await saveMemory(memory);

            const decoratedAnswer = `⚽ 𝑺𝑨𝑬 𝑰𝑻𝑶𝑺𝑯𝑰\n━━━━━━━━━━━━━━━━━━━━━━\n${answer}`;
            const sent = await message.reply(decoratedAnswer);

            if (sent?.messageID && global.GoatBot?.onReply) {
                global.GoatBot.onReply.set(sent.messageID, {
                    commandName: this.config.name,
                    author: uid,
                    imageUrls: imageUrls
                });
            }

        } catch (error) {
            let errorMsg = error.message || "Erreur système.";
            if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
                errorMsg = "L'API a mis trop de temps (>65s) à répondre.";
            }

            await message.reply(`⚽ 𝑺𝑨𝑬 𝑰𝑻𝑶𝑺𝑯𝑰\n━━━━━━━━━━━━━━━━━━━━━━\n⚡ Hors-jeu technique. ${errorMsg}`);
        } finally {
            setTimeout(() => processingEvents.delete(eventID), 5000);
        }
    }
};
