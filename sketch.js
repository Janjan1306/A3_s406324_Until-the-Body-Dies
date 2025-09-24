let state = "intro";
let outroImg;
let scene3Ready = false;
let sceneGroup = "";
let customFont;

// Backgrounds & icons
let bg1, bg2;
let iconsImg = [];
let availableIcons = [];
let icons = [];
let iconsActivated = false;

// Scene videos
let heartbeatVid, unconsciousVid;

// Scene 2 bodies
let body1, body2;
let flickerTimer = 0;
let flickerSpeed = 0.05;
let flickerAlpha = 255;
let grayBodies2 = false;
let fading2 = false;
let fadeStart2 = 0;
let fadeProgress2 = 0;
let body2ClickCount = 0;

// Scene 1 & 2 steps
let sceneStep = 0;     // Scene1: 0=text,1=icon static,2=icon moving
let scene2Step = 0;    // Scene2: 0=text,1=bodies show,2=animation

function preload() {
  // Intro image & font
  introImg = loadImage("img/intro.png");
  outroImg = loadImage("img/outro.png");
  customFont = loadFont("font/sole-serif.otf");

  // Icons
  for (let i = 1; i <= 19; i++) {
    let num = nf(i, 2);
    iconsImg.push(loadImage(`img/Round-${num}.png`));
  }

  bg1 = loadImage("img/bg1.png");
  bg2 = loadImage("img/bg2.png");

  // Videos
  heartbeatVid = createVideo("img/heartbeat.mp4");
  unconsciousVid = createVideo("img/unconscious.mp4");

  // Bodies
  body1 = loadImage("img/body1.png");
  body2 = loadImage("img/body2.png");
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  cnv.style('cursor', 'url("img/cursor-25.png"), auto'); 
  availableIcons = [...iconsImg];

  heartbeatVid.hide();
  unconsciousVid.hide();
}

function draw() {
  background(0);

  if (state === "intro") drawIntro();
  else if (sceneGroup === "scene1") drawScene1();
  else if (sceneGroup === "scene2") drawScene2();
  else if (sceneGroup === "scene3") drawScene3();
  else if (state === "outro") drawOutro();
}

// ----------------- INTRO -----------------
function drawIntro() {
  imageMode(CENTER);
  let imgW = width;
  let scale = imgW / introImg.width;
  let imgH = introImg.height * scale;
  image(introImg, width / 2, height / 2, imgW, imgH);

  // Text
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
  text("Press 's' to start", width / 2, height - 60);
}

// ----------------- SCENE 1 -----------------
function drawScene1() {
  imageMode(CORNER);
  image(bg1, 0, 0, width, height);
  imageMode(CENTER);

  // ---------------- STEP 0: TEXT ----------------
  if (sceneStep === 0) {
    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);

    let lines = [
      "You wake up, but not in your world.",
      "You are trapped inside a body that does not move, does not speak, does not answer.",
      "This is not a dream. There’s no way back."
    ];
    let startY = height / 2 - (lines.length - 1) * 20;
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], width / 2, startY + i * 40);
    }

    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    text("Press 'c' to continue", width / 2, height - 60);
    return;
  }

  // ---------------- STEP 1 & 2: ICONS ----------------
  if (sceneStep === 1 || sceneStep === 2) {
    for (let ic of icons) {
      let pulse = sin(ic.t) * ic.range;
      let currentSize = ic.baseSize + pulse;

      if (sceneStep === 2) {
        ic.alphaT += ic.alphaSpeed;
        let randomAlpha = ic.alphaBase + sin(ic.alphaT) * ic.alphaRange;
        ic.alpha = lerp(ic.alpha, randomAlpha, 0.02);

        ic.x += ic.vx;
        ic.y += ic.vy;

        if (ic.x < 30 || ic.x > width - 30) ic.vx *= -1;
        if (ic.y < 30 || ic.y > height - 30) ic.vy *= -1;
        tint(255, ic.alpha);
      } else {
        tint(255, 255);
      }

      image(ic.img, ic.x, ic.y, currentSize, currentSize);
      ic.t += ic.speed;
    }

    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));

    if (sceneStep === 1) text("Click to activate and Press 'c' to continue", width / 2, height - 60);
    if (sceneStep === 2) text("Press 'c' to gather icons", width / 2, height - 60);

    noTint();
    return;
  }

  // ---------------- STEP 3: Gather at center ----------------
  if (sceneStep === 3) {
    let targetSize = 300; 
    for (let ic of icons) {
      ic.x = lerp(ic.x, width / 2, 0.05);
      ic.y = lerp(ic.y, height / 2, 0.05);

      let pulse = sin(ic.t) * ic.range;
      let currentSize = lerp(ic.baseSize + pulse, targetSize, 0.05);

      image(ic.img, ic.x, ic.y, currentSize, currentSize);
      ic.t += ic.speed;
    }

    // All icons gather at center →  Scene2
    let allCentered = icons.every(ic => dist(ic.x, ic.y, width / 2, height / 2) < 2);
    if (allCentered) {
      sceneGroup = "scene2";
      scene2Step = 0;
      heartbeatVid.loop();
    }

    // Overlay text nhấp nháy
    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    text("Icons gathering...", width / 2, height - 60);
  }
}

