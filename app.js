const tg = window.Telegram.WebApp;
tg.ready();

const profileDiv = document.getElementById("profile");

// Telegram user ma’lumotlari
const user = tg.initDataUnsafe?.user;

if (!user) {
  profileDiv.innerHTML = `
    <p>Bu sahifaga faqat Telegram bot orqali kiriladi.</p>
  `;
} else {
  profileDiv.innerHTML = `
    <img src="${user.photo_url || ""}" alt="Avatar" />
    <div class="name">
      ${user.first_name || ""} ${user.last_name || ""}
    </div>
    <div class="username">
      @${user.username || "username yo‘q"}
    </div>
    <div class="info">Telegram ID: ${user.id}</div>
    <div class="info">Til: ${user.language_code}</div>
  `;
}
