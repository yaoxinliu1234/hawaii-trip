const data = window.HAWAII_DATA;
let activeIsland = "oahu";
let activeDay = 0;

const islandCards = document.getElementById("islandCards");
const islandSwitch = document.getElementById("islandSwitch");
const daySwitch = document.getElementById("daySwitch");
const routeBoard = document.getElementById("routeBoard");
const spotsGrid = document.getElementById("spotsGrid");
const spotsSubtitle = document.getElementById("spotsSubtitle");
const tipsGrid = document.getElementById("tipsGrid");
const modal = document.getElementById("detailModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function attractionMap(islandId) {
  const map = {};
  data.islands[islandId].attractions.forEach((a) => {
    map[a.id] = a;
  });
  return map;
}

function renderIslandCards() {
  islandCards.innerHTML = Object.values(data.islands)
    .map((island) => {
      const cover = island.attractions[0];
      const thumbs = island.attractions
        .slice(0, 5)
        .map((a) => `<img src="images/${a.id}.jpg" alt="${a.name}" />`)
        .join("");
      return `
        <article class="island-card" data-island="${island.id}">
          <div class="island-cover">
            <img src="images/${cover.id}.jpg" alt="${island.name}" />
            <span>${island.emoji} ${island.englishName}</span>
          </div>
          <div class="island-body">
            <h3>${island.name}</h3>
            <div class="en">${island.englishName}</div>
            <p>${island.description}</p>
            <div class="strip">${thumbs}</div>
          </div>
        </article>
      `;
    })
    .join("");

  islandCards.querySelectorAll(".island-card").forEach((card) => {
    card.addEventListener("click", () => {
      activeIsland = card.dataset.island;
      activeDay = 0;
      renderAll();
      document.getElementById("route").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderIslandSwitch() {
  islandSwitch.innerHTML = Object.values(data.islands)
    .map(
      (island) => `
      <button class="chip ${island.id} ${activeIsland === island.id ? "active" : ""}" data-island="${island.id}">
        ${island.emoji} ${island.name}
      </button>
    `
    )
    .join("");

  islandSwitch.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeIsland = btn.dataset.island;
      activeDay = 0;
      renderAll();
    });
  });
}

function renderDaySwitch() {
  const days = data.itineraries[activeIsland].days;
  daySwitch.innerHTML = days
    .map(
      (day, index) => `
      <button class="chip ${activeDay === index ? "active" : ""}" data-day="${index}">
        Day ${day.day}
      </button>
    `
    )
    .join("");

  daySwitch.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDay = Number(btn.dataset.day);
      renderRouteBoard();
      renderDaySwitch();
    });
  });
}

function renderRouteBoard() {
  const island = data.islands[activeIsland];
  const itinerary = data.itineraries[activeIsland];
  const day = itinerary.days[activeDay];
  const map = attractionMap(activeIsland);

  const timeline = day.stops
    .map(
      (stop) => `
      <div class="tl-item">
        <div class="tl-num" style="background:${island.color}">${stop.num}</div>
        <div>
          <div class="tl-time">${stop.time}</div>
          <div class="tl-text">${stop.content}</div>
        </div>
      </div>
    `
    )
    .join("");

  const road = day.stops
    .map((stop) => {
      const attr = stop.attractionId ? map[stop.attractionId] : null;
      if (attr) {
        return `
          <div class="road-stop">
            <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
            <button class="photo-card" data-attraction="${attr.id}" type="button">
              <img src="images/${attr.id}.jpg" alt="${attr.name}" />
              <div class="photo-meta">
                <strong>${attr.emoji} ${attr.name}</strong>
                <span>${stop.time}</span>
                <em>点击查看详情 ›</em>
              </div>
            </button>
          </div>
        `;
      }
      return `
        <div class="road-stop">
          <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
          <div class="text-node">
            <span>${stop.time}</span>
            <p>${stop.content}</p>
          </div>
        </div>
      `;
    })
    .join("");

  routeBoard.innerHTML = `
    <div>
      <div class="day-ribbon">
        <div class="label">Day ${day.day}</div>
        <h3>${day.title}</h3>
        <div class="theme">${day.theme}</div>
      </div>
      <div class="timeline">${timeline}</div>
    </div>
    <div class="roadmap">${road}</div>
  `;

  routeBoard.querySelectorAll(".photo-card").forEach((card) => {
    card.addEventListener("click", () => openAttraction(activeIsland, card.dataset.attraction));
  });
}

function renderSpots() {
  const island = data.islands[activeIsland];
  spotsSubtitle.textContent = `${island.name} · 点击任意卡片查看详情`;
  spotsGrid.innerHTML = island.attractions
    .map(
      (a) => `
      <article class="spot-card" data-attraction="${a.id}">
        <img src="images/${a.id}.jpg" alt="${a.name}" loading="lazy" />
        <div class="body">
          <h3>${a.emoji} ${a.name}</h3>
          <p>${a.englishName} · ${a.duration}</p>
        </div>
      </article>
    `
    )
    .join("");

  spotsGrid.querySelectorAll(".spot-card").forEach((card) => {
    card.addEventListener("click", () => openAttraction(activeIsland, card.dataset.attraction));
  });
}

function renderTips() {
  tipsGrid.innerHTML = data.tips
    .map(
      (tip) => `
      <article class="tip-card">
        <h3>${tip.icon} ${tip.category}</h3>
        <ul>${tip.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    `
    )
    .join("");
}

function openAttraction(islandId, attractionId) {
  const island = data.islands[islandId];
  const a = island.attractions.find((x) => x.id === attractionId);
  if (!a) return;

  modalBody.innerHTML = `
    <div class="modal-hero">
      <img src="images/${a.id}.jpg" alt="${a.name}" />
      <div class="caption">
        <h2>${a.emoji} ${a.name}</h2>
        <div class="en">${a.englishName}</div>
      </div>
    </div>
    <div class="modal-body">
      <div class="tags">
        <span class="tag">${a.category}</span>
        <span class="tag">⏱ ${a.duration}</span>
        <span class="tag">💰 ${a.ticket}</span>
        <span class="tag">📍 ${a.location}</span>
      </div>
      <p>${a.description}</p>
      <h4>实用贴士</h4>
      <ul>${a.tips.map((t) => `<li>${t}</li>`).join("")}</ul>
    </div>
  `;
  modal.showModal();
}

function renderAll() {
  renderIslandSwitch();
  renderDaySwitch();
  renderRouteBoard();
  renderSpots();
}

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});

renderIslandCards();
renderTips();
renderAll();
