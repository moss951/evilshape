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
const RectServer = require('./rectServer');
const LevelServer = require('./levelServer');

const toxi = require('toxiclibsjs');
const physics = new toxi.physics2d.VerletPhysics2D();
const gravity = new toxi.physics2d.behaviors.GravityBehavior(new toxi.geom.Vec2D(0, 0.5));
physics.addBehavior(gravity);

const MAX_PLAYERS = 10; // not actually max players, just the max amount of players intended
const PARTICLES_ALONG_EDGE = 2;
let numPlayers = 0;
const players = {};
const particles = [];
const cursorParticles = [];
const springs = [];

let cursorParticleNormalStrength;
let cursorParticleBoostStrength;
const maxBoostTime = 10;

const clientParticles = []
const clientCursorParticles = [];
const clientSprings = [];

const level1 = new LevelServer(
    { x:150, y:400 },
    [
        new RectServer(0, 550, 1500, 50),
        new RectServer(0, -1500, 50, 2050),
        new RectServer(1450, -1500, 50, 2050),

        new RectServer(200, 500, 50, 50),
        new RectServer(400, 150, 50, 300),
        new RectServer(550, 100, 50, 450),
        new RectServer(700, 50, 50, 400),
        new RectServer(200, 150, 200, 50),

        new RectServer(750, 50, 50, 50),
        new RectServer(950, -50, 50, 50),
        new RectServer(750, -150, 50, 50),

        new RectServer(400, -150, 150, 50),
    ]
);

let lobbyLoopIntervalId = setInterval(lobbyLoop, 1000 / 60);
let gameLoopId;

server.listen(3000, () => {
    console.log("started listening on port 3000");
});

io.on("connection", (socket) => {
    socket.on("join", (newPlayerData) => {
        if (numPlayers < MAX_PLAYERS) {
            console.log(socket.id  + " connected");
            players[socket.id] = new PlayerServer(newPlayerData.username, false);
            numPlayers++;
            io.emit('updatePlayerList', players);
        }
    });

    socket.on('disconnect', () => {
        if (players[socket.id] != undefined) {
            console.log(socket.id + " disconnected");
            delete players[socket.id];
            io.emit('updatePlayerList', players);
        }
    });

    socket.on("ready", () => {
        console.log(socket.id + " readied");
        players[socket.id].ready = true;
        io.emit('updatePlayerReady', { id:socket.id, ready:players[socket.id].ready });
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
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleBoostStrength;
    });

    socket.on("cursorBoostStopRequest", () => {
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleNormalStrength;
        particles[players[socket.id].particleIndex].currentBoostTime = 0;
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

function lobbyLoop() {
    if (Object.keys(players).length == 0) return;
    for (let id in players) {
        if (players[id] != undefined && !players[id].ready) return;
    }

    clearInterval(lobbyLoopIntervalId);
    console.log("game start");

    // make particles
    const particleCoords = getPolygonVertexCoords(numPlayers * PARTICLES_ALONG_EDGE, level1.spawnPos.x, level1.spawnPos.y, 50, 50);
    for (let i = 0; i < particleCoords.length; i++) {
        particles.push(new ParticleServer(particleCoords[i].x, particleCoords[i].y, physics, i % PARTICLES_ALONG_EDGE == 0));

    }

    for (let i = 0; i < numPlayers; i++) {
        cursorParticles.push(new CursorParticleServer(0, 0, 50, cursorParticleNormalStrength, particles[i * PARTICLES_ALONG_EDGE], physics));
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
        clientParticles.push({ x:particles[i].x, y:particles[i].y, isPlayer:particles[i].isPlayer, currentBoostTime:particles[i].currentBoostTime });
    }

    for (let i = 0; i < cursorParticles.length; i++) {
        clientCursorParticles.push({ x:cursorParticles[i].x, y:cursorParticles[i].y, attractionRadius:cursorParticles[i].attractionRadius });
    }

    for (let i = 0; i < springs.length; i++) {
        clientSprings.push({ particle1:{ x:springs[i].a.x, y:springs[i].a.y }, particle2:{ x:springs[i].b.x, y:springs[i].b.y } });
    }

    // update repulsion strength relative to player count
    cursorParticleNormalStrength = -particles.length * 2;
    cursorParticleBoostStrength = cursorParticleNormalStrength * 2.5;

    io.emit("initGame", { players:players, particles:clientParticles, springs:clientSprings, cursorParticles:clientCursorParticles, walls:level1.walls });
    gameLoopId = setInterval(gameLoop, 1000 / 60);
}

function gameLoop() {
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

    physics.update();

    // wall collisions
    for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < level1.walls.length; j++) {
            particles[i].handleCollision(level1.walls[j]);
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

    io.emit("updateGame", { particles:clientParticles, cursorParticles:clientCursorParticles });
}