const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const API_URL = "http://de-bots3.h1cloud.net:25087";

const loading = document.getElementById("loading");
const content = document.getElementById("content");

function showError(message) {
    loading.innerHTML = `
        <div class="error">
            ❌ ${message}
        </div>
    `;
}

async function loadPlayer() {
    try {
        const initData = tg.initData;

        if (!initData) {
            showError("Откройте инвентарь через Telegram.");
            return;
        }

        const response = await fetch(`${API_URL}/api/me`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                initData: initData
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка сервера: " + response.status);
        }

        const player = await response.json();

        loading.style.display = "none";
        content.style.display = "block";

        renderPlayer(player);

    } catch (error) {
        console.error(error);
        showError("Не удалось загрузить данные игрока.");
    }
}

function renderPlayer(player) {
    document.getElementById("player-name").textContent =
        player.name || "Игрок";

    document.getElementById("player-race").textContent =
        player.race || "Человек";

    document.getElementById("player-floor").textContent =
        player.floor ?? 1;

    document.getElementById("player-hp").textContent =
        `${player.hp ?? 0}/${player.max_hp ?? 0}`;

    document.getElementById("player-energy").textContent =
        `${player.energy ?? 0}%`;

    document.getElementById("player-strength").textContent =
        player.str ?? 0;

    document.getElementById("player-endurance").textContent =
        player.end ?? 0;

    document.getElementById("player-agility").textContent =
        player.agi ?? 0;

    document.getElementById("player-gold").textContent =
        player.gold ?? 0;

    renderInventory(player.inventory || []);
}

function renderInventory(inventory) {
    const container = document.getElementById("inventory");

    container.innerHTML = "";

    if (!inventory.length) {
        container.innerHTML = `
            <div class="empty">
                🎒 Инвентарь пуст
            </div>
        `;
        return;
    }

    inventory.forEach(item => {
        const element = document.createElement("div");

        element.className = "inventory-item";

        element.innerHTML = `
            <div class="item-name">
                ${item.name || "Предмет"}
            </div>

            <div class="item-count">
                ×${item.count ?? 1}
            </div>
        `;

        container.appendChild(element);
    });
}

loadPlayer();
