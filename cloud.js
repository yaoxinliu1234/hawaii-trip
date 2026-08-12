(() => {
  // Free shared JSON store — no Firebase / no signup.
  // Anyone with the trip link can read & write this same copy.
  const SYNC_URL =
    window.TRIP_SYNC_URL ||
    "https://jsonbin-zeta.vercel.app/api/bins/Kp30So05gV";
  const POLL_MS = 4000;

  let ready = false;
  let applyingRemote = false;
  let saveTimer = null;
  let pollTimer = null;
  let lastRemoteUpdatedAt = "";
  let statusEl = null;

  function setStatus(text, tone = "muted") {
    statusEl = statusEl || document.getElementById("syncStatus");
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.dataset.tone = tone;
  }

  function getPayload() {
    return {
      updatedAt: new Date().toISOString(),
      itineraries: window.HAWAII_DATA.itineraries,
      tripFlights: window.HAWAII_DATA.tripFlights
    };
  }

  function isValidItineraries(itin) {
    return Boolean(
      itin &&
        typeof itin === "object" &&
        itin.all &&
        Array.isArray(itin.all.days) &&
        itin.bigIsland &&
        itin.oahu
    );
  }

  function hasMeaningfulLocal(payload) {
    if (!isValidItineraries(payload.itineraries)) return false;
    const hasLegs = payload.tripFlights?.legs?.length;
    const hasStops = Object.values(payload.itineraries || {}).some((it) =>
      (it.days || []).some((d) => (d.stops || []).length)
    );
    const hasTitles = Object.values(payload.itineraries || {}).some((it) =>
      (it.days || []).some((d) => (d.title || "").trim() || (d.theme || "").trim())
    );
    return Boolean(hasLegs || hasStops || hasTitles);
  }

  function applyPayload(payload) {
    if (!payload || !isValidItineraries(payload.itineraries)) return false;
    applyingRemote = true;
    window.HAWAII_DATA.itineraries = payload.itineraries;
    window.HAWAII_DATA.tripFlights = payload.tripFlights || { legs: [] };
    try {
      localStorage.setItem(
        window.HAWAII_STORAGE_KEY || "hawaii-trip-cloud",
        JSON.stringify({
          itineraries: payload.itineraries,
          tripFlights: payload.tripFlights || { legs: [] }
        })
      );
    } catch (_) {}
    if (typeof window.refreshTripUI === "function") {
      window.refreshTripUI();
    }
    applyingRemote = false;
    return true;
  }

  async function fetchRemote() {
    const res = await fetch(SYNC_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("GET " + res.status);
    const json = await res.json();
    return json && json.data && json.data.itineraries ? json.data : json;
  }

  async function pushRemote(payload) {
    const res = await fetch(SYNC_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("PUT " + res.status);
    lastRemoteUpdatedAt = payload.updatedAt;
  }

  async function pullOnce(opts) {
    const boot = opts && opts.boot;
    try {
      const remote = await fetchRemote();
      const remoteAt = remote && remote.updatedAt ? remote.updatedAt : "";
      const remoteValid = isValidItineraries(remote && remote.itineraries);

      if (boot && !remoteValid) {
        // Seed cloud with current local/default trip once
        await pushRemote(getPayload());
        setStatus("已自动同步 · 手机和朋友打开同一链接即可", "ok");
        return;
      }

      if (!remoteValid) {
        if (boot) setStatus("云端已就绪 · 编辑后会自动同步", "ok");
        return;
      }

      if (remoteAt && remoteAt === lastRemoteUpdatedAt) return;
      if (applyingRemote) return;

      lastRemoteUpdatedAt = remoteAt;
      applyPayload(remote);
      const t = remoteAt ? new Date(remoteAt).toLocaleString() : "";
      setStatus(t ? "已自动同步 · 更新于 " + t : "已自动同步", "ok");
    } catch (err) {
      console.error(err);
      if (boot) {
        setStatus("云端暂时连不上，本机仍可编辑", "warn");
      }
    }
  }

  function queueSave() {
    if (applyingRemote) return;
    if (!ready) return;
    setStatus("正在同步…", "muted");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const payload = getPayload();
        await pushRemote(payload);
        setStatus("已自动同步 · " + new Date().toLocaleTimeString(), "ok");
      } catch (err) {
        console.error(err);
        setStatus("同步失败（照片太大时可先少传几张）", "warn");
      }
    }, 600);
  }

  async function init() {
    setStatus("正在连接云端…", "muted");
    ready = true;
    await pullOnce({ boot: true });
    clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      pullOnce();
    }, POLL_MS);
  }

  window.TripCloud = {
    configured: function () { return true; },
    init: init,
    queueSave: queueSave,
    isApplyingRemote: function () { return applyingRemote; },
    tripId: "yaoxin-hawaii-2026"
  };
})();
