const express = require("express");
const path = require("path");
const http = require("http");
const {Server} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve("")));
app.get("/", (req, res) => {
    return res.sendFile("index.html")
});

const PlayerServer = require('./playerServer');
const ParticleServer = require('./particleServer');
const SpringServer = require('./springServer');
const CursorParticleServer = require('./cursorParticleServer');
const ShapeServer = require('./shapeServer');
const RectServer = require('./rectServer');
const LevelServer = require('./levelServer');
const FloorServer = require('./floorServer');
const CircleServer = require('./circleServer');
const FlagServer = require('./flagServer');

const toxi = require('toxiclibsjs');
const physics = new toxi.physics2d.VerletPhysics2D();
const gravity = new toxi.physics2d.behaviors.GravityBehavior(new toxi.geom.Vec2D(0, 0.25));
physics.addBehavior(gravity);

const PARTICLES_ALONG_EDGE = 2;
let numPlayers = 0;
let numInGamePlayers = 0;
let cursorParticleNormalStrength;
let cursorParticleBoostStrength;
const maxBoostTime = 10;
const gameSpeed = 0.01;

let lobbyPlayers = {};
let players = {};
let particles = [];
let cursorParticles = [];
let springs = [];

let clientParticles = []
let clientCursorParticles = [];
let clientSprings = [];

let inGame = false;
let hasWon = false;
let levelIndex = 0;
let levels = [
    new LevelServer(
        { x:150, y:400 },
        [
            new RectServer(0, 550, 1200, 50),
            new RectServer(0, -1500, 50, 2050),

            new RectServer(200, 500, 50, 50),
            new RectServer(400, 150, 50, 300),
            new RectServer(550, 100, 50, 450),
            new RectServer(700, 50, 50, 400),
            new RectServer(350, 150, 50, 50),

            new RectServer(800, 50, 50, 50),
            new RectServer(950, -50, 50, 50),
            new RectServer(750, -150, 50, 50),
            new RectServer(1150, -1500, 50, 2050),

            new RectServer(400, -150, 150, 50),
            new FloorServer(450, 450, 100),
            new FloorServer(450, 300, 100),
            new FloorServer(600, 450, 100),
            new FloorServer(600, 350, 100),
            new FloorServer(600, 250, 100),
            new FloorServer(600, 150, 100),

            new FloorServer(150, -150, 100),
            new FloorServer(200, -300, 50),
            new FloorServer(200, -450, 50),

            new RectServer(250, -500, 100, 100),
            new RectServer(500, -600, 500, 50),

            new RectServer(650, -700, 50, 50),
            new RectServer(750, -700, 50, 50),
            new RectServer(850, -700, 50, 50),
            new RectServer(600, -800, 50, 50),
            new RectServer(700, -800, 50, 50),
            new RectServer(800, -800, 50, 50),
            new RectServer(900, -800, 50, 50),
            new RectServer(550, -900, 50, 50),
            new RectServer(650, -900, 50, 50),
            new RectServer(750, -900, 50, 50),
            new RectServer(850, -900, 300, 50),
        ],
        new FlagServer(1100, -950)
        // new FlagServer(200, 500)
    ),
    new LevelServer(
        { x:150, y:400 },
        [ 
            new RectServer(0, 550, 1200, 50),
        ],
        new FlagServer(300, 500)
    ),
];

let loopId = setInterval(lobbyLoop, 1000 / 60);

server.listen(3000, () => {
    console.log("started listening on port 3000");
});

