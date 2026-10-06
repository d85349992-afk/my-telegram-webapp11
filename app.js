const tg = window.Telegram && window.Telegram.WebApp;

if (!tg) {
    document.getElementById("status").textContent =
        "❌ WebApp открыт не внутри Telegram.";
} else {
    tg.ready();
    tg.expand();

    // Адрес API твоего Telegram-бота
    const API_URL =
        "https://mortgages-answered-giving-eventually.trycloudflare.com";

    const status = document.getElementById("status");
    const profile = document.getElementById("profile");
    const inventory = document.getElementById("inventory");

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function showError(message) {
        status.className = "status error";
        status.textContent = "❌ " + message;
    }

    function renderList(containerId, items, emptyText) {
        const container = document.getElementById(containerId);

        if (!container) {
            return;
        }

        container.innerHTML = "";

        if (!items || !items.length) {
            container.innerHTML =
                `<div class="empty">${escapeHtml(emptyText)}</div>`;
            return;
        }

        for (const item of items) {
            const row = document.createElement("div");

            row.className = "inventory-item";

            row.innerHTML = `
                <div class="item-name">
                    ${escapeHtml(item.name || "Предмет")}
                </div>

                <div class="item-count">
                    ×${Number(item.count ?? 1)}
                </div>
            `;

            container.appendChild(row);
        }
    }

    function renderEquipment(equip) {
        const container = document.getElementById("equip");

        if (!container) {
            return;
        }

        const labels = {
            weapon: "⚔️ Оружие",
            helmet: "🪖 Шлем",
            chest: "🛡 Доспех",
            legs: "👖 Поножи",
            shield: "🛡 Щит",
            ring: "💍 Кольцо",
            badge: "🎖 Значок"
        };

        const entries = Object.entries(labels).map(([slot, label]) => {
            const value = equip?.[slot];

            return `
                <div class="inventory-item">
                    <div class="item-name">
                        ${label}
                    </div>

                    <div class="item-count">
                        ${escapeHtml(value || "—")}
                    </div>
                </div>
            `;
        });

        container.innerHTML = entries.join("");
    }

    function renderPlayer(player) {
        document.getElementById("playerName").textContent =
            player.name || "Игрок";

        document.getElementById("playerRace").textContent =
            player.race || "Не выбрана";

        document.getElementById("floor").textContent =
            player.floor ?? 1;

        document.getElementById("hp").textContent =
            `${player.hp ?? 0}/${player.max_hp ?? 0}`;

        document.getElementById("energy").textContent =
            `${player.energy ?? 0}%`;

        document.getElementById("clan").textContent =
            player.clan || "Нет";

        document.getElementById("str").textContent =
            player.str ?? 0;

        document.getElementById("end").textContent =
            player.end ?? 0;

        document.getElementById("agi").textContent =
            player.agi ?? 0;

        document.getElementById("gold").textContent =
            `${player.gold ?? 0} 🪙`;

        document.getElementById("pet").textContent =
            `🐾 Питомец: ${player.pet || "нет"}`;

        renderEquipment(player.equip || {});

        renderList(
            "potions",
            player.potions || [],
            "🧪 Зелий нет"
        );

        renderList(
            "bag",
            player.bag || [],
            "🎒 Предметов нет"
        );

        const bagCount = (player.bag || []).reduce(
            (sum, item) =>
                sum + Math.max(0, Number(item.count || 0)),
            0
        );

        const potionCount = (player.potions || []).reduce(
            (sum, item) =>
                sum + Math.max(0, Number(item.count || 0)),
            0
        );

        const used = bagCount + potionCount;

        const slots = document.getElementById("slots");

        if (slots) {
            slots.textContent =
                `${used}/${player.inv_size ?? 20}`;
        }

        status.className = "status hidden";

        profile.classList.remove("hidden");
        inventory.classList.remove("hidden");
    }

    async function loadPlayer() {
        try {
            const initData = tg.initData;

            if (!initData) {
                showError(
                    "Откройте WebApp через Telegram, а не обычной ссылкой."
                );
                return;
            }

            const response = await fetch(
                `${API_URL}/api/me`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        initData: initData
                    })
                }
            );

            const data =
                await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error(
                    "WebApp API error:",
                    response.status,
                    data
                );

                if (response.status === 401) {
                    throw new Error(
                        "Telegram-авторизация не прошла. Откройте WebApp из Telegram."
                    );
                }

                throw new Error(
                    data.error ||
                    `Ошибка сервера: ${response.status}`
                );
            }

            renderPlayer(data);

        } catch (error) {
            console.error(error);

            showError(
                error.message ||
                "Не удалось загрузить данные игрока."
            );
        }
    }

    const closeButton =
        document.getElementById("closeBtn");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            () => tg.close()
        );
    }

    loadPlayer();
}
