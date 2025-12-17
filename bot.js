const TelegramBot = require("node-telegram-bot-api");

const token = "8380495575:AAHCycD6THUQ4e4I34mlcNPQjJRm0kHNV0s"; // O'zingizning botingiz bilan almashtiring token const
bot = new TelegramBot(token, { polling: true });

const inlineKeyboard = [
  [
    {
      text: "Open web app",
      web_app: { url: "https://goforfun.vercel.app/" },
    },
  ],
];  

// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;
//   const messageText = msg.text;
//   if (messageText === "/start") {
//       bot.sendMessage(chatId, "Assalomu aleykum Botga xush kelibsiz!", {
//           reply_markup: {
//               inline_keyboard: inlineKeyboard
//           }
//       });
//   }
// });









bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    const firstName = msg.from.first_name || "foydalanuvchi";

    bot.sendMessage(
      chatId,
      `Assalomu alaykum, ${firstName}! 👋\nBotga xush kelibsiz.`,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    );
  }
});