io.on("connection", (socket) => {
    socket.on("join", (newPlayerData) => {
        console.log(socket.id  + " connected");

        lobbyPlayers[socket.id] = new PlayerServer(newPlayerData.username, false, "hsla(180,100%,50%,0.1)");
        numPlayers++;

        if (!inGame) io.emit('updatePlayerList', lobbyPlayers);
    });

    socket.on('disconnect', () => {
        if (lobbyPlayers[socket.id] != undefined) {
            console.log(socket.id + " disconnected");

            if (players[socket.id] != undefined && inGame) numInGamePlayers--;

            delete lobbyPlayers[socket.id];
            numPlayers--;

            io.emit('updatePlayerList', lobbyPlayers);
        }
    });

    socket.on("ready", (ready) => {
        console.log(socket.id + " readied");
        lobbyPlayers[socket.id].ready = ready;
        if (!inGame) io.emit('updatePlayerReady', { id:socket.id, ready:lobbyPlayers[socket.id].ready });
    });

    socket.on("lobbyPlayerListRequest", () => {
        console.log(socket.id + " requested lobby player list");
        socket.emit("updatePlayerList", lobbyPlayers);
    });

    socket.on("gameStateRequest", () => {
        // console.log(socket.id + " requested game state");
        socket.emit("updateGameState", inGame);
    });

    socket.on("cursorMoveRequest", (cursorPos) => {
        if (players[socket.id] != undefined) {
            cursorParticles[players[socket.id].cursorParticleIndex].x += cursorPos.x;
            cursorParticles[players[socket.id].cursorParticleIndex].y += cursorPos.y;
        }
    });
    
    socket.on("cursorResetPosRequest", (cursorPos) => {
        if (players[socket.id] != undefined) {
            cursorParticles[players[socket.id].cursorParticleIndex].x = cursorPos.x;
            cursorParticles[players[socket.id].cursorParticleIndex].y = cursorPos.y;
        }
    });

    socket.on("cursorBoostStartRequest", () => {
        if (players[socket.id] == undefined) return;
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleBoostStrength;
    });

    socket.on("cursorBoostStopRequest", () => {
        if (players[socket.id] == undefined) return;
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleNormalStrength;
        particles[players[socket.id].particleIndex].currentBoostTime = 0;
    });

    socket.on("levelRequest", () => {
        io.emit("updateSelectedLevel", levelIndex);
    });

    socket.on("levelChangeRequest", (index) => {
        console.log("level " + index + " selected");
        levelIndex = index;
        io.emit("updateSelectedLevel", levelIndex);
    });

    socket.on("colorChangeRequest", (newColor) => {
        if (lobbyPlayers[socket.id] == undefined) return;
        lobbyPlayers[socket.id].color = "hsla(" + newColor + ",100%,50%,0.1)";
    });
});

function getPolygonVertexCoords(numParticles, centerX, centerY, radiusX, radiusY) {
    const angle = 2 * Math.PI / numParticles;
    let vertexCoords = [];
    for (let i = 0; i < numParticles; i++) {
        vertexCoords.push({ x:centerX + radiusX * Math.sin(i * angle), y:centerY + radiusY * Math.cos(i * angle) });
    }
    return vertexCoords;
}

function returnLobby() {
    players = {};
    particles = [];
    cursorParticles = [];
    springs = [];

    clientParticles = []
    clientCursorParticles = [];
    clientSprings = [];

    inGame = false;
    hasWon = false;

    for (let id in lobbyPlayers) {
        lobbyPlayers[id].ready = false;
    }
    io.emit('updatePlayerList', lobbyPlayers);

    clearInterval(loopId);
    loopId = setInterval(lobbyLoop, 1000 / 60);
}

