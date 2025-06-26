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

let numPlayers = 0;
const players = {};
const particles = [];
const cursorParticles = [];
const springs = [];

let cursorParticleNormalStrength, cursorParticleBoostStrength;
const maxBoostTime = 60;

const level1 = new LevelServer(
    { x:150, y:400 },
    [
        new RectServer(0, 550, 1500, 50),
        new RectServer(0, -1500, 50, 2050),
        new RectServer(1450, -1500, 50, 2050),

        new RectServer(200, 500, 50, 50),
        new RectServer(400, 150, 50, 300),
        new RectServer(550, 100, 50, 350),
        new RectServer(200, 150, 200, 50),

        new RectServer(750, 50, 50, 50),
        new RectServer(950, -50, 50, 50),
        new RectServer(750, -150, 50, 50),

        new RectServer(400, -150, 150, 50),
    ]
);

let lobbyLoopIntervalId = setInterval(lobbyLoop, 1000);
let gameLoopId;

server.listen(3000, () => {
    console.log("started listening on port 3000");
});

io.on("connection", (socket) => {
    socket.on("join", (newPlayerData) => {
        console.log(socket.id  + " connected");
        players[socket.id] = new PlayerServer(newPlayerData.username, numPlayers, false);
        numPlayers++;
        io.emit('updatePlayerList', players);
    });

    socket.on('disconnect', () => {
        console.log(socket.id + " disconnected");
        delete players[socket.id];
        io.emit('updatePlayerList', players);
    });

    socket.on("ready", () => {
        console.log(socket.id + " readied");
        players[socket.id].ready = true;
    });

    socket.on("cursorMoveRequest", (cursorPos) => {
        if (players[socket.id] != undefined) {
            cursorParticles[players[socket.id].particleIndex].x += cursorPos.x;
            cursorParticles[players[socket.id].particleIndex].y += cursorPos.y;
        }
    });
    
    socket.on("cursorResetPosRequest", (cursorPos) => {
        if (players[socket.id] != undefined) {
            cursorParticles[players[socket.id].particleIndex].x = cursorPos.x;
            cursorParticles[players[socket.id].particleIndex].y = cursorPos.y;
        }
    });

    socket.on("cursorBoostStartRequest", () => {
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleBoostStrength;
    });

    socket.on("cursorBoostStopRequest", () => {
        particles[players[socket.id].particleIndex].behaviors[0].attrStrength = cursorParticleNormalStrength;
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

    cursorParticleNormalStrength = -numPlayers;
    cursorParticleBoostStrength = cursorParticleNormalStrength * 10;

    // make particles
    const particleCoords = getPolygonVertexCoords(numPlayers, level1.spawnPos.x, level1.spawnPos.y, 50, 50);
    for (let i = 0; i < numPlayers; i++) {
        particles.push(new ParticleServer(particleCoords[i].x, particleCoords[i].y, physics));
        cursorParticles.push(new CursorParticleServer(0, 0, 50, cursorParticleNormalStrength, particles[particles.length - 1], physics));
    }

    // add repulsion to every particle except adjacent ones
    for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < particles.length; j++) {
            if (Math.abs(i - j) > 1 && Math.abs(i - j) != particles.length - 1) {
                particles[i].addBehavior(new toxi.physics2d.behaviors.AttractionBehavior(particles[j], particles[j].r * 10, -5));
            }
        }
    }

    // make springs
    for (let i = 0; i < particles.length - 1; i++) {
        springs.push(new SpringServer(particles[i], particles[i + 1], 0.01, physics));
    }
    springs.push(new SpringServer(particles[particles.length - 1], particles[0], 0.01, physics));

    io.emit("initGame", { particles:particles, springs:springs, cursorParticles:cursorParticles, walls:level1.walls });
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
        console.log(particles[i]);
        for (let j = 0; j < level1.walls.length; j++) {
            particles[i].handleCollision(level1.walls[j]);
        }
    }

    for (let i = 0; i < springs.length; i++) {
        for (let j = 0; j < level1.walls.length; j++) {
            springs[i].handleCollision(level1.walls[j]);
        }
    }

    io.emit("updateGame", { particles:particles, springs:springs, cursorParticles:cursorParticles });
}