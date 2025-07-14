const canvas = document.getElementById("game");
const bounds = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");
const socket = io();

const PARTICLES_ALONG_EDGE = 2;
let ready = false;

const players = {};
const usernames = [];
const particles = [];
const springs = [];
const cursorParticles = [];
const level = new LevelClient([]);
const scrollOffset = { x:0, y:0 };

let playerParticle, playerCursorParticle;
let drawIntervalId;

// lower resolution canvas
const scaleFactor = 2;
canvas.width = canvas.clientWidth / scaleFactor;
canvas.height = canvas.clientHeight / scaleFactor;
ctx.scale(1 / scaleFactor, 1 / scaleFactor);

// main menu stuff
let cursorInputTimer = 0;
let username = "";
let playButton = new Button(300, 400, 200, 50, "play");

// lobby stuff
let readyButton = new Button(300, 400, 200, 50, "ready");

initMainMenu();

function initMainMenu() {
    drawIntervalId = setInterval(drawMainMenu, 1000 / 60);
    document.addEventListener("keydown", typeUsername);
    document.addEventListener("mousedown", mainMenuMouseDown);
    document.addEventListener("mouseup", mainMenuMouseUp);
}

function typeUsername(e) {
    if (e.key == "Backspace") {
        username = username.slice(0, username.length - 1);
    }
    else {
        if (e.key.length == 1) username += e.key;
    }
}

function mainMenuMouseDown(e) {
    if (playButton.isClicked(e.clientX - bounds.left, e.clientY - bounds.top)) {}
}

function mainMenuMouseUp() {
    playButton.clicked = false;

    if (username.length > 0) {
        socket.emit("join", { username });
        document.removeEventListener("keydown", typeUsername);
        document.removeEventListener("mousedown", mainMenuMouseDown);
        document.removeEventListener("mouseup", mainMenuMouseUp);
        clearInterval(drawIntervalId);
        initLobby();
    }
}

function drawMainMenu() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawGrid();

    ctx.font ="128px DS-BIOS";
    ctx.fillStyle = "black";
    ctx.fillText("EVIL SHAPE", canvas.clientWidth / 2 - ctx.measureText("EVIL SHAPE").width / 2, canvas.clientHeight / 3);
    playButton.draw();

    // username input
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.rect(150, 300, 500, 50);
        ctx.stroke();
    }

    cursorInputTimer++;
    if (cursorInputTimer >= 24) {
        ctx.beginPath();
        ctx.rect(150 + 5 + ctx.measureText(username).width, 300 + 5, 2, 50 - 10);
        ctx.fill();
    }
    if (cursorInputTimer >= 48) cursorInputTimer = 0;
    ctx.fillText(username, 150 + 5, 300 + 38);
}

// lobby stuff

function initLobby() {
    drawIntervalId = setInterval(drawLobby, 1000 / 60);

    document.addEventListener("mousedown", lobbyMouseDown);
    document.addEventListener("mouseup", lobbyMouseUp);
}

function lobbyMouseDown(e) {
    if (readyButton.isClicked(e.clientX - bounds.left, e.clientY - bounds.top)) {
        ready = true;
        socket.emit("ready");
    }
}

function lobbyMouseUp() {
    readyButton.clicked = false;
}

function drawLobby() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawGrid();

    ctx.fillStyle = "black";
    ctx.font = "64px DS-BIOS";
    ctx.fillText("Players", 50, ctx.measureText("Players").actualBoundingBoxAscent + ctx.measureText("Players").actualBoundingBoxDescent + 50);

    ctx.font = "48px DS-BIOS";
    let i = 0;
    for (let id in players) {
        ctx.fillStyle = "black";
        ctx.fillText(players[id].username + (players[id].ready ? " - ready" : ""), 50, ctx.measureText(players[id].username).actualBoundingBoxAscent + ctx.measureText(players[id].username).actualBoundingBoxDescent + 48 * i + 64 + 50);
        i++;
    }

    readyButton.draw();
}

function updateScollOffset() {
    if (playerParticle.x > canvas.clientWidth / 2 + scrollOffset.x) {
        let overflow = playerParticle.x - (canvas.clientWidth / 2 + scrollOffset.x);
        scrollOffset.x += overflow;
        ctx.translate(-overflow, 0);
    }
    else if (playerParticle.x < canvas.clientWidth / 4 + scrollOffset.x) {
        let overflow = (canvas.clientWidth / 4 + scrollOffset.x) - playerParticle.x;
        scrollOffset.x -= overflow;
        ctx.translate(overflow, 0);
    }

    if (playerParticle.y > canvas.clientHeight - 50 + scrollOffset.y) {
        let overflow = playerParticle.y - (canvas.clientHeight - 50 + scrollOffset.y);
        scrollOffset.y += overflow;
        ctx.translate(0, -overflow);
    }
    else if (playerParticle.y < 50 + scrollOffset.y) {
        let overflow = (50 + scrollOffset.y) - playerParticle.y;
        scrollOffset.y -= overflow;
        ctx.translate(0, overflow);
    }
}

