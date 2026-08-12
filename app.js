const data = window.HAWAII_DATA;
let activeIsland = "oahu";
let activeDay = 0;
let editMode = false;

const STORAGE_KEY = "hawaii-itineraries-v2";
const defaultItineraries = JSON.parse(JSON.stringify(data.itineraries));
const undoStack = [];
const MAX_UNDO = 40;

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
const editToggle = document.getElementById("editToggle");
const resetItinerary = document.getElementById("resetItinerary");
const undoBtn = document.getElementById("undoBtn");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStop(stop, index) {
  return {
    num: index + 1,
    time: stop.time || "上午",
    content: stop.content || "",
    notes: stop.notes || "",
    attractionId: stop.attractionId || null,
    image: stop.image || null
  };
}

function normalizeItineraries(source) {
  const next = clone(source);
  Object.keys(next).forEach((islandId) => {
    next[islandId].days = (next[islandId].days || []).map((day, dayIndex) => ({
      day: day.day ?? dayIndex + 1,
      title: day.title || `Day ${dayIndex + 1}`,
      theme: day.theme || "",
      stops: (day.stops || []).map((stop, stopIndex) => normalizeStop(stop, stopIndex))
    }));
  });
  return next;
}

function loadSavedItineraries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      data.itineraries = normalizeItineraries(data.itineraries);
      return;
    }
    data.itineraries = normalizeItineraries(JSON.parse(raw));
  } catch (_) {
    data.itineraries = normalizeItineraries(defaultItineraries);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.itineraries));
  updateUndoButton();
}

function pushUndo() {
  undoStack.push(clone(data.itineraries));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoButton();
}

function undo() {
  if (!undoStack.length) return;
  data.itineraries = undoStack.pop();
  persist();
  if (activeDay >= currentItinerary().days.length) {
    activeDay = Math.max(0, currentItinerary().days.length - 1);
  }
  renderDaySwitch();
  renderRouteBoard();
}

function updateUndoButton() {
  undoBtn.disabled = undoStack.length === 0;
  undoBtn.textContent = undoStack.length ? `Undo (${undoStack.length})` : "Undo";
}

function currentItinerary() {
  return data.itineraries[activeIsland];
}

function currentDay() {
  const itinerary = currentItinerary();
  if (!itinerary.days.length) {
    itinerary.days.push({
      day: 1,
      title: "新的一天",
      theme: "Custom Day",
      stops: [normalizeStop({ time: "上午", content: "写点计划…", notes: "" }, 0)]
    });
    activeDay = 0;
  }
  if (activeDay >= itinerary.days.length) activeDay = itinerary.days.length - 1;
  if (activeDay < 0) activeDay = 0;
  return itinerary.days[activeDay];
}

function renumberStops(day) {
  day.stops.forEach((stop, index) => {
    stop.num = index + 1;
  });
}

function syncDayNumbers(itinerary) {
  itinerary.days.forEach((day, index) => {
    day.day = index + 1;
  });
}

function stopImageSrc(stop, map) {
  if (stop.image) return stop.image;
  if (stop.attractionId && map[stop.attractionId]) {
    return `images/${stop.attractionId}.jpg`;
  }
  return null;
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image failed"));
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- Intro ---------- */
const INTRO_TEXT = "get ready with Yaoxin...";
const INTRO_NAME_START = "get ready with ".length;
const INTRO_NAME_END = INTRO_NAME_START + "Yaoxin".length;
const intro = document.getElementById("intro");
const site = document.getElementById("site");
const introTyped = document.getElementById("introTyped");
const introSkip = document.getElementById("introSkip");
let introFinished = false;

function renderIntroText(count) {
  if (count <= INTRO_NAME_START) {
    introTyped.textContent = INTRO_TEXT.slice(0, count);
    return;
  }
  const before = INTRO_TEXT.slice(0, INTRO_NAME_START);
  const name = INTRO_TEXT.slice(INTRO_NAME_START, Math.min(count, INTRO_NAME_END));
  const after = count > INTRO_NAME_END ? INTRO_TEXT.slice(INTRO_NAME_END, count) : "";
  introTyped.innerHTML = `${before}<span class="name">${name}</span>${after}`;
}

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  intro.classList.add("is-done");
  intro.setAttribute("aria-hidden", "true");
  site.classList.remove("is-hidden");
  document.body.classList.remove("intro-lock");
  window.setTimeout(() => {
    if (intro.parentNode) intro.remove();
  }, 1000);
}

