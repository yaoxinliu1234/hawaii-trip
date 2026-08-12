(() => {
  // Prefer same-origin on Vercel; GitHub Pages uses the Vercel API (CORS enabled).
  const SYNC_URL =
    window.TRIP_SYNC_URL ||
    (typeof location !== "undefined" && /vercel\.app$|localhost|127\.0\.0\.1/.test(location.hostname)
      ? "/api/trip"
      : "https://web-zeta-eight-yq01f1vb2z.vercel.app/api/trip");
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

  function normalizeShape(itin) {
    if (!itin || typeof itin !== "object") return itin;
    // Older builds used "all"; current app uses "trip"
    if (itin.all && !itin.trip) {
      const copy = Object.assign({}, itin);
      copy.trip = copy.all;
      delete copy.all;
      return copy;
    }
    return itin;
  }

  function isValidItineraries(itin) {
    const shaped = normalizeShape(itin);
    return Boolean(
      shaped &&
        typeof shaped === "object" &&
        shaped.trip &&
        Array.isArray(shaped.trip.days) &&
        shaped.bigIsland &&
        shaped.oahu
    );
  }

  function scorePayload(payload) {
    if (!payload || !isValidItineraries(payload.itineraries)) return 0;
    const itin = normalizeShape(payload.itineraries);
    let score = 0;
    score += (payload.tripFlights && payload.tripFlights.legs && payload.tripFlights.legs.length) || 0;
    Object.values(itin).forEach(function (it) {
      (it.days || []).forEach(function (d) {
        if ((d.title || "").trim() && d.title !== "Day " + d.day) score += 1;
        if ((d.theme || "").trim()) score += 1;
        (d.stops || []).forEach(function (s) {
          score += 2;
          if ((s.content || "").trim()) score += 2;
          if ((s.notes || "").trim()) score += 1;
          if (s.image) score += 3;
        });
      });
    });
    return score;
  }

  function applyPayload(payload) {
    if (!payload || !isValidItineraries(payload.itineraries)) return false;
    applyingRemote = true;
    const itin = normalizeShape(payload.itineraries);
    window.HAWAII_DATA.itineraries = itin;
    window.HAWAII_DATA.tripFlights = payload.tripFlights || { legs: [] };
    try {
      localStorage.setItem(
        window.HAWAII_STORAGE_KEY || "hawaii-trip-cloud",
        JSON.stringify({
          itineraries: itin,
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
      const local = getPayload();
      const localScore = scorePayload(local);
      const remoteScore = remoteValid ? scorePayload(remote) : 0;

      if (boot) {
        // Prefer the richer copy so empty phones don't wipe the computer trip.
        if (remoteValid && remoteScore >= localScore && remoteScore > 0) {
          lastRemoteUpdatedAt = remoteAt;
          applyPayload(remote);
          setStatus("已自动同步 · 已从云端加载", "ok");
          return;
        }
        if (localScore > 0 && localScore > remoteScore) {
          await pushRemote(local);
          setStatus("已自动同步 · 已上传本机行程", "ok");
          return;
        }
        if (remoteValid) {
          lastRemoteUpdatedAt = remoteAt;
          applyPayload(remote);
          setStatus("已自动同步", "ok");
          return;
        }
        await pushRemote(local);
        setStatus("已自动同步 · 手机和朋友打开同一链接即可", "ok");
        return;
      }

      if (!remoteValid) return;
      if (remoteAt && remoteAt === lastRemoteUpdatedAt) return;
      if (applyingRemote) return;

      // Don't clobber a richer local edit with a poorer remote snapshot
      if (scorePayload(getPayload()) > remoteScore + 2) return;

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

  async function forceUpload() {
    if (!ready) return;
    setStatus("正在强制上传本机…", "muted");
    try {
      await pushRemote(getPayload());
      setStatus("已上传本机 · 手机刷新即可看到", "ok");
    } catch (err) {
      console.error(err);
      setStatus("上传失败，请再试一次", "warn");
    }
  }

  async function init() {
    setStatus("正在连接云端…", "muted");
    ready = true;
    await pullOnce({ boot: true });
    clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      pullOnce();
    }, POLL_MS);

    const btn = document.getElementById("forceSyncBtn");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.addEventListener("click", forceUpload);
    }
  }

  window.TripCloud = {
    configured: function () { return true; },
    init: init,
    queueSave: queueSave,
    forceUpload: forceUpload,
    isApplyingRemote: function () { return applyingRemote; },
    tripId: "yaoxin-hawaii-2026"
  };
})();
