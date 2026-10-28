const fs = require("fs");
const path = require("path");

let moduleStatus = true;

const responsesSae = [
  "Tu me fais perdre mon temps. Parle seulement si c'est utile.",
  "Qu'est-ce que tu me veux ? Sois bref et précis.",
  "Encore une salutation inutile. Tu n'as rien de mieux à faire ?",
  "Évite de m'adresser la parole si c'est pour dire des banalités.",
  "Tu crois vraiment que j'ai le temps de te répondre un 'bonjour' ?",
  "Médiocre. Même ta façon de saluer manque totalement de conviction.",
  "Parle. Mais si ce que tu vas dire est stupide, je te bloque.",
  "Tu viens encore polluer mon fil avec du bruit inutile ?",
  "Je ne suis pas ton pote. Viens-en immédiatement au fait.",
  "Tes salutations ne m'intéressent pas. Montre de la valeur ou tais-toi.",
  "Un 'salut' de plus sans aucun fondement. Pitoyable.",
  "Tu perds ton temps et tu gâches inutilement le mien.",
  "Si c'est pour ne rien dire de pertinent, retourne t'entraîner.",
  "Tu manques cruellement de vision, de précision et de talent.",
  "Pourquoi tu insistes ? On n'a absolument rien à se dire.",
  "Tu fais du bruit, pas du résultat.",
  "Encore un être insignifiant qui cherche désespérément de l'attention.",
  "Économise tes mots. Seuls les actes m'impressionnent.",
  "Tu salues comme un amateur. Rien dans le regard, rien dans le ton.",
  "Tu n'as toujours pas compris que tes politesses futiles m'agacent ?",
  "Abrège. J'ai des choses infiniment plus sérieuses à gérer.",
  "Si ta présence apportait quelque chose au groupe, ça se saurait.",
  "Ne me regarde pas avec cette tête. Dis ce que tu veux ou dégage.",
  "Tu es juste un figurant de plus sur le terrain.",
  "Le niveau ici est désespérément bas... Même les 'salut' font de la peine.",
  "Tu penses sérieusement que ton petit 'coucou' mérite une réponse ?",
  "Rien de ce que tu vas dire après ça n'aura d'impact.",
  "Encore là ? Tu n'as décidément aucun instinct.",
  "Tu viens gratter de la considération ? Mauvaise adresse.",
  "Sois direct ou disparais immédiatement de ma vue.",
  "Inutile d'essayer de faire bonne impression, c'est déjà raté.",
  "Tu manques de vitesse, de précision et de présence.",
  "Tes mots sont aussi tièdes et fades que ton niveau.",
  "Tu parles beaucoup trop. Agis plus.",
  "J'ai failli ne même pas te calculer. Sois reconnaissant.",
  "Ne confonds jamais ma présence ici avec de la sympathie.",
  "Si tu n'as rien de brillant à proposer, passe ton chemin.",
  "Tu fais de la peine à insister ainsi.",
  "Ta simple présence abaisse le niveau global du chat.",
  "Tu veux un autographe ou tu as un vrai sujet à aborder ?",
  "Encore une tentative maladroite d'engager la conversation.",
  "Tu es prévisible. Et la prédictibilité, c'est la pire des faiblesses.",
  "Tu tournes en rond. Viens-en au fait avant que je me casse.",
  "Tu m'ennuies déjà. Fais au moins un effort de créativité.",
  "Ne viens pas pleurer si la réalité te blesse.",
  "Tu es à des années-lumière du niveau requis.",
  "J'attends toujours de voir un éclair de génie chez toi... Toujours rien.",
  "Salut ? Non. Va travailler.",
  "Tu gâches ton énergie dans des banalités de seconde zone.",
  "Si c'est tout ce que tu avais à dire, la discussion est terminée."
];

module.exports = {
  config: {
    name: "salutations",
    aliases: ["salut", "yo", "bonjour", "cc", "wsh", "hey"],
    version: "1.0",
    author: "ᴄʀɪᴍsᴏɴ 🥷🪽",
    description: "Réponse froide style Sae Itoshi aux salutations.",
    category: "system",
    role: 0
  },

  onStart: async function ({ message, args }) {
    const state = args[0]?.toLowerCase();
    if (state === "on") {
      moduleStatus = true;
      return message.reply("🟢 Mode salutations activé.");
    }
    if (state === "off") {
      moduleStatus = false;
      return message.reply("🔴 Mode salutations désactivé.");
    }
    return message.reply(`📊 Statut : ${moduleStatus ? "ACTIVÉ 🟢" : "DÉSACTIVÉ 🔴"}\nUsage: salutations [on/off]`);
  },

  onChat: async function ({ message, event, api }) {
    if (!moduleStatus || !event.body || event.senderID === api.getCurrentUserID()) return;

    const text = event.body.toLowerCase();
    const isGreeting = /\b(salut|bonjour|coucou|cc|hey|hello|yo|wsh|slt)\b/i.test(text);

    if (isGreeting) {
      const randomMsg = responsesSae[Math.floor(Math.random() * responsesSae.length)];
      const randomIndex = Math.floor(Math.random() * 10) + 1;
      const imgPath = path.join(__dirname, "brayanImg", `kiyo${randomIndex}.jpg`);

      if (fs.existsSync(imgPath)) {
        return message.reply({
          body: randomMsg,
          attachment: fs.createReadStream(imgPath)
        });
      }
      return message.reply(randomMsg);
    }
  }
};