function runIntro() {
  let i = 0;
  const typeTimer = window.setInterval(() => {
    i += 1;
    renderIntroText(i);
    if (i >= INTRO_TEXT.length) {
      window.clearInterval(typeTimer);
      window.setTimeout(finishIntro, 1600);
    }
  }, 70);

  introSkip.addEventListener("click", () => {
    window.clearInterval(typeTimer);
    renderIntroText(INTRO_TEXT.length);
    finishIntro();
  });

  window.setTimeout(finishIntro, 6500);
}

runIntro();

function attractionMap(islandId) {
  const map = {};
  data.islands[islandId].attractions.forEach((a) => {
    map[a.id] = a;
  });
  return map;
}

function attractionOptions(selectedId) {
  const blank = `<option value="">无关联景点（纯文字 / 自定义图）</option>`;
  const options = data.islands[activeIsland].attractions
    .map(
      (a) =>
        `<option value="${a.id}" ${a.id === selectedId ? "selected" : ""}>${a.emoji} ${escapeHtml(a.name)}</option>`
    )
    .join("");
  return blank + options;
}

function updateEditControls() {
  editToggle.textContent = editMode ? "✓ 完成编辑" : "✏️ 编辑行程";
  resetItinerary.classList.toggle("is-hidden", !editMode);
  document.getElementById("editBanner")?.classList.toggle("is-editing", editMode);
  const heroEditBtn = document.getElementById("heroEditBtn");
  if (heroEditBtn) heroEditBtn.textContent = editMode ? "✓ 完成编辑" : "✏️ 编辑行程";
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
  const days = currentItinerary().days;
  daySwitch.innerHTML =
    days
      .map(
        (day, index) => `
      <button class="chip ${activeDay === index ? "active" : ""}" data-day="${index}">
        Day ${day.day}
      </button>
    `
      )
      .join("") +
    (editMode ? `<button class="chip chip-add" type="button" id="addDayBtn">+ 加一天</button>` : "");

  daySwitch.querySelectorAll("[data-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDay = Number(btn.dataset.day);
      renderRouteBoard();
      renderDaySwitch();
    });
  });

  const addDayBtn = document.getElementById("addDayBtn");
  if (addDayBtn) {
    addDayBtn.addEventListener("click", () => {
      pushUndo();
      const itinerary = currentItinerary();
      itinerary.days.push({
        day: itinerary.days.length + 1,
        title: "新的一天",
        theme: "Custom Day",
        stops: [normalizeStop({ time: "上午", content: "写点计划…", notes: "" }, 0)]
      });
      syncDayNumbers(itinerary);
      activeDay = itinerary.days.length - 1;
      persist();
      renderDaySwitch();
      renderRouteBoard();
    });
  }
}

