const fs = require("node:fs");
const path = require("node:path");

const outputPath = path.resolve(process.argv[2] || "output/pdf/diagrama-er-argos.pdf");
const previewDir = path.resolve(process.argv[3] || "tmp/pdfs");
const PAGE_WIDTH = 1190.55;
const PAGE_HEIGHT = 841.89;

const colors = {
  navy: [0.031, 0.153, 0.353],
  blue: [0.122, 0.373, 0.545],
  red: [0.541, 0.153, 0.176],
  ice: [0.863, 0.925, 0.973],
  line: [0.722, 0.796, 0.878],
  ink: [0.114, 0.173, 0.259],
  muted: [0.369, 0.435, 0.518],
  lime: [0.843, 0.937, 0],
  white: [1, 1, 1],
  page: [0.957, 0.969, 0.984],
};

const pdfEscape = (value) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const color = (value, stroke = false) => `${value.join(" ")} ${stroke ? "RG" : "rg"}`;

function addText(commands, x, y, value, size = 10, bold = false, fill = colors.ink) {
  commands.push(
    "BT",
    color(fill),
    `/${bold ? "F2" : "F1"} ${size} Tf`,
    `1 0 0 1 ${x} ${y} Tm`,
    `(${pdfEscape(value)}) Tj`,
    "ET",
  );
}

function addRect(commands, x, y, width, height, fill, stroke = null, lineWidth = 1) {
  commands.push("q", color(fill));
  if (stroke) commands.push(color(stroke, true), `${lineWidth} w`);
  commands.push(`${x} ${y} ${width} ${height} re ${stroke ? "B" : "f"}`, "Q");
}

function addLine(commands, x1, y1, x2, y2, stroke = colors.blue, lineWidth = 1.5) {
  commands.push("q", color(stroke, true), `${lineWidth} w`, `${x1} ${y1} m ${x2} ${y2} l S`, "Q");
}

function addWrappedText(commands, x, y, value, maxWidth, size = 10, lineHeight = 14, fill = colors.ink, bold = false) {
  const maxChars = Math.max(12, Math.floor(maxWidth / (size * 0.53)));
  const words = value.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);

  lines.forEach((line, index) => addText(commands, x, y - index * lineHeight, line, size, bold, fill));
  return y - lines.length * lineHeight;
}

function addHeader(commands, subtitle) {
  addRect(commands, 0, PAGE_HEIGHT - 58, PAGE_WIDTH, 58, colors.navy);
  addRect(commands, 0, PAGE_HEIGHT - 61, PAGE_WIDTH, 3, colors.lime);
  addRect(commands, 35, PAGE_HEIGHT - 45, 28, 28, colors.lime);
  addText(commands, 73, PAGE_HEIGHT - 31, "Argos", 18, true, colors.white);
  addText(commands, 73, PAGE_HEIGHT - 45, subtitle, 9, false, [0.78, 0.84, 0.91]);
}

function addFooter(commands, pageNumber, totalPages) {
  addText(commands, PAGE_WIDTH - 70, 20, `${pageNumber} / ${totalPages}`, 8, false, colors.muted);
}

function addCard(commands, x, top, width, title, fields, headerColor = colors.navy) {
  const headerHeight = 28;
  const rowHeight = 19;
  const paddingBottom = 8;
  const height = headerHeight + fields.length * rowHeight + paddingBottom;
  const bottom = top - height;

  addRect(commands, x, bottom, width, height, colors.white, colors.line, 0.8);
  addRect(commands, x, top - headerHeight, width, headerHeight, headerColor);
  addText(commands, x + 12, top - 18, title, 10.5, true, colors.white);

  fields.forEach((field, index) => {
    const rowTop = top - headerHeight - index * rowHeight;
    if (index > 0) addLine(commands, x, rowTop, x + width, rowTop, [0.88, 0.91, 0.95], 0.5);
    addText(commands, x + 12, rowTop - 13, field, 8.5, false, colors.ink);
  });

  return { x, top, width, height, bottom, centerY: top - height / 2 };
}

function addRelation(commands, leftCard, rightCard, cardinality, label) {
  const x1 = leftCard.x + leftCard.width + 8;
  const x2 = rightCard.x - 8;
  const y = Math.min(leftCard.centerY, rightCard.centerY);
  addLine(commands, x1, y, x2, y, colors.blue, 1.5);
  const center = (x1 + x2) / 2;
  addText(commands, center - cardinality.length * 3, y + 8, cardinality, 10, true, colors.navy);
  addText(commands, center - label.length * 2.4, y - 14, label, 7.5, true, colors.muted);
}

function addNote(commands, x, y, width, height, title, body) {
  addRect(commands, x, y, width, height, colors.ice, colors.line, 0.8);
  addRect(commands, x, y, 4, height, colors.blue);
  addText(commands, x + 14, y + height - 22, title, 10.5, true, colors.navy);
  addWrappedText(commands, x + 14, y + height - 40, body, width - 28, 9, 12, colors.ink);
}