function drawGrid() {
    let gridSize = 50;

    let minX = -ctx.getTransform().e * 2;
    let minY = -ctx.getTransform().f * 2;

    let maxX = minX + canvas.clientWidth * 2;
    let maxY = minY + canvas.clientHeight * 2;

    let startX = Math.floor(minX / gridSize) * gridSize;
    let startY = Math.floor(minY / gridSize) * gridSize;

    ctx.save();
    
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1;

    for (let x = startX; x < maxX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
    }

    for (let y = startY; y < maxY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
        ctx.stroke();
    }

    ctx.restore();
}

function drawGame() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.restore();

    drawGrid();
    level.draw();

    for (let i = 0; i < particles.length / PARTICLES_ALONG_EDGE; i++) {
        particles[i * PARTICLES_ALONG_EDGE].draw(usernames[i]);
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        cursorParticles[i].draw(usernames[i], particles[i * PARTICLES_ALONG_EDGE].currentBoostTime);
    }

    for (let i = 0; i < springs.length; i++) {
        springs[i].draw();
    }

    // scroll
    let previousScrollOffset = { ...scrollOffset };
    updateScollOffset()
    socket.emit("cursorMoveRequest", { x:scrollOffset.x - previousScrollOffset.x, y:scrollOffset.y - previousScrollOffset.y});
}

socket.on('updatePlayerList', (serverPlayers) => {
    let playersFound = {};

    for (let id in serverPlayers) {
        if (players[id] == undefined) {
            players[id] = new PlayerClient(serverPlayers[id].username, serverPlayers[id].ready);
        }
        
        playersFound[id] = true;
    }

    for (let id in players) {
        if (!playersFound[id]) delete players[id];
    }
});

socket.on('updatePlayerReady', (playerData) => {
    players[playerData.id].ready = playerData.ready;
});

socket.on('initGame', (gameData) => {
    clearInterval(drawIntervalId);
    document.removeEventListener("mousedown", lobbyMouseDown);
    document.removeEventListener("mouseup", lobbyMouseUp);

    for (let id in gameData.players) {
        players[id].particleIndex = gameData.players[id].particleIndex;
        players[id].cursorParticleIndex = gameData.players[id].cursorParticleIndex;
    }

    // make particles
    for (let i = 0; i < gameData.particles.length; i++) {
        particles.push(new ParticleClient(gameData.particles[i].x, gameData.particles[i].y, gameData.particles[i].isPlayer));
    }

    for (let i = 0; i < gameData.cursorParticles.length; i++) {
        cursorParticles.push(new CursorParticleClient(gameData.cursorParticles[i].x, gameData.cursorParticles[i].y, gameData.cursorParticles[i].attractionRadius));
    }

    playerParticle = particles[players[socket.id].particleIndex];
    playerCursorParticle = cursorParticles[players[socket.id].cursorParticleIndex];

    // make springs
    for (let i = 0; i < gameData.springs.length; i++) {
        let particle1, particle2;
        for (let j = 0; j < particles.length; j++) {
            if (gameData.springs[i].particle1.x == particles[j].x && gameData.springs[i].particle1.y == particles[j].y) {
                particle1 = particles[j];
            }

            if (gameData.springs[i].particle2.x == particles[j].x && gameData.springs[i].particle2.y == particles[j].y) {
                particle2 = particles[j];
            }
        }
        springs.push(new SpringClient(particle1, particle2));
    }

    // load level
    for (let i = 0; i < gameData.walls.length; i++) {
        level.walls.push(new RectClient(gameData.walls[i].x, gameData.walls[i].y, gameData.walls[i].w, gameData.walls[i].h));
    }

    // get usernames from dictionary in array
    for (let i = 0; i < particles.length; i++) {
        for (let id in players) {
            if (i == players[id].particleIndex) {
                usernames.push(players[id].username);
                continue;
            }
        }
    }

    // init cursor pos
    socket.emit("cursorResetPosRequest", { x:playerParticle.x, y:playerParticle.y });
    canvas.requestPointerLock();

    // start game and inputs
    drawIntervalId = setInterval(drawGame, 1000 / 60);

    document.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement == canvas) {
            socket.emit("cursorMoveRequest", { x:e.movementX, y:e.movementY });
        }
    });

    document.addEventListener("mousedown", (e) => {
        if (document.pointerLockElement != canvas) {
            socket.emit("cursorResetPosRequest", { x:e.clientX - bounds.left + scrollOffset.x, y:e.clientY - bounds.top + scrollOffset.y });
            canvas.requestPointerLock();
        }

        socket.emit("cursorBoostStartRequest");
    });

    document.addEventListener("mouseup", () => {
        socket.emit("cursorBoostStopRequest");
    });

    document.addEventListener("focus", () => {
        updateScollOffset();
    });

    // debug controls
    document.addEventListener("keydown", (e) => {
        if (e.key == "s") ctx.translate(0, -25);
        if (e.key == "w") ctx.translate(0, 25);
        if (e.key == "d") ctx.translate(-25, 0);
        if (e.key == "a") ctx.translate(25, 0);
    });
});

socket.on('updateGame', (gameData) => {
    // update particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].x = gameData.particles[i].x;
        particles[i].y = gameData.particles[i].y;
        particles[i].currentBoostTime = gameData.particles[i].currentBoostTime;
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        cursorParticles[i].x = gameData.cursorParticles[i].x;
        cursorParticles[i].y = gameData.cursorParticles[i].y;
    }
});