function renderRoadPreview(day, island, map) {
  return day.stops
    .map((stop) => {
      const attr = stop.attractionId ? map[stop.attractionId] : null;
      const img = stopImageSrc(stop, map);
      const title = attr ? `${attr.emoji} ${attr.name}` : stop.content || "自定义一站";
      if (img) {
        return `
          <div class="road-stop">
            <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
            <div class="photo-card custom preview">
              <img src="${img}" alt="" />
              <div class="photo-meta">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(stop.time)}</span>
                ${stop.notes ? `<em class="notes">${escapeHtml(stop.notes)}</em>` : ""}
              </div>
            </div>
          </div>
        `;
      }
      return `
        <div class="road-stop">
          <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
          <div class="text-node">
            <span>${escapeHtml(stop.time)}</span>
            <p>${escapeHtml(stop.content)}</p>
            ${stop.notes ? `<em class="notes">${escapeHtml(stop.notes)}</em>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRouteBoardView() {
  const island = data.islands[activeIsland];
  const day = currentDay();
  const map = attractionMap(activeIsland);

  const timeline = day.stops
    .map(
      (stop) => `
      <div class="tl-item">
        <div class="tl-num" style="background:${island.color}">${stop.num}</div>
        <div>
          <div class="tl-time">${escapeHtml(stop.time)}</div>
          <div class="tl-text">${escapeHtml(stop.content)}</div>
          ${stop.notes ? `<div class="tl-notes">${escapeHtml(stop.notes)}</div>` : ""}
        </div>
      </div>
    `
    )
    .join("");

  const road = day.stops
    .map((stop) => {
      const attr = stop.attractionId ? map[stop.attractionId] : null;
      const img = stopImageSrc(stop, map);
      if (img) {
        const title = attr ? `${attr.emoji} ${attr.name}` : stop.content || "自定义一站";
        const body = `
              <img src="${img}" alt="" />
              <div class="photo-meta">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(stop.time)}</span>
                ${stop.notes ? `<em class="notes">${escapeHtml(stop.notes)}</em>` : ""}
                ${attr ? "<em>点击查看详情 ›</em>" : ""}
              </div>`;
        return `
          <div class="road-stop">
            <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
            ${
              attr
                ? `<button class="photo-card custom" data-attraction="${attr.id}" type="button">${body}</button>`
                : `<div class="photo-card custom">${body}</div>`
            }
          </div>
        `;
      }
      return `
        <div class="road-stop">
          <div class="road-node" style="border-color:${island.color}">${stop.num}</div>
          <div class="text-node">
            <span>${escapeHtml(stop.time)}</span>
            <p>${escapeHtml(stop.content)}</p>
            ${stop.notes ? `<em class="notes">${escapeHtml(stop.notes)}</em>` : ""}
          </div>
        </div>
      `;
    })
    .join("");

  routeBoard.innerHTML = `
    <div>
      <div class="day-ribbon">
        <div class="label">Day ${day.day}</div>
        <h3>${escapeHtml(day.title)}</h3>
        <div class="theme">${escapeHtml(day.theme || "")}</div>
      </div>
      <div class="timeline">${timeline}</div>
    </div>
    <div class="roadmap">${road}</div>
  `;

  routeBoard.querySelectorAll(".photo-card[data-attraction]").forEach((card) => {
    card.addEventListener("click", () => openAttraction(activeIsland, card.dataset.attraction));
  });
}

function renderRouteBoardEdit() {
  const island = data.islands[activeIsland];
  const itinerary = currentItinerary();
  const day = currentDay();
  const map = attractionMap(activeIsland);

  const stopEditors = day.stops
    .map((stop, index) => {
      const thumb = stopImageSrc(stop, map) || "";
      return `
      <div class="edit-stop" data-stop="${index}">
        <div class="edit-stop-top">
          <span class="edit-num" style="background:${island.color}">${stop.num}</span>
          <input class="edit-input" data-field="time" value="${escapeHtml(stop.time)}" placeholder="时间，如 上午 / 14:00" />
          <button class="edit-icon-btn" type="button" data-action="remove-stop">删</button>
        </div>
        <label class="edit-label">这一站
          <input class="edit-input" data-field="content" value="${escapeHtml(stop.content)}" placeholder="景点 / 活动名称" />
        </label>
        <label class="edit-label">Notes
          <textarea class="edit-input" data-field="notes" rows="2" placeholder="备注、餐厅、预约号…">${escapeHtml(stop.notes)}</textarea>
        </label>
        <label class="edit-label">关联景点（可选）
          <select class="edit-input" data-field="attractionId">
            ${attractionOptions(stop.attractionId)}
          </select>
        </label>
        <div class="edit-photo-row">
          <img class="edit-thumb" src="${thumb || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='66'%3E%3Crect fill='%23e8f0f4' width='88' height='66'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' fill='%23899' font-size='11'%3E无图%3C/text%3E%3C/svg%3E"}" alt="" />
          <div class="edit-photo-actions">
            <label class="btn btn-ghost">
              上传图片
              <input class="edit-file" type="file" accept="image/*" data-action="upload" />
            </label>
            <button class="btn btn-ghost" type="button" data-action="clear-image" ${stop.image ? "" : "disabled"}>移除自定义图</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  routeBoard.innerHTML = `
    <div class="edit-panel">
      <div class="day-ribbon edit-ribbon">
        <div class="label">Day ${day.day} · 编辑中</div>
        <label class="edit-label">当天标题
          <input class="edit-input edit-day-title" value="${escapeHtml(day.title)}" placeholder="例如：抵达 · 威基基" />
        </label>
        <label class="edit-label">主题
          <input class="edit-input edit-day-theme" value="${escapeHtml(day.theme || "")}" placeholder="例如：Waikiki" />
        </label>
      </div>
      <div class="edit-stops">${stopEditors}</div>
      <div class="edit-toolbar">
        <button class="btn btn-ghost" type="button" id="addStopBtn">+ 加一站</button>
        <button class="btn btn-ghost danger" type="button" id="removeDayBtn" ${itinerary.days.length <= 1 ? "disabled" : ""}>删除这一天</button>
        <span class="edit-hint">自动保存 · 可 Undo</span>
      </div>
    </div>
    <div class="roadmap edit-preview">${renderRoadPreview(day, island, map)}</div>
  `;

  const titleInput = routeBoard.querySelector(".edit-day-title");
  const themeInput = routeBoard.querySelector(".edit-day-theme");
  let dayFocusSnapshot = null;

  const bindTextUndo = (el, apply) => {
    el.addEventListener("focus", () => {
      dayFocusSnapshot = clone(data.itineraries);
    });
    el.addEventListener("input", () => {
      apply(el.value);
      const preview = routeBoard.querySelector(".edit-preview");
      if (preview) preview.innerHTML = renderRoadPreview(day, island, map);
    });
    el.addEventListener("blur", () => {
      if (!dayFocusSnapshot) return;
      if (JSON.stringify(dayFocusSnapshot) !== JSON.stringify(data.itineraries)) {
        undoStack.push(dayFocusSnapshot);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        persist();
      }
      dayFocusSnapshot = null;
    });
  };

  bindTextUndo(titleInput, (value) => {
    day.title = value;
  });
  bindTextUndo(themeInput, (value) => {
    day.theme = value;
  });

  routeBoard.querySelectorAll(".edit-stop").forEach((row) => {
    const index = Number(row.dataset.stop);
    let stopFocusSnapshot = null;

    row.querySelectorAll("[data-field]").forEach((field) => {
      if (field.tagName === "SELECT") {
        field.addEventListener("change", () => {
          pushUndo();
          day.stops[index].attractionId = field.value || null;
          persist();
          renderRouteBoardEdit();
        });
        return;
      }

      field.addEventListener("focus", () => {
        stopFocusSnapshot = clone(data.itineraries);
      });
      field.addEventListener("input", () => {
        day.stops[index][field.dataset.field] = field.value;
        const preview = routeBoard.querySelector(".edit-preview");
        if (preview) preview.innerHTML = renderRoadPreview(day, island, map);
      });
      field.addEventListener("blur", () => {
        if (!stopFocusSnapshot) return;
        if (JSON.stringify(stopFocusSnapshot) !== JSON.stringify(data.itineraries)) {
          undoStack.push(stopFocusSnapshot);
          if (undoStack.length > MAX_UNDO) undoStack.shift();
          persist();
        }
        stopFocusSnapshot = null;
      });
    });

    row.querySelector('[data-action="remove-stop"]').addEventListener("click", () => {
      if (day.stops.length <= 1) return;
      pushUndo();
      day.stops.splice(index, 1);
      renumberStops(day);
      persist();
      renderRouteBoard();
    });

    row.querySelector('[data-action="upload"]').addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await compressImage(file);
        pushUndo();
        day.stops[index].image = dataUrl;
        persist();
        renderRouteBoardEdit();
      } catch (_) {
        alert("图片读取失败，换一张试试");
      }
    });

    row.querySelector('[data-action="clear-image"]').addEventListener("click", () => {
      if (!day.stops[index].image) return;
      pushUndo();
      day.stops[index].image = null;
      persist();
      renderRouteBoardEdit();
    });
  });

  document.getElementById("addStopBtn").addEventListener("click", () => {
    pushUndo();
    day.stops.push(normalizeStop({ time: "下午", content: "新的一站", notes: "" }, day.stops.length));
    renumberStops(day);
    persist();
    renderRouteBoard();
  });

  document.getElementById("removeDayBtn").addEventListener("click", () => {
    if (itinerary.days.length <= 1) return;
    if (!window.confirm("确定删除这一天？")) return;
    pushUndo();
    itinerary.days.splice(activeDay, 1);
    syncDayNumbers(itinerary);
    if (activeDay >= itinerary.days.length) activeDay = itinerary.days.length - 1;
    persist();
    renderDaySwitch();
    renderRouteBoard();
  });
}

function renderRouteBoard() {
  if (editMode) renderRouteBoardEdit();
  else renderRouteBoardView();
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
  updateEditControls();
  updateUndoButton();
  renderIslandSwitch();
  renderDaySwitch();
  renderRouteBoard();
  renderSpots();
}

editToggle.addEventListener("click", () => {
  editMode = !editMode;
  updateEditControls();
  renderDaySwitch();
  renderRouteBoard();
  if (editMode) {
    document.getElementById("route").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

function enterEditFromHero() {
  editMode = true;
  updateEditControls();
  renderDaySwitch();
  renderRouteBoard();
  document.getElementById("route").scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("heroEditBtn")?.addEventListener("click", enterEditFromHero);
document.getElementById("navEdit")?.addEventListener("click", (e) => {
  e.preventDefault();
  enterEditFromHero();
});

undoBtn.addEventListener("click", undo);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    e.preventDefault();
    undo();
  }
});

resetItinerary.addEventListener("click", () => {
  if (!window.confirm("恢复默认行程？你改过的内容会清掉。")) return;
  pushUndo();
  data.itineraries = normalizeItineraries(defaultItineraries);
  localStorage.removeItem(STORAGE_KEY);
  activeDay = 0;
  persist();
  renderDaySwitch();
  renderRouteBoard();
});

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.close();
});

loadSavedItineraries();
renderIslandCards();
renderTips();
renderAll();