function pageOne() {
  const c = [];
  addRect(c, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.page);
  addHeader(c, "Modelo lógico de información");
  addText(c, 35, 748, "Diagrama entidad-relación", 24, true, colors.navy);
  addText(c, 35, 726, "Entidades, atributos y cardinalidades requeridos para Geohashes / MAP_PAGE - Etapa 1.", 11, false, colors.muted);

  addText(c, 35, 691, "Estructura geográfica y operativa", 13, true, colors.navy);
  const city = addCard(c, 35, 671, 320, "CIUDAD_LOGISTICA", [
    "IDENTIFICADOR", "NOMBRE", "ZONA_LOGISTICA", "GEOMETRIA", "ESTADO",
    "FECHA_CREACION", "ULTIMA_MODIFICACION", "USUARIO_RESPONSABLE",
  ]);
  const divipol = addCard(c, 435, 671, 320, "DIVIPOL", [
    "ZONE_CODE", "NOMBRE", "GEOMETRIA", "ESTADO", "FECHA_CREACION", "ULTIMA_MODIFICACION",
  ]);
  const geohash = addCard(c, 835, 671, 320, "GEOHASH_MAP_PAGE", [
    "MAP_PAGE", "DESCR", "MAP_UPPER_LEFT_LONG", "MAP_UPPER_LEFT_LAT",
    "MAP_LOWER_RIGHT_LONG", "MAP_LOWER_RIGHT_LAT", "FECHA_DETECCION",
    "TIPO_CAMBIO", "ESTADO_SINCRONIZACION", "ULTIMO_INTENTO", "RESULTADO",
  ]);
  addRelation(c, city, divipol, "1 - N", "contiene");
  addRelation(c, divipol, geohash, "1 - N", "genera");

  addText(c, 35, 400, "Plantas y tiempo semilla", 13, true, colors.navy);
  const cityPlant = addCard(c, 35, 380, 320, "CIUDAD_LOGISTICA", ["IDENTIFICADOR"]);
  const plant = addCard(c, 435, 380, 320, "PLANTA", [
    "PLANT_CODE", "NOMBRE", "COORDENADAS", "ESTADO", "FECHA_CREACION", "FECHA_MODIFICACION",
  ]);
  const plantMap = addCard(c, 835, 380, 320, "PLANT_MAP_PAGE", [
    "PLANT_CODE", "TRAVEL_TIME", "FLG_OVERRIDE",
  ], colors.blue);
  addRelation(c, cityPlant, plant, "1 - N", "asocia funcionalmente");
  addRelation(c, plant, plantMap, "1 - N", "participa en");

  addNote(c, 35, 125, 545, 72, "GEOHASH_MAP_PAGE 1 - N PLANT_MAP_PAGE", "Cada MAP_PAGE contiene el detalle de las plantas aplicables y su tiempo semilla.");
  addNote(c, 610, 125, 545, 72, "Divipol no asocia plantas", "La relación funcional de plantas corresponde a Ciudad Logística; Divipol determina el ZONE_CODE.");
  addFooter(c, 1, 2);
  return c.join("\n");
}

function pageTwo() {
  const c = [];
  addRect(c, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.page);
  addHeader(c, "Sincronización y auditoría");
  addText(c, 35, 748, "Sincronización hacia Command", 18, true, colors.navy);

  const batch = addCard(c, 35, 710, 320, "LOTE_SINCRONIZACION", [
    "ID_LOTE", "INICIO", "FIN", "ESTADO", "TOTAL_PROCESADO", "EXITOSOS", "ERRORES", "PENDIENTES",
  ], colors.blue);
  const send = addCard(c, 435, 710, 320, "ENVIO_MAP_PAGE", [
    "MAP_PAGE", "FECHA_HORA_INTENTO", "ESTADO", "RESPONSE_CODE", "MESSAGE",
    "TECHNICAL", "PAYLOAD_ENVIADO", "PAYLOAD_RECIBIDO", "ENDPOINT", "CANTIDAD_REINTENTOS",
  ], colors.blue);
  const geohash = addCard(c, 835, 710, 320, "GEOHASH_MAP_PAGE", ["MAP_PAGE"]);
  addRelation(c, batch, send, "1 - N", "registra");
  addRelation(c, send, geohash, "N - 1", "corresponde a");

  addText(c, 35, 430, "Auditoría funcional", 18, true, colors.navy);
  const audit = addCard(c, 35, 400, 500, "AUDITORIA", [
    "USUARIO", "FECHA_HORA", "ENTIDAD_AFECTADA", "ACCION_REALIZADA", "VALORES_ANTES", "VALORES_DESPUES",
  ], colors.red);
  const references = addCard(c, 655, 400, 500, "REFERENCIAS FUNCIONALES (NO ES ENTIDAD)", [
    "CIUDAD_LOGISTICA", "DIVIPOL", "PLANTA / ASOCIACION", "GEOHASH_MAP_PAGE", "SINCRONIZACION / REENVIO",
  ]);
  addRelation(c, audit, references, "N - 1", "registra cambios sobre");

  addNote(c, 35, 125, 1120, 72, "Límites del modelo", "Se incluyen únicamente las entidades operativas confirmadas para esta etapa. Usuario y permisos pertenecen al Manager general de Detektor; Argos conserva la referencia requerida para trazabilidad. Los contadores del dashboard son datos calculados, no entidades.");
  addFooter(c, 2, 2);
  return c.join("\n");
}

function buildPdf(pageStreams) {
  const pageCount = pageStreams.length;
  const firstPageObject = 5;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageStreams.map((_, index) => `${firstPageObject + index * 2} 0 R`).join(" ")}] /Count ${pageCount} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  pageStreams.forEach((stream, index) => {
    const pageObject = firstPageObject + index * 2;
    const contentObject = pageObject + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n%âãÏÓ\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

const pages = [pageOne(), pageTwo()];
fs.writeFileSync(outputPath, buildPdf(pages));
fs.writeFileSync(path.join(previewDir, "diagrama-er-argos-pagina-1.pdf"), buildPdf([pages[0]]));
fs.writeFileSync(path.join(previewDir, "diagrama-er-argos-pagina-2.pdf"), buildPdf([pages[1]]));

console.log(outputPath);
