const canvasWidth = 704;
const canvasHeight = 512;
const menuHeight = 128;

let route = [
    { x: 0, y: 192 },
    { x: 576, y: 192 },
    { x: 576, y: 320 },
    { x: 320, y: 320 },
    { x: 320, y: 256 },
    { x: 128, y: 256 },
    { x: 128, y: 448 },
    { x: 704, y: 448 },
];

let new_route = [];

let scene = "play"; // worldEditor // gameOver //play

let mutatedRounds = [];
let originalRounds = [];
let roundsCounter = 1;

let bullets = [];
let towers = [];
let paths = [];
let enemies = [];
let explosions = [];
let newWorldLines = [];
let newTiles = [];
let plusHearts = [];

let app;
let menu;
let bullet;
let gamePaused = false;

let spawnElapsed = 0;

let towerCount = 0;
let enemyCount = 0;
let hudContainer;
let enemiesKilled = 0;
let enemiesKilledThisRound = 0;

let sprite;
let towerSpritesheet;
let roadSpritesheet;
let levelUpTexture;
let crownTexture;
let heartSpr_big;

let gold = 15;
let lives = 30;
let dragTarget = null;
let twrCircle = null;
let dragTarget_x = 0;
let dragTarget_y = 0;
let firstEnemy = false;

let rootF = "https://github.com/MichalKuracina/Tower-Defense/tree/main/assets/";

function run() {
    (async () => {
        app = new PIXI.Application();

        await app.init({
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: 0x338a4a,
        });
        document.body.appendChild(app.canvas);

        roadsSprites.meta.image = rootF + "road-spritesheet.png";
        towerSprites.meta.image = rootF + "tower-spritesheet.png";
        playPauseSprites.meta.image = rootF + "play-pause-spritesheet.png";

        const roadTexture = await PIXI.Assets.load(roadsSprites.meta.image);
        roadSpritesheet = new PIXI.Spritesheet(roadTexture, roadsSprites);
        await roadSpritesheet.parse();

        const towerTexture = await PIXI.Assets.load(towerSprites.meta.image);
        towerSpritesheet = new PIXI.Spritesheet(towerTexture, towerSprites);
        await towerSpritesheet.parse();

        const playPauseTexture = await PIXI.Assets.load(
            playPauseSprites.meta.image
        );
        playPauseSpritesheet = new PIXI.Spritesheet(
            playPauseTexture,
            playPauseSprites
        );
        await playPauseSpritesheet.parse();

        const heartTexture = await PIXI.Assets.load(rootF + "heart.png");
        const heartSpr_small = PIXI.Sprite.from(heartTexture);

        const heartTexture2 = await PIXI.Assets.load(rootF + "heart.png");
        heartSpr_big = PIXI.Sprite.from(heartTexture2);

        const loadTexture = await PIXI.Assets.load(rootF + "load.png");
        const load = PIXI.Sprite.from(loadTexture);

        const saveTexture = await PIXI.Assets.load(rootF + "save.png");
        const save = PIXI.Sprite.from(saveTexture);

        const worldEditorTexture = await PIXI.Assets.load(
            rootF + "levelEditor.png"
        );
        const worldEditorSprite = PIXI.Sprite.from(worldEditorTexture);

        levelUpTexture = await PIXI.Assets.load(rootF + "levelup.png");
        crownTexture = await PIXI.Assets.load(rootF + "crown.png");

        await grass();

        paths = await drawRoad(
            structuredClone(route),
            [],
            0,
            canvasWidth,
            menuHeight,
            canvasHeight
        );

        // grid(menuHeight);

        menu = new Menu(
            menuHeight,
            worldEditorSprite,
            load,
            save,
            heartSpr_small,
            towerSpritesheet,
            gold,
            lives,
            playPauseSpritesheet
        );
        await menu.initMenu();
        menu.zIndex = 998;
        app.stage.addChild(menu);

        menu.standardBtn.on("pointerdown", onDragStart, menu.standardBtn);
        menu.splashBtn.on("pointerdown", onDragStart, menu.splashBtn);
        menu.slowBtn.on("pointerdown", onDragStart, menu.slowBtn);

        app.stage.eventMode = "static";
        app.stage.hitArea = app.screen;

        app.stage.on("pointerup", onDragEnd);
        app.stage.on("pointerupoutside", onDragEnd);

        menu.playBtn.on("pointerdown", startGame);
        menu.pauseBtn.on("pointerdown", pauseGame);
        menu.worldEditorBtn.on("pointerdown", createWorld);
        menu.saveBtn.on("pointerdown", saveWorld);
        menu.loadBtn.on("pointerdown", loadWorld);

        loadButtonStatus();

        mutatedRounds = mutate(rounds);
        originalRounds = structuredClone(rounds); // this is used when load new world
        app.ticker.add(updateTick);
    })();
}

