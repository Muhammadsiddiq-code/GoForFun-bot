// const TelegramBot = require("node-telegram-bot-api");

// const token = "8380495575:AAHCycD6THUQ4e4I34mlcNPQjJRm0kHNV0s";
// const bot = new TelegramBot(token, { polling: true });

// bot.on("message", (msg) => {
//   if (msg.text === "/start") {
//         const firstName = msg.from.first_name || "foydalanuvchi";

//     bot.sendMessage(
//       msg.chat.id,
//       `Assalomu alaykum ${firstName} 👋 Botga xush kelibsiz. Sizni korib turganimizdan mamnunmiz.`,
//       {
//         reply_markup: {
//           inline_keyboard: [
//             [
//               {
//                 text: "Open GoforFun",
//                 web_app: {
//                   url: "https://goforfun.vercel.app",
//                 },
//               },
//             ],
//           ],
//         },
//       }
//     );
//   }
// });







// require("dotenv").config();
// const express = require("express");
// const TelegramBot = require("node-telegram-bot-api");

// const app = express();

// // Render / Railway uchun
// const PORT = process.env.PORT || 5577;

// // Token env dan olinadi
// const TOKEN = process.env.BOT_TOKEN;

// if (!TOKEN) {
//   console.error("BOT_TOKEN topilmadi");
//   process.exit(1);
// }

// // Bot (polling)
// const bot = new TelegramBot(TOKEN, {
//   polling: {
//     interval: 300,
//     autoStart: true,
//   },
// });

// // /start komandasi
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from.first_name || "foydalanuvchi";

//   bot.sendMessage(
//     chatId,
//     `Assalomu alaykum ${firstName} 👋\n\nBotga xush kelibsiz. Sizni korib turganimizdan mamnunmiz.`,
//     {
//       reply_markup: {
//         inline_keyboard: [
//           [
//             {
//               text: "Open GoforFun",
//               web_app: {
//                 url: "https://goforfun.vercel.app",
//               },
//             },
//           ],
//         ],
//       },
//     }
//   );
// });

// // Oddiy text handler (xohlasangiz)
// bot.on("message", (msg) => {
//   if (msg.text && !msg.text.startsWith("/")) {
//     bot.sendMessage(msg.chat.id, "❓ Buyruqlar: /start");
//   }
// });

// // Express server (Render uxlab qolmasligi uchun)
// app.get("/", (req, res) => {
//   res.send("Bot ishlayapti ✅");
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server ${PORT}-portda ishlayapti`);
// });













require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5577;
const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = "https://goforfun.vercel.app";

if (!TOKEN) {
  console.error("❌ BOT_TOKEN topilmadi");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});

// Ma'lumotlar bazasi (xotirada)
const games = new Map(); // gameId -> game data
const users = new Map(); // userId -> user data

// =====================
// KOMANDALAR
// =====================

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || "Foydalanuvchi";
  const username = msg.from.username || "";

  // Foydalanuvchini saqlash
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      firstName,
      username,
      gamesCreated: 0,
      gamesJoined: 0,
    });
  }

  bot.sendMessage(
    chatId,
    `⚽️ Assalomu alaykum ${firstName}!\n\n` +
      `<b>GoForFun botiga xush kelibsiz!</b>\n\n` +
      `Bu bot orqali futbol o'yinlarini tashkil qilishingiz va ularga qo'shilishingiz mumkin.\n\n` +
      `🎯 <b>Nima qilishni xohlaysiz?</b>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Web ilovani ochish",
              web_app: { url: WEBAPP_URL },
            },
          ],
          [
            { text: "➕ O'yin yaratish", callback_data: "create_game" },
            { text: "📋 O'yinlar ro'yxati", callback_data: "list_games" },
          ],
          [
            { text: "👤 Profilim", callback_data: "my_profile" },
            { text: "ℹ️ Yordam", callback_data: "help" },
          ],
        ],
      },
    }
  );
});

// /create - O'yin yaratish
bot.onText(/\/create/, (msg) => {
  handleCreateGame(msg.chat.id, msg.from);
});

// /games - O'yinlar ro'yxati
bot.onText(/\/games/, (msg) => {
  handleListGames(msg.chat.id);
});

// /profile - Profil
bot.onText(/\/profile/, (msg) => {
  handleProfile(msg.chat.id, msg.from.id);
});

// /mygames - Mening o'yinlarim
bot.onText(/\/mygames/, (msg) => {
  handleMyGames(msg.chat.id, msg.from.id);
});

// /cancel - Bekor qilish
bot.onText(/\/cancel/, (msg) => {
  bot.sendMessage(msg.chat.id, "❌ Bekor qilindi", {
    reply_markup: { remove_keyboard: true },
  });
});

