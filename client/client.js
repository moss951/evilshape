const canvas = document.getElementById("game");
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

document.getElementById("play").addEventListener("click", () => {
    document.getElementById("play").disabled = true;
    let username = document.getElementById("username").value;
    socket.emit("join", { username });
    joinLobby();
});

function joinLobby() {
    document.getElementById("ready").addEventListener("click", () => {
        document.getElementById("ready").disabled = true;
        ready = true;
        socket.emit("ready");
    });
}

function draw() {
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
        cursorParticles[i].draw(usernames[i]);
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

socket.on('initGame', (gameData) => {
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

    socket.emit("cursorResetPosRequest", { x:playerParticle.x, y:playerParticle.y });
    canvas.requestPointerLock();
    drawIntervalId = setInterval(draw, 1000 / 60);

    document.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement == canvas) {
            socket.emit("cursorMoveRequest", { x:e.movementX, y:e.movementY });
        }
    });

    document.addEventListener("mousedown", (e) => {
        if (document.pointerLockElement != canvas) {
            socket.emit("cursorResetPosRequest", { x:e.clientX + scrollOffset.x, y:e.clientY + scrollOffset.y });
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
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        cursorParticles[i].x = gameData.cursorParticles[i].x;
        cursorParticles[i].y = gameData.cursorParticles[i].y;
    }
});

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