async function addHeart(amount) {
    const heartObj = new PlusHeart(
        heartSpr_big,
        "heartContainer",
        canvasWidth / 2,
        canvasHeight / 2,
        menu.heartBtn.x,
        menu.heartBtn.y,
        amount
    );
    app.stage.addChild(heartObj);
    plusHearts.push(heartObj);
    menu.addLives(amount);
}

function loadButtonStatus() {
    const worldToLoad = localStorage.getItem("td-world");
    if (worldToLoad) {
        menu.loadBtn.activate();
    }
}

function saveWorld() {
    // Save current route to local storage
    localStorage.setItem("td-world", JSON.stringify(route));
    menu.saveBtn.deactivate();
    loadButtonStatus();
}

async function loadWorld() {
    menu.saveBtn.deactivate();
    // Load route from local storage
    const worldToLoad = localStorage.getItem("td-world");

    cleanWorld();
    route = JSON.parse(worldToLoad);
    paths = await drawRoad(
        structuredClone(route),
        [],
        0,
        canvasWidth,
        menuHeight,
        canvasHeight
    );

    restartWorld();
}

function restartWorld() {
    roundsCounter = 1;
    rounds = originalRounds;
    mutatedRounds = mutate(rounds);
    towerCount = 0;
    enemyCount = 0;
    enemiesKilled = 0;
    enemiesKilledThisRound = 0;

    menu.gold = 15;
    menu.lives = 30;
    menu.updateRoundCounter(1);
    menu.updateLives(30);
    menu.standardBtn.refreshButtonSprite(gold);
    menu.splashBtn.refreshButtonSprite(gold);
    menu.slowBtn.refreshButtonSprite(gold);
    menu.coinLbl.getChildByLabel("coin").text = `${gold}€`;
}

function startGame() {
    gamePaused = false;
    menu.playBtn.deactivate();
    menu.pauseBtn.activate();
}

function pauseGame() {
    gamePaused = true;
    menu.playBtn.activate();
    menu.pauseBtn.deactivate();
}

function gameOver() {
    const gmvr = app.stage.children.filter(
        (itm) => itm.label === "GameOverDetail"
    );

    if (gmvr.length === 0) {
        // Add GameOver modal exactly once
        const gmvrobj = new GameOver(
            roundsCounter,
            towers.length,
            enemiesKilled
        );
        gmvrobj.zIndex = 999;
        app.stage.addChild(gmvrobj);

        app.stage.children.forEach((element) => {
            // Disable all other elements
            element.eventMode = "none";
        });
    }
}

