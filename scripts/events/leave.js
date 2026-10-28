const { getTime, drive } = global.utils;

module.exports = {
        config: {
                name: "leave",
                version: "1.7",
                author: "NTKhang",
                editor: "Camille Uchiha 🍓 x Sae Itoshi",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "sáng",
                        session2: "trưa",
                        session3: "chiều",
                        session4: "tối",
                        leaveType1: "tự rời",
                        leaveType2: "bị kick",
                        defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
                },
                en: {
                        session1: "morning",
                        session2: "noon",
                        session3: "afternoon",
                        session4: "evening",
                        leaveType1: "left",
                        leaveType2: "was kicked from",
                        defaultLeaveMessage: "{userName} {type} the group"
                },
                fr: {
                        session1: "Matin",
                        session2: "Midi",
                        session3: "Après-midi",
                        session4: "Soir",
                        leaveType1: "a fui comme un faible",
                        leaveType2: "a été expulsé comme un déchet de",
                        defaultLeaveMessage: `{userNameTag}`
                }
        },

        onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
                if (event.logMessageType == "log:unsubscribe") {
                        const { threadID } = event;
                        const threadData = await threadsData.get(threadID);

                        if (!threadData.settings.sendLeaveMessage)
                                return;

                        const { leftParticipantFbId } = event.logMessageData;

                        // Si c'est le bot lui-même qui part/est viré, on ne fait rien
                        if (leftParticipantFbId == api.getCurrentUserID())
                                return;

                        const hours = getTime("HH");
                        const threadName = threadData.threadName;
                        const userName = await usersData.getName(leftParticipantFbId);

                        // Détection exacte : Départ de soi-même vs Expulsion par un tiers/admin
                        const isSelfLeave = leftParticipantFbId == event.author;

                        // 25 phrases pour départ volontaire
                        const selfLeaveQuotes = [
                                "Un médiocre de moins sur le terrain. {userNameTag} n'avait pas le niveau pour rester dans {boxName}.",
                                "Tu fuis ? Pathétique. {userNameTag} confirme juste qu'il n'a rien à faire ici.",
                                "Les faibles finissent toujours par céder à la pression. Adieu, {userNameTag}.",
                                "{userNameTag} a quitté {boxName}. Aucun regret, ton talent était invisible de toute façon.",
                                "Abandonner est la seule chose que tu sais faire correctement, {userNameTag}.",
                                "Ce terrain demande de l'excellence, pas du bricolage. Bon débarras, {userNameTag}.",
                                "Tu dégages de toi-même ? Au moins, tu connais ta place : très loin de {boxName}.",
                                "{userNameTag} s'en va à {time}h ({session}). La seule décision intelligente de ta journée.",
                                "Pas de place pour les figurants ici. Disparais, {userNameTag}.",
                                "{userNameTag} a préféré abandonner. Tu n'avais de toute façon ni la vision, ni la technique.",
                                "Ton niveau n'a jamais dépassé le niveau régional. Quitte {boxName} sans faire de bruit.",
                                "Un joueur sans ambition s'en va. La routine.",
                                "N'essaye même pas de revenir, {userNameTag}. On n'a pas de temps à perdre avec les figurants.",
                                "{userNameTag} s'est éliminé tout seul. Merci d'avoir économisé notre temps.",
                                "Si tu comptais laisser une trace dans {boxName}, c'est raté. Bon vent, {userNameTag}.",
                                "{userNameTag} fuit la compétition. Une habitude chez les faibles.",
                                "C'est donc ça ton niveau maximal ? Abandonner à {time}h ? Pitoyable.",
                                "Personne ne te retiendra, {userNameTag}. Ton absence est déjà une amélioration.",
                                "Tu es venu, tu as été inutile, tu es parti. Un parcours parfait de médiocre, {userNameTag}.",
                                "Le terrain de {boxName} devient un peu plus propre sans toi, {userNameTag}.",
                                "{userNameTag} a préféré abdiquer. Tu me répugnes.",
                                "Va jouer dans une ligue à ta hauteur : avec les amateurs.",
                                "Disparais de ma vue, {userNameTag}. Tu me fais perdre mon temps.",
                                "{userNameTag} quitte le groupe. Même pas capable de soutenir le rythme.",
                                "Un déchet de moins à gérer dans {boxName}."
                        ];

                        // 25 phrases pour expulsion (KICK)
                        const kickedQuotes = [
                                "Tu te fais virer de {boxName} à {time}h. Même expulsé, tu manques de classe, {userNameTag}.",
                                "On t'a jeté dehors comme tu le méritais. {userNameTag}, tu étais un poids mort.",
                                "Expulsé. La seule fin logique pour un incapable comme {userNameTag}.",
                                "{userNameTag} a été éjecté de {boxName}. C'est ce qui arrive quand on n'a aucun talent.",
                                "Le ménage a été fait : {userNameTag} est dehors. Retourne jouer dans la boue.",
                                "Tu pensais avoir ta place ici ? Quel manque de lucidité, {userNameTag}.",
                                "Expulsion méritée. {userNameTag} ne servait strictement à rien dans {boxName}.",
                                "On t'a montré la sortie. Ne remets plus jamais les pieds ici, {userNameTag}.",
                                "{userNameTag} vient de se faire sortir à {time}h ({session}). Tu fais de la peine.",
                                "Sortie de terrain definitiva pour {userNameTag}. Tu n'as jamais été au niveau.",
                                "Éliminé. Ton existence dans {boxName} n'était qu'une erreur de casting.",
                                "On t'a viré parce que ta présence seule faisait baisser le niveau du groupe.",
                                "{userNameTag} est hors-jeu. Définitivement.",
                                "Tu te croyais intouchable ? Te voilà jeté à la poubelle, {userNameTag}.",
                                "Un coup de pied aux fesses et au revoir. La seule tactique efficace contre {userNameTag}.",
                                "Jeté de {boxName} sans la moindre hésitation. Tu étais un obstacle.",
                                "Fin de partie pour {userNameTag}. Tu as été nul du début à la fin.",
                                "{userNameTag} s'est fait virer. Même en défense, tu n'aurais servi à rien.",
                                "On purge les éléments inutiles. {userNameTag} était en haut de la liste.",
                                "{userNameTag} expulsé. Va apprendre à jouer avant de repasser par là.",
                                "{userNameTag} a pris un carton rouge définitif dans {boxName}.",
                                "Même les ramasseurs de balles ont plus de valeur que toi, {userNameTag}. Dehors.",
                                "Expulsé à {time}h. Va pleurer ailleurs, {userNameTag}.",
                                "{boxName} se porte déjà mieux sans toi, {userNameTag}.",
                                "Tu as été balayé. Reprends ta vie d'amateur loin d'ici."
                        ];

                        const quotesPool = isSelfLeave ? selfLeaveQuotes : kickedQuotes;
                        const randomQuote = quotesPool[Math.floor(Math.random() * quotesPool.length)];

                        const headerEmoji = isSelfLeave ? "🥀" : "❌";
                        const endEmoji = isSelfLeave ? "🏃‍♂️" : "🥾";

                        // Définition directe du message pour éviter les conflits de données résiduelles dans le thread
                        let leaveMessage = `━━━ ${headerEmoji} 𝗦𝗔𝗘 𝗜𝗧𝗢𝗦𝗛𝗜 ${headerEmoji} ━━━\n\n⚽ ${randomQuote}\n\n🕐 𝗛𝗲𝘂𝗿𝗲: {time}h ({session})\n📍 𝗧𝗲𝗿𝗿𝗮𝗶𝗻: {boxName} ${endEmoji}\n\n━━━━━━━━━━━━━━━━━━━━━━━`;

                        const form = {
                                mentions: [{
                                        tag: userName,
                                        id: leftParticipantFbId
                                }]
                        };

                        leaveMessage = leaveMessage
                                .replace(/\{userName\}|\{userNameTag\}/g, userName)
                                .replace(/\{type\}/g, isSelfLeave ? getLang("leaveType1") : getLang("leaveType2"))
                                .replace(/\{threadName\}|\{boxName\}/g, threadName)
                                .replace(/\{time\}/g, hours)
                                .replace(/\{session\}/g, hours <= 10 ?
                                        getLang("session1") :
                                        hours <= 12 ?
                                                getLang("session2") :
                                                hours <= 18 ?
                                                        getLang("session3") :
                                                        getLang("session4")
                                );

                        form.body = leaveMessage;
                        message.send(form);
                }
        }
};