function lobbyLoop() {
    if (numPlayers == 0) return;
    for (let id in lobbyPlayers) {
        if (lobbyPlayers[id] != undefined && !lobbyPlayers[id].ready) return;
    }

    clearInterval(loopId);
    console.log("game start");
    inGame = true;
    numInGamePlayers = numPlayers;

    // make colors
    let colors = [];
    for (let id in lobbyPlayers) {
        colors.push(lobbyPlayers[id].color);
    }

    // make players
    for (let id in lobbyPlayers) {
        lobbyPlayers[id].ready = false;
        players[id] = new PlayerServer(lobbyPlayers[id].username, true, lobbyPlayers[id].color);
    }

    // make particles
    const particleCoords = getPolygonVertexCoords(numInGamePlayers * PARTICLES_ALONG_EDGE, levels[levelIndex].spawnPos.x, levels[levelIndex].spawnPos.y, 50, 50);
    for (let i = 0; i < particleCoords.length; i++) {
        particles.push(new ParticleServer(particleCoords[i].x, particleCoords[i].y, physics, i % PARTICLES_ALONG_EDGE == 0, i % PARTICLES_ALONG_EDGE == 0 ? colors[i / PARTICLES_ALONG_EDGE] : "hsla(0,100%,0%,0.1)"));
    }

    for (let i = 0; i < numInGamePlayers; i++) {
        cursorParticles.push(new CursorParticleServer(0, 0, 50, cursorParticleNormalStrength, particles[i * PARTICLES_ALONG_EDGE], physics, colors[i]));
    }

    let i1 = 0, i2 = 0;
    for (let id in players) {
        players[id].particleIndex = i2;
        players[id].cursorParticleIndex = i1;

        i1++;
        i2 += PARTICLES_ALONG_EDGE;
    }

    // add repulsion to every player particle
    for (let i = 0; i < particles.length; i += PARTICLES_ALONG_EDGE) {
        for (let j = 0; j < particles.length; j += PARTICLES_ALONG_EDGE) {
            if (i == j) continue;
            particles[i].addBehavior(new toxi.physics2d.behaviors.AttractionBehavior(particles[j], particles[j].r * 5, -5));
        }
    }

    // make springs
    for (let i = 0; i < particles.length - 1; i++) {
        springs.push(new SpringServer(particles[i], particles[i + 1], 0.01, physics));
    }
    springs.push(new SpringServer(particles[particles.length - 1], particles[0], 0.01, physics));

    // make sendable objects
    for (let i = 0; i < particles.length; i++) {
        clientParticles.push({ x:particles[i].x, y:particles[i].y, isPlayer:particles[i].isPlayer, currentBoostTime:particles[i].currentBoostTime, color:particles[i].color });
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        clientCursorParticles.push({ x:cursorParticles[i].x, y:cursorParticles[i].y, attractionRadius:cursorParticles[i].attractionRadius, color:cursorParticles[i].color });
    }

    for (let i = 0; i < springs.length; i++) {
        clientSprings.push({ particle1:{ x:springs[i].a.x, y:springs[i].a.y }, particle2:{ x:springs[i].b.x, y:springs[i].b.y } });
    }

    // update repulsion strength relative to player count
    cursorParticleNormalStrength = -particles.length * 2;
    cursorParticleBoostStrength = cursorParticleNormalStrength * 2.5;

    for (let id in players) {
        io.to(id).emit("initGame", { players:players, particles:clientParticles, springs:clientSprings, cursorParticles:clientCursorParticles, walls:levels[levelIndex].walls, flag:levels[levelIndex].flag });
    }
    
    loopId = setInterval(gameLoop, 1000 / 60);
}

function gameLoop() {
    if (hasWon) {
        returnLobby();
        return;
    }

    // save position
    for (let i = 0; i < particles.length; i++) {
        particles[i].previousX = particles[i].x;
        particles[i].previousY = particles[i].y;
    }

    // boost logic
    for (let id in players) {
        if (particles[players[id].particleIndex].behaviors[0].attrStrength == cursorParticleBoostStrength) {
            particles[players[id].particleIndex].currentBoostTime++;

            if (particles[players[id].particleIndex].currentBoostTime > maxBoostTime) {
                particles[players[id].particleIndex].behaviors[0].attrStrength = cursorParticleNormalStrength;
                particles[players[id].particleIndex].currentBoostTime = 0;
            }
        }
    }

    physics.update(gameSpeed);

    // wall collisions
    for (let i = 0; i < particles.length; i++) {
        if (levels[levelIndex].flag.particleCollision(particles[i])) {
            hasWon = true;

            for (let id in players) {
                io.to(id).emit("gameWin");
            }

            break;
        }

        for (let j = 0; j < levels[levelIndex].walls.length; j++) {
            particles[i].handleCollision(levels[levelIndex].walls[j]);
        }
    }

    // update sendable objects
    for (let i = 0; i < particles.length; i++) {
        clientParticles[i].x = particles[i].x;
        clientParticles[i].y = particles[i].y;
        clientParticles[i].currentBoostTime = particles[i].currentBoostTime;
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        clientCursorParticles[i].x = cursorParticles[i].x;
        clientCursorParticles[i].y = cursorParticles[i].y;
    }

    for (let id in players) {
        io.to(id).emit("updateGame", { particles:clientParticles, cursorParticles:clientCursorParticles });
    }

    // reset server when all players disconnected
    if (numInGamePlayers == 0) {
        console.log("exit game")

        clearInterval(loopId);
        players = {};
        particles = [];
        cursorParticles = [];
        springs = [];
        clientParticles = []
        clientCursorParticles = [];
        clientSprings = [];
        inGame = false;
        hasWon = false;
        numInGamePlayers = 0;
        loopId = setInterval(lobbyLoop, 1000 / 60);
    }
}