// Asegurate de tener p5.js y p5.sound.js cargados desde tu entorno
let mic, fft;
let ramas = [];
let bases = [];
const threshold = 0.05;
const colores = [
  '#e63946', '#f1fa8c', '#a8dadc', '#457b9d',
  '#ffb4a2', '#b5e48c', '#b5179e', '#ff9f1c'
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  strokeCap(ROUND);

  let centroX = width / 2;
  let centroY = height / 2;
  let angulos = [-PI / 4, -PI / 2, -3 * PI / 4];
  for (let a of angulos) {
    bases.push({
      x1: centroX,
      y1: centroY,
      x2: centroX + cos(a) * 100,
      y2: centroY + sin(a) * 100
    });
  }
}

function draw() {
  background(240, 227, 206, 10);

  stroke('#8d5524');
  strokeWeight(8);
  for (let b of bases) {
    line(b.x1, b.y1, b.x2, b.y2);
  }

  let vol = mic.getLevel();
  let spectrum = fft.analyze();
  let graves = fft.getEnergy("bass");
  let agudos = fft.getEnergy("treble");

  if (vol > threshold) {
    for (let base of bases) {
      ramas.push(new Rama(base.x2, base.y2, vol, graves, agudos));
    }
  }

  for (let i = ramas.length - 1; i >= 0; i--) {
    ramas[i].actualizar();
    ramas[i].mostrar();
    if (ramas[i].terminada()) ramas.splice(i, 1);
  }
}

class Rama {
  constructor(x, y, vol, graves, agudos) {
    this.x = x;
    this.y = y;
    this.vol = vol;
    this.graves = graves;
    this.agudos = agudos;
    this.segmentos = [];
    this.alpha = 255;
    this.crearRama();
  }

  crearRama() {
    let direccion = -PI / 2 + map(this.agudos - this.graves, -255, 255, PI / 3, -PI / 3);
    let longitud = int(map(this.vol, 0, 0.3, 5, 12));
    let x = this.x;
    let y = this.y;

    for (let i = 0; i < longitud; i++) {
      let ang = direccion + random(-PI / 6, PI / 6);
      let largo = random(15, 40);
      let x2 = x + cos(ang) * largo;
      let y2 = y + sin(ang) * largo;
      this.segmentos.push({
        x1: x,
        y1: y,
        x2: x2,
        y2: y2,
        color: random(colores),
        weight: map(this.vol, 0, 0.3, 1, 5)
      });
      x = x2;
      y = y2;
    }
  }

  actualizar() {
    this.alpha -= 3;
  }

  mostrar() {
    for (let seg of this.segmentos) {
      stroke(seg.color + hex(this.alpha, 2));
      strokeWeight(seg.weight);
      line(seg.x1, seg.y1, seg.x2, seg.y2);
    }
  }

  terminada() {
    return this.alpha <= 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}