// ----------------- SCENE 2 -----------------
function drawScene2() {
  background(0);
  imageMode(CENTER);

  // Scale body images
  let scaleH = height * 0.5;
  let body1W = body1.width * (scaleH / body1.height);
  let body1H = scaleH;
  let body2W = body2.width * (scaleH / body2.height);
  let body2H = scaleH;

  // ---------------- STEP 0: text dài ----------------
  if (scene2Step === 0) {
    // vẽ video full
    image(heartbeatVid, width / 2, height / 2, width, height);

    // chữ dài overlay
    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    let lines = [
      "I am here. I can feel. But they can’t hear me.",
      "If this body dies, I die with it."
    ];
    let startY = height / 2 - (lines.length - 1) * 20;
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], width / 2, startY + i * 40);
    }

    // nhấp nháy "Press 'c' to continue"
    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    text("Press 'c' to continue", width / 2, height - 60);

    return;
  }

  // ---------------- STEP 1: show bodies + click ----------------
  if (scene2Step === 1) {
    image(heartbeatVid, width / 2, height / 2, width, height);

    noTint();
    image(body2, width / 2, height / 2, body2W, body2H);
    image(body1, width / 2, height / 2, body1W, body1H);

    // nhấp nháy "Click to activate"
    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    text("Click to activate", width / 2, height - 60);

    return;
  }

  // ---------------- STEP 2: body animation + nhấn C ----------------
  if (scene2Step === 2) {
    image(heartbeatVid, width / 2, height / 2, width, height);

    // Body2 flicker/fade animation
    if (!grayBodies2 && !fading2) {
      flickerTimer += flickerSpeed;
      flickerAlpha = map(sin(flickerTimer), -1, 1, 100, 255);
      tint(255, flickerAlpha);
    } else if (fading2) {
      let elapsed = millis() - fadeStart2;
      fadeProgress2 = constrain(elapsed / 2000, 0, 1);
      let col = lerpColor(color(255), color(150), fadeProgress2);
      tint(col);
      if (fadeProgress2 >= 1) {
        fading2 = false;
        grayBodies2 = true;
      }
    } else if (grayBodies2) {
      tint(150);
    }
    image(body2, width / 2, height / 2, body2W, body2H);

    // Body1 đồng bộ
    if (!grayBodies2 && !fading2) {
      noTint();
    } else if (fading2) {
      let elapsed = millis() - fadeStart2;
      fadeProgress2 = constrain(elapsed / 2000, 0, 1);
      let col = lerpColor(color(255), color(150), fadeProgress2);
      tint(col);
    } else if (grayBodies2) {
      tint(150);
    }
    image(body1, width / 2, height / 2, body1W, body1H);

    // nhấp nháy "Press 'c' to continue"
    textFont(customFont);
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
    text("Press 'c' to continue", width / 2, height - 60);

    noTint();
  }
}


