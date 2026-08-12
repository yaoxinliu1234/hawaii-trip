(() => {
  const TRIP_ID = window.TRIP_CLOUD_ID || "yaoxin-hawaii-2026";
  let db = null;
  let ready = false;
  let applyingRemote = false;
  let saveTimer = null;
  let statusEl = null;

  function configured() {
    const c = window.FIREBASE_CONFIG || {};
    return Boolean(c.apiKey && c.databaseURL && c.projectId);
  }

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

  function applyPayload(payload) {
    if (!payload || !payload.itineraries) return false;
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

  function init() {
    if (!configured()) {
      setStatus("仅保存在本机 · 手机/朋友看不到。请导出，或配置云端同步。", "warn");
      return;
    }
    if (!window.firebase) {
      setStatus("云端脚本未加载", "warn");
      return;
    }
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.database();
      ready = true;
      setStatus("云端同步已连接…", "ok");

      const ref = db.ref(`trips/${TRIP_ID}`);
      ref.on("value", (snap) => {
        const val = snap.val();
        if (!val) {
          setStatus("云端还是空的，保存后会同步给朋友", "muted");
          // push local up if we have something
          const local = getPayload();
          const hasLegs = local.tripFlights?.legs?.length;
          const hasStops = Object.values(local.itineraries || {}).some((it) =>
            (it.days || []).some((d) => (d.stops || []).length)
          );
          if (hasLegs || hasStops) {
            ref.set(local);
            setStatus("已上传本机行程到云端", "ok");
          }
          return;
        }
        applyPayload(val);
        const t = val.updatedAt ? new Date(val.updatedAt).toLocaleString() : "";
        setStatus(t ? `云端已同步 · 更新于 ${t}` : "云端已同步", "ok");
      });
    } catch (err) {
      console.error(err);
      setStatus("云端连接失败，请检查 firebase-config.js", "warn");
    }
  }

  function queueSave() {
    if (applyingRemote) return;
    if (!ready || !db) {
      setStatus("仅保存在本机 · 配置云端后可跨设备同步", "warn");
      return;
    }
    setStatus("正在同步到云端…", "muted");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      db.ref(`trips/${TRIP_ID}`)
        .set(getPayload())
        .then(() => setStatus(`云端已保存 · ${new Date().toLocaleTimeString()}`, "ok"))
        .catch((err) => {
          console.error(err);
          setStatus("云端保存失败（可能超过大小限制，少传几张大图）", "warn");
        });
    }, 500);
  }

  window.TripCloud = {
    configured,
    init,
    queueSave,
    isApplyingRemote: () => applyingRemote,
    tripId: TRIP_ID
  };
})();