function updateTick(deltaTime) {
    if (scene === "gameOver") {
        gameOver();
        return;
    }

    if (scene === "worldEditor") {
        return;
    }

    if (gamePaused) {
        return;
    }

    spawnEnemy(deltaTime.deltaMS);

    // Move enemies.
    if (enemies.length > 0) {
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].move(deltaTime.deltaMS);

            if (enemies[i].finished) {
                menu.substractLives(1);
                app.stage.removeChild(enemies[i]);
                enemies[i].destroy();
                enemies.splice(i, 1);
                i--;
            }
        }
    }

    // Rotate and Shoot.
    if (enemies.length > 0) {
        for (let i = 0; i < towers.length; i++) {
            const closestEnemy = towers[i].getClosestEnemy(enemies);
            towers[i].rotateTower(closestEnemy.x, closestEnemy.y);
            const bullet = towers[i].shoot(closestEnemy, deltaTime.deltaMS);

            if (bullet) {
                // bullet.damage = towers[i].damage;
                app.stage.addChild(bullet);
                bullets.push(bullet);
            }
        }
    }

    // Move bullets.
    for (let i = 0; i < bullets.length; i++) {
        const etarget = enemies.filter(
            (enm) => enm.uid === bullets[i].enemy_uid
        );
        if (etarget.length === 0) {
            // Target stopped existing (was killed)
            // Move to last known position
            bullets[i].move();
        }
        if (etarget.length === 1) {
            // Move bullet towards enemy's current position
            bullets[i].moveToEnemy(etarget[0].x, etarget[0].y);
        }

        if (checkHitEnemy(bullets[i], enemies, deltaTime)) {
            bullets.splice(i, 1);
            i--;
            continue;
        }

        if (checkHitWall(bullets[i])) {
            app.stage.removeChild(bullets[i]);
            bullets[i].destroy();
            bullets.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < explosions.length; i++) {
        explosions[i].explode(deltaTime.deltaMS);
        if (explosions[i].exlosionFinished === true) {
            app.stage.removeChild(explosions[i]);
            explosions[i].destroy();
            explosions.splice(i, 1);
            i--;
        }
    }

    // Draw LevelUpPin
    towers.forEach((tower) => {
        if (tower.cost <= menu.gold) {
            // This tower should have level up pin visible
            if (!tower.levelUpPin) {
                tower.addLevelUpPin();
            }
            if (tower.level === tower.maxLevel && tower.levelUpPin) {
                // Make sure that LevelUpPin and Crown doesn't exist at the same time
                tower.removeLevelUpPin();
            }
        } else {
            if (tower.levelUpPin) {
                tower.removeLevelUpPin();
            }
        }
    });

    // Draw Big Heart
    for (let i = 0; i < plusHearts.length; i++) {
        plusHearts[i].fadeout(deltaTime.deltaMS);
        if (plusHearts[i].width <= 10) {
            app.stage.removeChild(plusHearts[i]);
            plusHearts[i].destroy();
            plusHearts.splice(i, 1);
            i--;
        }
    }

    if (menu.lives <= 0) {
        scene = "gameOver";
    }
}

function isInRange(number1, number2, limit) {
    const lowerLimit = number2 - limit;
    const upperLimit = number2 + limit;
    if (number1 >= lowerLimit && number1 <= upperLimit) {
        return true;
    } else {
        return false;
    }
}

function checkHitEnemy(bullet, enemies, deltaTime) {
    let hit = false;
    for (let i = 0; i < enemies.length; i++) {
        const dx = Math.abs(bullet.position_x - enemies[i].x);
        const dy = Math.abs(bullet.position_y - enemies[i].y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= bullet.radius + enemies[i].radius) {
            app.stage.removeChild(bullet);
            bullet.destroy();

            // Hit primary target.

            enemies[i].hit(
                bullet.damage,
                bullet.slowCoefficient,
                bullet.color,
                bullet.effect
            );
            const explosion = new Explosion(
                bullet.position_x,
                bullet.position_y,
                bullet.splashRadius,
                bullet.color
            );
            app.stage.addChild(explosion);
            explosions.push(explosion);

            const secondaryTargets = enemies.filter(
                (enm) => enm.uid !== enemies[i].uid
            );

            // Hit secondary targets (splash).
            for (let j = 0; j < secondaryTargets.length; j++) {
                const sx = Math.abs(bullet.position_x - secondaryTargets[j].x);
                const sy = Math.abs(bullet.position_y - secondaryTargets[j].y);
                const splashDistance = Math.sqrt(sx * sx + sy * sy);

                if (
                    splashDistance <=
                    bullet.splashRadius + secondaryTargets[j].radius
                ) {
                    secondaryTargets[j].hit(
                        bullet.splashDamage,
                        bullet.slowCoefficient
                    );
                }
            }

            if (enemies[i].health <= 0) {
                menu.addGold(enemies[i].prizeMoney);
                enemiesKilled++;
                enemiesKilledThisRound++;

                if (enemies[i].enemyToolTip) {
                    enemies[i].destroyEnemyToolTip();
                }

                app.stage.removeChild(enemies[i]);
                enemies[i].destroy();
                enemies.splice(i, 1);
            }
            hit = true;
        }
    }
    return hit;
}

