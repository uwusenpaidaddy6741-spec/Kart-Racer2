import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// SETUP
// ============================================================

const canvas =
    document.getElementById("gameCanvas");

const container =
    document.getElementById("game");


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);

scene.fog =
    new THREE.Fog(
        0x87ceeb,
        100,
        450
    );


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        65,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


// ============================================================
// LIGHTING
// ============================================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

scene.add(sun);


const hemisphere =
    new THREE.HemisphereLight(
        0xffffff,
        0x446644,
        2
    );

scene.add(hemisphere);


// ============================================================
// GROUND
// ============================================================

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            1000,
            1000
        ),

        new THREE.MeshStandardMaterial({
            color: 0x3f913f,
            roughness: 1
        })
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// ============================================================
// TRACK
// ============================================================

const TRACK_WIDTH = 14;


// Large beginner-friendly circuit

const trackPoints = [];


// Start straight

function addLine(
    x1,
    z1,
    x2,
    z2,
    steps
) {

    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const t =
            i / steps;

        trackPoints.push({
            x:
                THREE.MathUtils.lerp(
                    x1,
                    x2,
                    t
                ),

            z:
                THREE.MathUtils.lerp(
                    z1,
                    z2,
                    t
                )
        });
    }
}


// Arc helper

function addArc(
    cx,
    cz,
    radius,
    startAngle,
    endAngle,
    steps
) {

    for (
        let i = 1;
        i <= steps;
        i++
    ) {

        const t =
            i / steps;

        const angle =
            startAngle +
            (endAngle - startAngle) *
            t;

        trackPoints.push({
            x:
                cx +
                Math.cos(angle) *
                radius,

            z:
                cz +
                Math.sin(angle) *
                radius
        });
    }
}


// ============================================================
// TRACK LAYOUT
// ============================================================

addLine(
    -180,
    -100,
    180,
    -100,
    40
);


// Right sweeping corner

addArc(
    180,
    0,
    100,
    -Math.PI / 2,
    0,
    25
);


// Right straight

addLine(
    280,
    0,
    280,
    180,
    25
);


// Bottom hairpin

addArc(
    180,
    180,
    100,
    0,
    Math.PI,
    30
);


// Bottom straight

addLine(
    180,
    280,
    -160,
    280,
    40
);


// Left sweeping corner

addArc(
    -160,
    180,
    100,
    Math.PI / 2,
    Math.PI,
    25
);


// Left straight

addLine(
    -260,
    180,
    -260,
    -100,
    30
);


// Final corner

addArc(
    -160,
    -100,
    100,
    Math.PI,
    Math.PI * 1.5,
    25
);


// ============================================================
// CREATE ROAD
// ============================================================

const roadShape =
    new THREE.Shape();

const first =
    trackPoints[0];

roadShape.moveTo(
    first.x,
    first.z
);

for (
    let i = 1;
    i < trackPoints.length;
    i++
) {

    const p =
        trackPoints[i];

    roadShape.lineTo(
        p.x,
        p.z
    );
}

roadShape.lineTo(
    first.x,
    first.z
);


// Instead of using the Shape directly,
// create road segments around the track.

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.9
    });


for (
    let i = 0;
    i < trackPoints.length;
    i++
) {

    const a =
        trackPoints[i];

    const b =
        trackPoints[
            (i + 1) %
            trackPoints.length
        ];

    const dx =
        b.x - a.x;

    const dz =
        b.z - a.z;

    const length =
        Math.sqrt(
            dx * dx +
            dz * dz
        );

    if (length < 0.01) {
        continue;
    }

    const road =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                TRACK_WIDTH,
                0.15,
                length
            ),

            roadMaterial
        );

    road.position.set(
        (a.x + b.x) / 2,
        0.08,
        (a.z + b.z) / 2
    );

    road.rotation.y =
        -Math.atan2(
            dx,
            dz
        );

    road.receiveShadow = true;

    scene.add(road);
}


// ============================================================
// TRACK CURBS
// ============================================================

const curbMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xdd2222
    });


for (
    let i = 0;
    i < trackPoints.length;
    i += 3
) {

    const a =
        trackPoints[i];

    const b =
        trackPoints[
            (i + 1) %
            trackPoints.length
        ];

    const dx =
        b.x - a.x;

    const dz =
        b.z - a.z;

    const length =
        Math.sqrt(
            dx * dx +
            dz * dz
        );

    if (length < 0.01) {
        continue;
    }

    const curb =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                0.25,
                length
            ),

            curbMaterial
        );

    const centerX =
        (a.x + b.x) / 2;

    const centerZ =
        (a.z + b.z) / 2;

    const nx =
        -dz / length;

    const nz =
        dx / length;

    curb.position.set(
        centerX +
        nx *
        (TRACK_WIDTH / 2 + 0.35),

        0.2,

        centerZ +
        nz *
        (TRACK_WIDTH / 2 + 0.35)
    );

    curb.rotation.y =
        -Math.atan2(
            dx,
            dz
        );

    scene.add(curb);
}


