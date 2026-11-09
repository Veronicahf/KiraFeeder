const DATA_URLS = {
  json: "data.json",
  xml: "data.xml"
};

const elements = {
  petName: document.querySelector("#pet-name"),
  petAvatar: document.querySelector("#pet-avatar"),
  deviceId: document.querySelector("#device-id"),
  connectionStatus: document.querySelector("#connection-status"),
  routineCount: document.querySelector("#routine-count"),
  routineTotal: document.querySelector("#routine-total"),
  routineList: document.querySelector("#routine-list"),
  jsonOutput: document.querySelector("#json-output"),
  xmlOutput: document.querySelector("#xml-output"),
  lastUpdate: document.querySelector("#last-update"),
  syncStatus: document.querySelector("#sync-status"),
  toast: document.querySelector("#toast")
};

const formatDate = (date) => new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
}).format(date).replace(" de ", " ");

const formatTime = (time) => time || "--:--";

function getXmlValue(parent, tagName) {
  return parent.querySelector(tagName)?.textContent?.trim() || "";
}

function parseXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("El archivo XML no tiene un formato válido.");

  const device = xml.querySelector("dispositivo");
  const routines = [...xml.querySelectorAll("rutina")].map((routine) => ({
    horario: getXmlValue(routine, "horario"),
    fecha: getXmlValue(routine, "fecha"),
    hora: getXmlValue(routine, "hora"),
    porcionGramos: Number(getXmlValue(routine, "porcionGramos")),
    tipoAlimento: getXmlValue(routine, "tipoAlimento")
  }));

  return {
    dispositivo: {
      id: getXmlValue(device, "id"),
      mascota: getXmlValue(device, "mascota"),
      conexion: getXmlValue(device, "conexion")
    },
    rutinas: routines
  };
}

async function fetchData() {
  const cacheBust = `?t=${Date.now()}`;
  const [jsonResponse, xmlResponse] = await Promise.all([
    fetch(`${DATA_URLS.json}${cacheBust}`),
    fetch(`${DATA_URLS.xml}${cacheBust}`)
  ]);
  if (!jsonResponse.ok || !xmlResponse.ok) throw new Error("No se pudieron cargar los archivos de datos.");

  const jsonText = await jsonResponse.text();
  const xmlText = await xmlResponse.text();
  return {
    json: JSON.parse(jsonText),
    xml: parseXml(xmlText),
    jsonText,
    xmlText
  };
}

function renderSummary(data) {
  const device = data.json.dispositivo;
  const routines = data.json.rutinas || [];
  const isConnected = device.conexion.toLowerCase() === "conectado";

  elements.petName.textContent = device.mascota;
  elements.petAvatar.textContent = device.mascota.charAt(0).toUpperCase();
  elements.deviceId.textContent = device.id;
  elements.connectionStatus.textContent = isConnected ? "Conectado" : device.conexion;
  elements.routineCount.textContent = routines.length;
  elements.routineTotal.textContent = `${routines.length} ${routines.length === 1 ? "porción" : "porciones"}`;
}

function renderCode(data) {
  elements.jsonOutput.textContent = JSON.stringify(data.json, null, 2);
  elements.xmlOutput.textContent = data.xmlText.trim();
}

function renderRoutines(data) {
  const routines = data.json.rutinas || [];
  elements.routineList.innerHTML = routines.map((routine, index) => `
    <article class="routine-row" style="--row-index: ${index}">
      <div class="routine-time"><strong>${formatTime(routine.hora)}</strong><span>${routine.horario}</span></div>
      <div class="routine-date"><span class="label">FECHA PROGRAMADA</span><strong>${routine.fecha}</strong></div>
      <div class="food-type"><span class="food-icon ${routine.tipoAlimento.toLowerCase() === "humedo" ? "wet-food" : "dry-food"}">${routine.tipoAlimento.toLowerCase() === "humedo" ? "◒" : "✦"}</span><div><span class="label">TIPO DE ALIMENTO</span><strong>${routine.tipoAlimento}</strong></div></div>
      <div class="portion"><strong>${routine.porcionGramos}</strong><span>gramos</span></div>
      <div class="routine-state"><span>PROGRAMADA</span><i></i></div>
    </article>
  `).join("");
}

function showError(error) {
  elements.syncStatus.textContent = "ERROR DE CARGA";
  elements.routineList.innerHTML = `<div class="empty-state error-state">${error.message}</div>`;
  elements.jsonOutput.textContent = "No disponible";
  elements.xmlOutput.textContent = "No disponible";
  showToast("Revisa que el servidor esté activo y vuelve a intentar.", true);
}

let toastTimer;
function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.toggle("is-error", isError);
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

async function loadData(showMessage = false) {
  try {
    const data = await fetchData();
    renderSummary(data);
    renderCode(data);
    renderRoutines(data);
    elements.syncStatus.textContent = "SINCRONIZADO";
    elements.lastUpdate.textContent = `Actualizado ${new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    if (showMessage) showToast("JSON y XML actualizados correctamente.");
  } catch (error) {
    showError(error);
  }
}

document.querySelector("#refresh-button").addEventListener("click", () => loadData(true));
document.querySelector("#current-date").textContent = formatDate(new Date());
document.querySelector("#footer-year").textContent = new Date().getFullYear();
loadData();
setInterval(() => loadData(), 5000);