// ----------------- SCENE 3 -----------------
let stopped3 = false;
function drawScene3() {
  imageMode(CENTER);
  background(0);

  if (!stopped3) unconsciousVid.loop();
  image(unconsciousVid, width / 2, height / 2, width, height);

  // Overlay chữ dài
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  
  let lines = [
    "The heart stopped.",
    "The body is gone.",
    "You are gone too.",
    "Until the body dies, you remain.",
    "And now… nothing remains."
  ];
  let startY = height / 2 - (lines.length - 1) * 20;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, startY + i * 40);
  }

  // Nhấp nháy "Press 'c' to continue"
  textSize(28);
  fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
  text("Press 'c' to continue", width / 2, height - 60);

  scene3Ready = true;
}

// ----------------- OUTRO -----------------
function drawOutro() {
  imageMode(CORNER);
  image(outroImg, 0, 0, width, height);

  // chữ nhấp nháy "Press 'E' to exit"
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 255));
  text("Press 'e' to exit", width / 2, height - 60);

}

// ----------------- INTERACTIONS -----------------
function keyPressed() {
  // --- Intro → Scene1 ---
  if (state === "intro" && key.toLowerCase() === "s") {
    state = "";
    sceneGroup = "scene1";
    sceneStep = 0;
    iconsActivated = false;
  }

  // --- Scene1 interactions ---
  if (sceneGroup === "scene1" && key.toLowerCase() === "c") {
    if (sceneStep === 0) {
      sceneStep = 1; // text → icon static
      iconsActivated = true;
    } else if (sceneStep === 1) {
      sceneStep = 2; // icon static → icon moving
    } else if (sceneStep === 2) {
      sceneStep = 3; // icon moving → gather center
    }
  }

  // --- Scene2 interactions ---
  if (sceneGroup === "scene2") {
    if (scene2Step === 0 && key.toLowerCase() === "c") {
      scene2Step = 1; // text dài → show bodies
    } else if (scene2Step === 1 && key.toLowerCase() === "c") {
      fading2 = true;
      fadeStart2 = millis();
      scene2Step = 2; // show bodies → body animation
    } else if (scene2Step === 2 && key.toLowerCase() === "c") {
      sceneGroup = "scene3"; // body animation → Scene3
      stopped3 = false;
      scene3Ready = false; // 
      unconsciousVid.loop();
    }
  }

  // --- Scene3 → Outro ---
  if (sceneGroup === "scene3" && scene3Ready && key.toLowerCase() === "c") {
    sceneGroup = "";
    state = "outro";
    stopped3 = true; 
  }

  // --- Outro → Intro ---
  if (state === "outro" && key.toLowerCase() === "e") {
    state = "intro";
    sceneGroup = "";
    sceneStep = 0;
    scene2Step = 0;
    icons = [];
    availableIcons = [...iconsImg];
    grayBodies2 = false;
    fading2 = false;
    body2ClickCount = 0;
  }
}




function mousePressed() {
  // Scene1: click to create icons
  if (sceneGroup === "scene1" && iconsActivated && availableIcons.length > 0) {
    let i = floor(random(availableIcons.length));
    let img = availableIcons.splice(i, 1)[0];
    icons.push({
      x: mouseX,
      y: mouseY,
      img: img,
      vx: random(-1.5, 1.5),
      vy: random(-1.5, 1.5),
      baseSize: random(150, 250),
      range: random(15, 25),
      t: random(TWO_PI),
      speed: random(0.05, 0.1),
      alpha: 255,
      alphaBase: 150,
      alphaRange: 100,
      alphaSpeed: 0.02,
      alphaT: random(TWO_PI)
    });
  }

  // Scene2: click body2 to activate animation
  if (sceneGroup === "scene2" && scene2Step === 1) {
    body2ClickCount++;
    if (body2ClickCount >= 4) {
      fading2 = true;
      fadeStart2 = millis();
      scene2Step = 2;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