// ============================================================
// KART
// ============================================================

const kart =
    new THREE.Group();


// Body

const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.8,
            0.8,
            4.2
        ),

        new THREE.MeshStandardMaterial({
            color: 0x1976ff
        })
    );

body.position.y =
    0.75;

body.castShadow = true;

kart.add(body);


// Hood

const hood =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            2.5,
            0.45,
            1.5
        ),

        new THREE.MeshStandardMaterial({
            color: 0x3188ff
        })
    );

hood.position.set(
    0,
    1.15,
    -1.15
);

hood.castShadow = true;

kart.add(hood);


// Seat

const seat =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            1.4,
            1.1,
            1.3
        ),

        new THREE.MeshStandardMaterial({
            color: 0x151515
        })
    );

seat.position.set(
    0,
    1.25,
    0.5
);

seat.castShadow = true;

kart.add(seat);


// Wheels

const wheelMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111
    });


const wheelPositions = [
    [-1.5, 1.35],
    [1.5, 1.35],
    [-1.5, -1.35],
    [1.5, -1.35]
];


for (
    const [x, z]
    of wheelPositions
) {

    const wheel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.65,
                0.65,
                0.45,
                24
            ),

            wheelMaterial
        );

    wheel.rotation.z =
        Math.PI / 2;

    wheel.position.set(
        x,
        0.55,
        z
    );

    wheel.castShadow = true;

    kart.add(wheel);
}


scene.add(kart);


// ============================================================
// PLAYER PHYSICS
// ============================================================

const player = {

    x: trackPoints[0].x,

    z: trackPoints[0].z,

    angle: 0,

    speed: 0,

    maxSpeed: 40,

    acceleration: 18,

    braking: 25,

    friction: 10,

    turnSpeed: 2.7,

    driftTurnMultiplier: 1.35,

    drifting: false,

    boostTimer: 0,

    boostPower: 0
};


// Put kart at start

kart.position.set(
    player.x,
    0,
    player.z
);


// ============================================================
// INPUT
// ============================================================

const keys = {};


window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        if (
            [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(key)
        ) {

            event.preventDefault();
        }
    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);


// ============================================================
// LAP SYSTEM
// ============================================================

const TOTAL_LAPS = 3;

let currentLap = 1;

let raceStarted = false;

let raceStartTime = 0;


// ============================================================
// FIND CLOSEST TRACK POINT
// ============================================================

function getClosestTrackPoint(
    x,
    z
) {

    let closestIndex = 0;

    let closestDistance =
        Infinity;

    for (
        let i = 0;
        i < trackPoints.length;
        i++
    ) {

        const p =
            trackPoints[i];

        const dx =
            p.x - x;

        const dz =
            p.z - z;

        const distance =
            dx * dx +
            dz * dz;

        if (
            distance <
            closestDistance
        ) {

            closestDistance =
                distance;

            closestIndex =
                i;
        }
    }

    return closestIndex;
}


// ============================================================
// DRIVING
// ============================================================