// =====================
// CALLBACK HANDLERS
// =====================

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const userId = query.from.id;

  await bot.answerCallbackQuery(query.id);

  if (data === "create_game") {
    handleCreateGame(chatId, query.from);
  } else if (data === "list_games") {
    handleListGames(chatId);
  } else if (data === "my_profile") {
    handleProfile(chatId, userId);
  } else if (data === "help") {
    handleHelp(chatId);
  } else if (data.startsWith("join_")) {
    const gameId = data.split("_")[1];
    handleJoinGame(chatId, userId, gameId, query.from);
  } else if (data.startsWith("leave_")) {
    const gameId = data.split("_")[1];
    handleLeaveGame(chatId, userId, gameId);
  } else if (data.startsWith("view_")) {
    const gameId = data.split("_")[1];
    handleViewGame(chatId, gameId);
  } else if (data.startsWith("delete_")) {
    const gameId = data.split("_")[1];
    handleDeleteGame(chatId, userId, gameId);
  } else if (data === "back_to_main") {
    bot.deleteMessage(chatId, messageId);
    bot.sendMessage(chatId, "🏠 Asosiy menyu:", mainMenuKeyboard());
  }
});

// =====================
// WEB APP DATA
// =====================

bot.on("web_app_data", (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);

  if (data.action === "game_created") {
    const gameId = `game_${Date.now()}`;
    const game = {
      id: gameId,
      title: data.title,
      location: data.location,
      date: data.date,
      time: data.time,
      maxPlayers: data.maxPlayers,
      price: data.price || 0,
      description: data.description || "",
      creatorId: msg.from.id,
      creatorName: msg.from.first_name,
      players: [
        {
          id: msg.from.id,
          name: msg.from.first_name,
          username: msg.from.username,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    games.set(gameId, game);

    // Statistikani yangilash
    const user = users.get(msg.from.id);
    if (user) {
      user.gamesCreated++;
    }

    bot.sendMessage(
      chatId,
      `✅ <b>O'yin muvaffaqiyatli yaratildi!</b>\n\n` +
        `⚽️ <b>${game.title}</b>\n` +
        `📍 Joy: ${game.location}\n` +
        `📅 Sana: ${game.date}\n` +
        `⏰ Vaqt: ${game.time}\n` +
        `👥 O'yinchilar: 1/${game.maxPlayers}\n` +
        `💰 Narx: ${game.price} so'm`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📢 O'yinni ulashish",
                switch_inline_query: `O'yinga qo'shiling: ${game.title}`,
              },
            ],
            [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
          ],
        },
      }
    );
  }
});

// =====================
// FUNKSIYALAR
// =====================

function handleCreateGame(chatId, user) {
  bot.sendMessage(
    chatId,
    `➕ <b>Yangi o'yin yaratish</b>\n\n` +
      `Web ilovani oching va o'yin ma'lumotlarini kiriting:`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Ilovani ochish",
              web_app: { url: WEBAPP_URL },
            },
          ],
          [{ text: "◀️ Ortga", callback_data: "back_to_main" }],
        ],
      },
    }
  );
}

function handleListGames(chatId) {
  const activeGames = Array.from(games.values()).filter(
    (game) => game.players.length < game.maxPlayers
  );

  if (activeGames.length === 0) {
    bot.sendMessage(
      chatId,
      "📋 <b>Hozircha faol o'yinlar yo'q</b>\n\n" +
        "Birinchi bo'lib o'yin yarating! ⚽️",
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ O'yin yaratish", callback_data: "create_game" }],
            [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
          ],
        },
      }
    );
    return;
  }

  let message = "📋 <b>Faol o'yinlar ro'yxati:</b>\n\n";

  const keyboard = [];
  activeGames.slice(0, 10).forEach((game, index) => {
    message +=
      `${index + 1}. ⚽️ <b>${game.title}</b>\n` +
      `   📍 ${game.location}\n` +
      `   📅 ${game.date} | ⏰ ${game.time}\n` +
      `   👥 ${game.players.length}/${game.maxPlayers} | 💰 ${game.price} so'm\n\n`;

    keyboard.push([
      {
        text: `${index + 1}. ${game.title} (${game.players.length}/${
          game.maxPlayers
        })`,
        callback_data: `view_${game.id}`,
      },
    ]);
  });

  keyboard.push([{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }]);

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard },
  });
}