function checkHitWall(bullet) {
    const maxX = bullet.getBounds().maxX;
    const maxY = bullet.getBounds().maxY;
    const minX = bullet.getBounds().minX;
    const minY = bullet.getBounds().minY;

    if (
        minY > app.screen.height ||
        maxY < 0 ||
        maxX < 0 ||
        minX > app.screen.width
    ) {
        return true;
    }

    return false;
}

async function onDragStart(event) {
    dragTarget = new PIXI.Sprite(towerSpritesheet.textures[this.label]);
    dragTarget.anchor.set(0.5);
    dragTarget.alpha = 0.5;
    dragTarget.label = this.label;
    dragTarget.zIndex = 999;
    dragTarget.position.set(event.data.global.x, event.data.global.y);
    dragTarget.width = 40;
    dragTarget.height = 40;

    app.stage.addChild(dragTarget);

    twrCircle = new TowerCircle(
        event.data.global.x,
        event.data.global.y,
        this.radius,
        this.bullet_color
    );
    app.stage.addChild(twrCircle);
    dragTarget_x = event.data.global.x;
    dragTarget_y = event.data.global.y;
    app.stage.on("pointermove", onDragMove);
}

function onDragEnd(event) {
    if (dragTarget) {
        app.stage.off("pointermove", onDragMove);

        if (goodToBuild(dragTarget)) {
            const towerTexture = new PIXI.Sprite(
                towerSpritesheet.textures[dragTarget.label]
            );
            const turret = new Tower(
                towerTexture,
                event.data.global.x,
                event.data.global.y,
                dragTarget.label,
                true,
                crownTexture
            );
            app.stage.addChild(turret);
            towers.push(turret);
        }

        app.stage.removeChild(dragTarget);
        dragTarget.destroy();
        dragTarget = null;

        app.stage.removeChild(twrCircle);
        twrCircle.destroy();
    }
}

function onDragMove(event) {
    if (dragTarget) {
        if (goodToBuild(dragTarget)) {
            twrCircle.update(
                event.data.global.x - dragTarget_x,
                event.data.global.y - dragTarget_y,
                0x33cc33
            );
        } else {
            twrCircle.update(
                event.data.global.x - dragTarget_x,
                event.data.global.y - dragTarget_y,
                0xff0000
            );
        }
        dragTarget.position.set(event.data.global.x, event.data.global.y);
    }
}