function updatePlayer(
    deltaTime
) {

    const accelerating =
        keys["w"] ||
        keys["arrowup"];

    const braking =
        keys["s"] ||
        keys["arrowdown"];

    const left =
        keys["a"] ||
        keys["arrowleft"];

    const right =
        keys["d"] ||
        keys["arrowright"];

    const drift =
        keys[" "];


    // --------------------------------------------------------
    // ACCELERATION
    // --------------------------------------------------------

    if (accelerating) {

        player.speed +=
            player.acceleration *
            deltaTime;
    }

    else if (braking) {

        player.speed -=
            player.braking *
            deltaTime;
    }

    else {

        // Natural friction

        if (player.speed > 0) {

            player.speed =
                Math.max(
                    0,
                    player.speed -
                    player.friction *
                    deltaTime
                );
        }

        if (player.speed < 0) {

            player.speed =
                Math.min(
                    0,
                    player.speed +
                    player.friction *
                    deltaTime
                );
        }
    }


    // --------------------------------------------------------
    // DRIFT
    // --------------------------------------------------------

    player.drifting =
        drift &&
        Math.abs(player.speed) > 8 &&
        (left || right);


    // --------------------------------------------------------
    // STEERING
    // --------------------------------------------------------

    let steering = 0;

    if (left) {
    steering += 1;
}

if (right) {
    steering -= 1;
}


    if (
        steering !== 0 &&
        Math.abs(player.speed) > 0.5
    ) {

        let steeringPower =
            player.turnSpeed;

        if (player.drifting) {

            steeringPower *=
                player.driftTurnMultiplier;
        }


        const speedRatio =
            Math.min(
                Math.abs(player.speed) /
                player.maxSpeed,
                1
            );


        player.angle +=
            steering *
            steeringPower *
            speedRatio *
            deltaTime;
    }

    // --------------------------------------------------------
// GRASS SLOWDOWN
// --------------------------------------------------------

const closestTrackIndex =
    getClosestTrackPoint(
        player.x,
        player.z
    );

const closestTrackPoint =
    trackPoints[closestTrackIndex];

const distanceFromTrack =
    Math.sqrt(
        Math.pow(
            player.x -
            closestTrackPoint.x,
            2
        ) +
        Math.pow(
            player.z -
            closestTrackPoint.z,
            2
        )
    );

const roadHalfWidth =
    TRACK_WIDTH / 2;

const grassBuffer =
    5;

const onGrass =
    distanceFromTrack >
    roadHalfWidth;

if (onGrass) {

    // Strongly reduce acceleration on grass
    player.speed *=
        Math.pow(
            0.15,
            deltaTime
        );

    // Prevent the kart from going too fast
    player.speed =
        THREE.MathUtils.clamp(
            player.speed,
            -5,
            8
        );
}

    // --------------------------------------------------------
    // SPEED LIMIT
    // --------------------------------------------------------

    let currentMaxSpeed =
        player.maxSpeed;


    if (
        player.boostTimer > 0
    ) {

        currentMaxSpeed +=
            player.boostPower;

        player.boostTimer -=
            deltaTime;
    }


    player.speed =
        THREE.MathUtils.clamp(
            player.speed,
            -12,
            currentMaxSpeed
        );


    // --------------------------------------------------------
    // MOVEMENT
    // --------------------------------------------------------

    player.x +=
        Math.sin(player.angle) *
        player.speed *
        deltaTime;

    player.z +=
        Math.cos(player.angle) *
        player.speed *
        deltaTime;


    // --------------------------------------------------------
    // KART TRANSFORM
    // --------------------------------------------------------

    kart.position.x =
        player.x;

    kart.position.z =
        player.z;

    kart.rotation.y =
    player.angle;


    // --------------------------------------------------------
    // START RACE
    // --------------------------------------------------------

    if (!raceStarted) {

        raceStarted = true;

        raceStartTime =
            performance.now();
    }
}


// ============================================================
// CAMERA
// ============================================================

const cameraPosition =
    new THREE.Vector3();

const cameraLookAt =
    new THREE.Vector3();


function updateCamera(
    deltaTime
) {

    const distance = 14;

    const height = 7;


    const behindX =
        player.x -
        Math.sin(player.angle) *
        distance;

    const behindZ =
        player.z -
        Math.cos(player.angle) *
        distance;


    cameraPosition.set(
        behindX,
        height,
        behindZ
    );


    const smoothing =
        1 -
        Math.exp(
            -8 *
            deltaTime
        );


    camera.position.lerp(
        cameraPosition,
        smoothing
    );


    cameraLookAt.set(
        player.x,
        1,
        player.z
    );


    camera.lookAt(
        cameraLookAt
    );
}


// ============================================================
// LAP DETECTION
// ============================================================

let previousTrackIndex =
    0;


function updateLap() {

    const currentIndex =
        getClosestTrackPoint(
            player.x,
            player.z
        );


    const total =
        trackPoints.length;


    const crossedStart =
        previousTrackIndex >
            total * 0.85 &&
        currentIndex <
            total * 0.15;


    if (crossedStart) {

        if (
            currentLap <
            TOTAL_LAPS
        ) {

            currentLap++;

        }
    }


    previousTrackIndex =
        currentIndex;
}


// ============================================================
// HUD
// ============================================================

function updateHUD() {

    const timer =
        raceStarted
            ? (performance.now() -
                raceStartTime) /
              1000
            : 0;


    const minutes =
        Math.floor(
            timer / 60
        );

    const seconds =
        (timer % 60)
            .toFixed(2)
            .padStart(
                5,
                "0"
            );


    document.getElementById(
        "timerDisplay"
    ).textContent =
        `${minutes}:${seconds}`;


    document.getElementById(
        "lapDisplay"
    ).textContent =
        `LAP ${currentLap} / ${TOTAL_LAPS}`;


    document.getElementById(
        "speedDisplay"
    ).textContent =
        `SPEED ${Math.round(
            Math.abs(
                player.speed
            )
        )}`;
}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// ============================================================
// GAME LOOP
// ============================================================

let previousTime =
    performance.now();


function gameLoop(
    currentTime
) {

    requestAnimationFrame(
        gameLoop
    );


    // Delta time in seconds

    let deltaTime =
        (
            currentTime -
            previousTime
        ) / 1000;


    previousTime =
        currentTime;


    // Prevent huge physics jumps
    // when the browser tab pauses.

    deltaTime =
        Math.min(
            deltaTime,
            0.05
        );


    updatePlayer(
        deltaTime
    );

    updateLap();

    updateCamera(
        deltaTime
    );

    updateHUD();


    renderer.render(
        scene,
        camera
    );
}


gameLoop(
    performance.now()
);