function handleViewGame(chatId, gameId) {
  const game = games.get(gameId);

  if (!game) {
    bot.sendMessage(chatId, "❌ O'yin topilmadi");
    return;
  }

  const playersList = game.players
    .map(
      (p, i) => `${i + 1}. ${p.name}${p.username ? ` (@${p.username})` : ""}`
    )
    .join("\n");

  const message =
    `⚽️ <b>${game.title}</b>\n\n` +
    `📍 <b>Joy:</b> ${game.location}\n` +
    `📅 <b>Sana:</b> ${game.date}\n` +
    `⏰ <b>Vaqt:</b> ${game.time}\n` +
    `👥 <b>O'yinchilar:</b> ${game.players.length}/${game.maxPlayers}\n` +
    `💰 <b>Narx:</b> ${game.price} so'm\n` +
    `👤 <b>Tashkilotchi:</b> ${game.creatorName}\n\n` +
    `📝 <b>Tavsif:</b> ${game.description || "Mavjud emas"}\n\n` +
    `<b>Ishtirokchilar:</b>\n${playersList}`;

  const keyboard = [];

  if (game.players.length < game.maxPlayers) {
    keyboard.push([{ text: "✅ Qo'shilish", callback_data: `join_${gameId}` }]);
  }

  keyboard.push([
    {
      text: "📤 Ulashish",
      switch_inline_query: `O'yinga qo'shiling: ${game.title}`,
    },
  ]);

  keyboard.push([{ text: "◀️ Ortga", callback_data: "list_games" }]);

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard },
  });
}

function handleJoinGame(chatId, userId, gameId, user) {
  const game = games.get(gameId);

  if (!game) {
    bot.sendMessage(chatId, "❌ O'yin topilmadi");
    return;
  }

  if (game.players.some((p) => p.id === userId)) {
    bot.sendMessage(chatId, "ℹ️ Siz allaqachon bu o'yinda qatnashyapsiz");
    return;
  }

  if (game.players.length >= game.maxPlayers) {
    bot.sendMessage(chatId, "❌ O'yin to'lgan");
    return;
  }

  game.players.push({
    id: userId,
    name: user.first_name,
    username: user.username,
  });

  // Statistikani yangilash
  const userData = users.get(userId);
  if (userData) {
    userData.gamesJoined++;
  }

  bot.sendMessage(
    chatId,
    `✅ Siz <b>${game.title}</b> o'yiniga muvaffaqiyatli qo'shildingiz!\n\n` +
      `📍 ${game.location}\n` +
      `📅 ${game.date} | ⏰ ${game.time}\n` +
      `👥 ${game.players.length}/${game.maxPlayers} o'yinchi`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👥 O'yinni ko'rish", callback_data: `view_${gameId}` }],
          [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
        ],
      },
    }
  );

  // Tashkilotchiga xabar
  if (game.creatorId !== userId) {
    bot.sendMessage(
      game.creatorId,
      `🔔 <b>Yangi o'yinchi!</b>\n\n` +
        `${user.first_name} sizning "${game.title}" o'yiningizga qo'shildi.\n\n` +
        `👥 Hozirgi o'yinchilar: ${game.players.length}/${game.maxPlayers}`,
      { parse_mode: "HTML" }
    );
  }
}

function handleLeaveGame(chatId, userId, gameId) {
  const game = games.get(gameId);

  if (!game) {
    bot.sendMessage(chatId, "❌ O'yin topilmadi");
    return;
  }

  const playerIndex = game.players.findIndex((p) => p.id === userId);

  if (playerIndex === -1) {
    bot.sendMessage(chatId, "ℹ️ Siz bu o'yinda qatnashmayapsiz");
    return;
  }

  game.players.splice(playerIndex, 1);

  bot.sendMessage(chatId, `✅ Siz <b>${game.title}</b> o'yinidan chiqdingiz`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 O'yinlar ro'yxati", callback_data: "list_games" }],
        [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
      ],
    },
  });
}

function handleDeleteGame(chatId, userId, gameId) {
  const game = games.get(gameId);

  if (!game) {
    bot.sendMessage(chatId, "❌ O'yin topilmadi");
    return;
  }

  if (game.creatorId !== userId) {
    bot.sendMessage(chatId, "❌ Faqat tashkilotchi o'yinni o'chira oladi");
    return;
  }

  games.delete(gameId);

  bot.sendMessage(chatId, `✅ O'yin muvaffaqiyatli o'chirildi`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
      ],
    },
  });
}

