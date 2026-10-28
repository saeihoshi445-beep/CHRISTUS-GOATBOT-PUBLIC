const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
        config: {
                name: "welcome",
                version: "2.2",
                author: " CRIMSON 🩵🪽",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "sáng",
                        session2: "trưa",
                        session3: "chiều",
                        session4: "tối",
                        welcomeMessage: "✨ Cảm ơn bạn đã mời tôi vào nhóm!\n⚡ Prefix bot: %1\n🔎 Để xem danh sách lệnh hãy nhập: %1help",
                        multiple1: "mới",
                        multiple2: "các tân binh",
                        defaultWelcomeMessage: "{userName}"
                },
                en: {
                        session1: "morning",
                        session2: "noon",
                        session3: "afternoon",
                        session4: "evening",
                        welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",
                        multiple1: "newbie",
                        multiple2: "newbies",
                        defaultWelcomeMessage: "{userName}"
                },
                fr: {
                        session1: "matin",
                        session2: "midi",
                        session3: "après-midi",
                        session4: "soir",
                        welcomeMessage: "✨ Merci de m'avoir ajouté au groupe !\n⚡ Préfixe bot: %1\n🔎 Pour voir les commandes: %1help",
                        multiple1: "ce novice",
                        multiple2: "ces novices",
                        defaultWelcomeMessage: "{userNameTag}"
                }
        },

        onStart: async ({ threadsData, message, event, api, getLang }) => {
                if (event.logMessageType !== "log:subscribe") return;

                const { threadID, logMessageData } = event;
                const { addedParticipants } = logMessageData;
                const hours = getTime("HH");
                const prefix = global.utils.getPrefix(threadID);
                const nickNameBot = global.GoatBot.config.nickNameBot;

                if (addedParticipants.some(user => user.userFbId === api.getCurrentUserID())) {
                        if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                        return message.send(getLang("welcomeMessage", prefix));
                }

                if (!global.temp.welcomeEvent[threadID]) {
                        global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
                }

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);

                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
                        const threadData = await threadsData.get(threadID);
                        if (threadData.settings.sendWelcomeMessage === false) return;

                        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                        const bannedUsers = threadData.data.banned_ban || [];
                        const threadName = threadData.threadName;

                        let newMembers = [], mentions = [];
                        let isMultiple = dataAddedParticipants.length > 1;

                        for (const user of dataAddedParticipants) {
                                if (bannedUsers.some(banned => banned.id === user.userFbId)) continue;
                                newMembers.push(user.fullName);
                                mentions.push({ tag: user.fullName, id: user.userFbId });
                        }

                        if (newMembers.length === 0) return;

                        const adderID = event.author;
                        const adderInfo = await api.getUserInfo(adderID);
                        const adderName = adderInfo[adderID]?.name || "Un joueur anonyme";
                        mentions.push({ tag: adderName, id: adderID });

                        // 50 répliques d'accueil style Sae Itoshi
                        const saeWelcomeQuotes = [
                                "⚽ {userNameTag} entre sur le terrain de {boxName}. Montre-moi si tu as un minimum de talent ou si tu es un autre figurant.",
                                "🧊 Un nouveau visage... {userNameTag}, n'espère pas attirer mon attention sans prouver ta valeur dans {boxName}.",
                                "⛓️ {userNameTag} vient d'arriver. {multiple} a intérêt à élever le niveau, {boxName} n'a pas besoin de poids morts.",
                                "⚽ Encore une recrue ? {userNameTag}, le terrain de {boxName} est impitoyable. Ne me fais pas perdre mon temps.",
                                "🥀 {userNameTag} intègre {boxName}. J'espère pour toi que tu n'es pas venu pour faire de la figuration.",
                                "⚽ Bienvenue dans l'arène, {userNameTag}. Ici, seules la précision et la discipline comptent.",
                                "🧊 {userNameTag} fait son entrée à {time}h ({session}). Fais en sorte que ta présence dans {boxName} serve à quelque chose.",
                                "⛓️ On accueille {userNameTag}. La médiocrité n'est pas tolérée dans {boxName}, retiens-le bien.",
                                "⚽ {userNameTag}, tu viens de mettre les pieds dans {boxName}. Ne gâche pas cette opportunité.",
                                "❌ {userNameTag} rejoint {boxName}. Fais tes preuves rapidement ou prépare-toi à dégager.",
                                "⚽ Regardons si {userNameTag} a le niveau pour jouer dans la même ligue que nous.",
                                "🧊 {userNameTag} entre dans {boxName}. Moins de paroles, plus de résultats.",
                                "⛓️ {userNameTag}, tu viens d'entrer sur le terrain. Respecte le jeu et ne ralentis pas l'équipe.",
                                "⚽ {multiple} comme {userNameTag} arrive dans {boxName}. Prouve que tu n'es pas juste du remplissage.",
                                "🥀 Un nouveau joueur : {userNameTag}. L'exigence dans {boxName} est maximale.",
                                "⚽ {userNameTag} débarque à {time}h. Montre-nous ce que tu vaux vraiment.",
                                "🧊 {userNameTag}, tu as intérêt à avoir une vision de jeu irréprochable dans {boxName}.",
                                "⛓️ {userNameTag} s'ajoute à la liste. On verra bien combien de temps tu tiendras.",
                                "⚽ Bienvenue à {userNameTag}. La complaisance est interdite ici.",
                                "❌ {userNameTag} entre sur le terrain. Sois à la hauteur ou reste sur le banc.",
                                "⚽ {userNameTag} dans {boxName}... Ne viens pas gâcher la fluidité de notre jeu.",
                                "🧊 {userNameTag}, montre-moi ton contrôle de balle et ta maturité sur ce terrain.",
                                "⛓️ L'entrée de {userNameTag} est enregistrée. Fais honneur à {boxName}.",
                                "⚽ {userNameTag} débarque à ce moment du jeu ({session}). Sois prêt à encaisser la pression.",
                                "🥀 {userNameTag} rejoint le groupe. Pas de passe-droit, seulement du mérite."
                        ];

                        const randomQuote = saeWelcomeQuotes[Math.floor(Math.random() * saeWelcomeQuotes.length)];

                        const sessionName = hours <= 10 ?
                                getLang("session1") :
                                hours <= 12 ?
                                        getLang("session2") :
                                        hours <= 18 ?
                                                getLang("session3") :
                                                getLang("session4");

                        const membersFormatted = newMembers.join(", ");

                        let quoteFormatted = randomQuote
                                .replace(/\{userNameTag\}|\{userName\}/g, membersFormatted)
                                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                                .replace(/\{multiple\}/g, isMultiple ? getLang("multiple2") : getLang("multiple1"))
                                .replace(/\{time\}/g, hours)
                                .replace(/\{session\}/g, sessionName)
                                .replace(/\{adderName\}/g, adderName);

                        // Émoji dynamique de fin d'encadrement selon le nombre de nouveaux membres
                        const endEmoji = isMultiple ? "👥" : "👤";

                        // Encadrement strict style Sae Itoshi
                        const welcomeMessage = `━━━ ⚽ 𝗦𝗔𝗘 𝗜𝗧𝗢𝗦𝗛𝗜 ⚽ ━━━\n\n${quoteFormatted}\n\n📥 𝗥𝗲𝗰𝗿𝘂𝘁𝗲́ 𝗽𝗮𝗿: ${adderName}\n🕐 𝗛𝗲𝘂𝗿𝗲: ${hours}h (${sessionName})\n📍 𝗧𝗲𝗿𝗿𝗮𝗶𝗻: ${threadName} ${endEmoji}\n\n━━━━━━━━━━━━━━━━━━━━━━━`;

                        let form = {
                                body: welcomeMessage,
                                mentions: mentions
                        };

                        if (threadData.data.welcomeAttachment) {
                                const files = threadData.data.welcomeAttachment;
                                const attachments = files.map(file => drive.getFile(file, "stream"));

                                form.attachment = (await Promise.allSettled(attachments))
                                        .filter(({ status }) => status === "fulfilled")
                                        .map(({ value }) => value);
                        }

                        message.send(form);
                        delete global.temp.welcomeEvent[threadID];
                }, 1500);
        }
};