function goodToBuild(dEl) {
    let result = true;

    const elLeftEdge = dEl.x - dEl.width / 3;
    const elRightEdge = dEl.x + dEl.width / 3;
    const elTopEdge = dEl.y - dEl.height / 3;
    const elBottomEdge = dEl.y + dEl.height / 3;

    paths.forEach((item) => {
        let itemLeftEdge;
        let itemRightEdge;
        let itemTopEdge;
        let itemBottomEdge;

        if (item.direction === "left" || item.direction === "right") {
            itemLeftEdge = item.x - item.width / 2;
            itemRightEdge = item.x + item.width / 2;
            itemTopEdge = item.y - item.height / 4;
            itemBottomEdge = item.y + item.height / 4;
        }

        if (item.direction === "top" || item.direction === "bottom") {
            itemLeftEdge = item.x - item.width / 4;
            itemRightEdge = item.x + item.width / 4;
            itemTopEdge = item.y - item.height / 2;
            itemBottomEdge = item.y + item.height / 2;
        }

        if (item.direction === "q1" || item.direction === "q4") {
            // right horizontal
            itemLeftEdge = item.x - item.width / 4;
            itemRightEdge = item.x + item.width / 2;
            itemTopEdge = item.y - item.height / 4;
            itemBottomEdge = item.y + item.height / 4;
        }

        if (item.direction === "q2" || item.direction === "q3") {
            // left horizontal
            itemLeftEdge = item.x - item.width / 2;
            itemRightEdge = item.x + item.width / 4;
            itemTopEdge = item.y - item.height / 4;
            itemBottomEdge = item.y + item.height / 4;
        }

        if (item.direction === "q1" || item.direction === "q2") {
            // top vertical
            itemLeftEdge = item.x - item.width / 4;
            itemRightEdge = item.x + item.width / 4;
            itemTopEdge = item.y - item.height / 2;
            itemBottomEdge = item.y + item.height / 4;
        }

        if (item.direction === "q3" || item.direction === "q4") {
            // bottom vertical
            itemLeftEdge = item.x - item.width / 4;
            itemRightEdge = item.x + item.width / 4;
            itemTopEdge = item.y - item.height / 4;
            itemBottomEdge = item.y + item.height / 2;
        }

        if (
            elLeftEdge < itemRightEdge &&
            elRightEdge > itemLeftEdge &&
            elBottomEdge > itemTopEdge &&
            elTopEdge < itemBottomEdge
        ) {
            result = false;
        }
    });

    if (result) {
        towers.forEach((item) => {
            const itemLeftEdge = item.x - item.width / 3;
            const itemRightEdge = item.x + item.width / 3;
            const itemTopEdge = item.y - item.height / 3;
            const itemBottomEdge = item.y + item.height / 3;

            if (
                elLeftEdge < itemRightEdge &&
                elRightEdge > itemLeftEdge &&
                elBottomEdge > itemTopEdge &&
                elTopEdge < itemBottomEdge
            ) {
                result = false;
            }
        });
    }

    if (result) {
        if (
            elLeftEdge < 0 ||
            elRightEdge > canvasWidth ||
            elBottomEdge > canvasHeight ||
            elTopEdge < menu.y + menu.height
        ) {
            result = false;
        }
    }

    return result;
}

function mutate(arr) {
    let result = [];

    arr.forEach((round) => {
        let new_enemies = Math.round(round.enemies * 1.3);
        let new_health = Math.round(round.health * 1.5);
        let new_speed = round.speed - 0.2;
        let new_prizeMoney = Math.round(round.prizeMoney * 1.7);
        // if (new_prizeMoney === round.prizeMoney) {
        //   new_prizeMoney = round.prizeMoney++;
        // }
        result.push({
            ...round,
            enemies: new_enemies,
            health: new_health,
            speed: new_speed,
            prizeMoney: new_prizeMoney,
        });
    });

    return result;
}

function spawnEnemy(deltaMS) {
    if (rounds.length === 0) {
        // All 10 rounds are over
        rounds = structuredClone(mutatedRounds);
        let temp = mutate(rounds);
        mutatedRounds = structuredClone(temp);
        return;
    }

    const currentRound = rounds[0];

    if (currentRound.enemies === 0) {
        spawnElapsed = -10000; // Pause in between rounds.
        rounds.shift();
        firstEnemy = true;
        return;
    }

    spawnElapsed += deltaMS;

    if (spawnElapsed >= currentRound.spawnInterval) {
        spawnElapsed = 0;
        const enemy = new Enemy(
            route[0].x,
            route[0].y,
            currentRound.radius,
            currentRound.color,
            currentRound.health,
            currentRound.health,
            currentRound.speed,
            structuredClone(route),
            currentRound.prizeMoney
        );
        enemy.zIndex = 1;
        app.stage.addChild(enemy);
        enemies.push(enemy);
        currentRound.enemies--;

        if (firstEnemy) {
            // First enemy of this round

            const heartsAmount = Math.round(enemiesKilledThisRound * 0.1);
            if (heartsAmount === 0) {
                addHeart(1);
            } else {
                addHeart(heartsAmount);
            }
            roundsCounter++;
            menu.updateRoundCounter(roundsCounter);
            firstEnemy = false;
            enemiesKilledThisRound = 0;
        }
    }
}

function isMobile() {
    return (
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.matchMedia("(max-width: 768px)").matches
    );
}