function handleMyGames(chatId, userId) {
  const userGames = Array.from(games.values()).filter((game) =>
    game.players.some((p) => p.id === userId)
  );

  if (userGames.length === 0) {
    bot.sendMessage(
      chatId,
      "📋 <b>Siz hali hech qanday o'yinda qatnashmayapsiz</b>\n\n" +
        "O'yinlar ro'yxatiga o'ting va biror o'yinga qo'shiling!",
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 O'yinlar", callback_data: "list_games" }],
            [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
          ],
        },
      }
    );
    return;
  }

  let message = "⚽️ <b>Sizning o'yinlaringiz:</b>\n\n";

  const keyboard = [];
  userGames.forEach((game, index) => {
    const isCreator = game.creatorId === userId;
    message +=
      `${index + 1}. <b>${game.title}</b> ${isCreator ? "👑" : ""}\n` +
      `   📍 ${game.location}\n` +
      `   📅 ${game.date} | ⏰ ${game.time}\n` +
      `   👥 ${game.players.length}/${game.maxPlayers}\n\n`;

    keyboard.push([
      {
        text: `${index + 1}. ${game.title}`,
        callback_data: `view_${game.id}`,
      },
    ]);
  });

  keyboard.push([{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }]);

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard },
  });
}

function handleProfile(chatId, userId) {
  const user = users.get(userId);

  if (!user) {
    bot.sendMessage(chatId, "❌ Profil topilmadi");
    return;
  }

  const userGames = Array.from(games.values()).filter((game) =>
    game.players.some((p) => p.id === userId)
  );

  const createdGames = Array.from(games.values()).filter(
    (game) => game.creatorId === userId
  );

  const message =
    `👤 <b>Sizning profilingiz</b>\n\n` +
    `📝 <b>Ism:</b> ${user.firstName}\n` +
    `🆔 <b>Username:</b> ${
      user.username ? `@${user.username}` : "Mavjud emas"
    }\n\n` +
    `📊 <b>Statistika:</b>\n` +
    `⚽️ Yaratilgan o'yinlar: ${createdGames.length}\n` +
    `👥 Qatnashgan o'yinlar: ${userGames.length}\n` +
    `🏆 Jami o'yinlar: ${user.gamesCreated + user.gamesJoined}`;

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚽️ Mening o'yinlarim", callback_data: "back_to_main" }],
        [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
      ],
    },
  });
}

function handleHelp(chatId) {
  const message =
    `ℹ️ <b>Yordam</b>\n\n` +
    `<b>Asosiy komandalar:</b>\n` +
    `/start - Botni ishga tushirish\n` +
    `/create - O'yin yaratish\n` +
    `/games - O'yinlar ro'yxati\n` +
    `/mygames - Mening o'yinlarim\n` +
    `/profile - Profilim\n\n` +
    `<b>Bot haqida:</b>\n` +
    `GoForFun - futbol o'yinlarini tashkil qilish uchun bot. ` +
    `Siz o'yin yaratishingiz, boshqa o'yinlarga qo'shilishingiz va ` +
    `do'stlaringiz bilan futbol o'ynashingiz mumkin!\n\n` +
    `❓ Savollar bo'lsa, @yourcontact ga murojaat qiling.`;

  bot.sendMessage(chatId, message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main" }],
      ],
    },
  });
}

function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Web ilovani ochish",
            web_app: { url: WEBAPP_URL },
          },
        ],
        [
          { text: "➕ O'yin yaratish", callback_data: "create_game" },
          { text: "📋 O'yinlar ro'yxati", callback_data: "list_games" },
        ],
        [
          { text: "👤 Profilim", callback_data: "my_profile" },
          { text: "ℹ️ Yordam", callback_data: "help" },
        ],
      ],
    },
  };
}

// =====================
// INLINE MODE (ixtiyoriy)
// =====================

bot.on("inline_query", (query) => {
  const activeGames = Array.from(games.values())
    .filter((game) => game.players.length < game.maxPlayers)
    .slice(0, 10);

  const results = activeGames.map((game, index) => ({
    type: "article",
    id: `${index}`,
    title: `⚽️ ${game.title}`,
    description: `📍 ${game.location} | 📅 ${game.date} | 👥 ${game.players.length}/${game.maxPlayers}`,
    input_message_content: {
      message_text:
        `⚽️ <b>${game.title}</b>\n\n` +
        `📍 Joy: ${game.location}\n` +
        `📅 Sana: ${game.date}\n` +
        `⏰ Vaqt: ${game.time}\n` +
        `👥 O'yinchilar: ${game.players.length}/${game.maxPlayers}\n` +
        `💰 Narx: ${game.price} so'm\n\n` +
        `Qo'shilish uchun botni bosing: @GoForFunFootballbot`,
      parse_mode: "HTML",
    },
  }));

  bot.answerInlineQuery(query.id, results, { cache_time: 10 });
});

// =====================
// EXPRESS SERVER
// =====================

app.get("/", (req, res) => {
  res.send("✅ GoForFun Bot ishlayapti");
});

app.get("/stats", (req, res) => {
  res.json({
    totalGames: games.size,
    totalUsers: users.size,
    activeGames: Array.from(games.values()).filter(
      (g) => g.players.length < g.maxPlayers
    ).length,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda ishga tushdi`);
  console.log(`⚽️ GoForFun Bot faol`);
});