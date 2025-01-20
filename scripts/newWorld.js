function createWorld() {
  scene = "worldEditor";
  cleanWorld();
  grid(menuHeight);
  getStartingPositions();
}

function determineDirection(x1, y1, x2, y2) {
  if (x1 === x2 && y1 < y2) {
    return "bottom";
  }

  if (x1 === x2 && y1 > y2) {
    return "top";
  }

  if (x1 > x2 && y1 === y2) {
    return "left";
  }

  if (x1 < x2 && y1 === y2) {
    return "right";
  }
}

async function getNextPositions(fromStartingX, fromStartingY) {
  let previousX;
  let previousY;
  let firstMove = false;

  if (this.x === undefined) {
    previousX = fromStartingX;
    previousY = fromStartingY;
    firstMove = true;
  } else {
    previousX = this.x;
    previousY = this.y;
  }

  // Determine direction

  let direction;
  if (!firstMove) {
    direction = determineDirection(
      new_route.at(-1).x,
      new_route.at(-1).y,
      previousX,
      previousY
    );
  }

  new_route.push({ x: previousX, y: previousY });

  destroyElements(paths);

  if (new_route.length > 1) {
    paths = await drawRoad(
      structuredClone(new_route),
      [],
      0,
      canvasWidth,
      menuHeight,
      canvasHeight
    );
  }

  if (!firstMove) {
    const nwl = new NewWorldLine(
      new_route.at(-1).x,
      new_route.at(-1).y,
      new_route.at(-2).x,
      new_route.at(-2).y
    );
    nwl.zIndex = 0;
    app.stage.addChild(nwl);
    newWorldLines.push(nwl);
  }

  const strtTls = app.stage.children.filter(
    (strtTl) => strtTl.label === "buildingTile"
  );
  destroyElements(strtTls);

  // Check if this is 'last' tile
  if (new_route.length > 1) {
    // This is not 'starting' tile
    if (isEdge(previousX, previousY)) {
      //   console.log("Is edge tile.");
      // This is end. Do not look for new tiles. Go to scene 'play'
      scene = "play";
      route = structuredClone(new_route);
      paths = await drawRoad(
        structuredClone(route),
        [],
        0,
        canvasWidth,
        menuHeight,
        canvasHeight
      );
      menu.saveBtn.activate();

      const grdLns = app.stage.children.filter((el) => el.label === "gridLine");
      destroyElements(grdLns);
      restartWorld();
      return;
    }
  }

  let buildingTiles = [];

  if (firstMove && previousX === 0) {
    // console.log("Walk right");
    buildingTiles = walkRight(direction, buildingTiles, previousX, previousY);
  } else if (firstMove && previousX === canvasWidth) {
    // console.log("Walk left");
    buildingTiles = walkLeft(direction, buildingTiles, previousX, previousY);
  } else if (firstMove && previousY === menuHeight) {
    // console.log("Walk bottom");
    buildingTiles = walkBottom(direction, buildingTiles, previousX, previousY);
  } else if (firstMove && previousY === canvasHeight) {
    // console.log("Walk top");
    buildingTiles = walkTop(direction, buildingTiles, previousX, previousY);
  } else {
    // console.log("Walk everywhere");

    buildingTiles = walkTop(direction, buildingTiles, previousX, previousY);
    buildingTiles = walkBottom(direction, buildingTiles, previousX, previousY);
    buildingTiles = walkLeft(direction, buildingTiles, previousX, previousY);
    buildingTiles = walkRight(direction, buildingTiles, previousX, previousY);
  }

  for (let i = 0; i < buildingTiles.length; i++) {
    if (buildingTiles[i].x === previousX && buildingTiles[i].y === previousY) {
      buildingTiles.splice(i, 1);
    }
  }

  buildingTiles.forEach((pos) => {
    const nt = new NewTile(pos.x, pos.y, "buildingTile");
    nt.on("pointerdown", getNextPositions);
    app.stage.addChild(nt);
    newTiles.push(nt);
  });
}

function walkRight(direction, arr, current_x, current_y) {
  if (new_route.length > 1 && direction === "right") {
    // Don't walk if you previously already walked top. There must be direction change.
    return arr;
  }

  if (current_x > canvasWidth) {
    return arr;
  }

  let safe2build = true;
  let next_x = current_x + 64;

  const isIntersecting = intersect4(next_x, current_y);

  if (new_route.length === 1) {
    safe2build = true;
  }

  if (isIntersecting === true) {
    safe2build = false;
  }

  arr.push({ x: current_x, y: current_y });

  if (safe2build) {
    walkRight(direction, arr, next_x, current_y);
  }

  return arr;
}
function walkLeft(direction, arr, current_x, current_y) {
  if (new_route.length > 1 && direction === "left") {
    // Don't walk if you previously already walked top. There must be direction change.
    return arr;
  }

  if (current_x < 0) {
    return arr;
  }

  let safe2build = true;
  let next_x = current_x - 64;

  const isIntersecting = intersect4(next_x, current_y);

  if (new_route.length === 1) {
    safe2build = true;
  }

  if (isIntersecting === true) {
    safe2build = false;
  }

  arr.push({ x: current_x, y: current_y });

  if (safe2build) {
    walkLeft(direction, arr, next_x, current_y);
  }

  return arr;
}
function walkTop(direction, arr, current_x, current_y) {
  if (new_route.length > 1 && direction === "top") {
    // Don't walk if you previously already walked top. There must be direction change.
    return arr;
  }

  if (current_y < menuHeight) {
    // End walking when hit right wall.
    return arr;
  }

  let safe2build = true;
  let next_y = current_y - 64;

  const isIntersecting = intersect4(current_x, next_y);

  if (new_route.length === 1) {
    safe2build = true;
  }

  if (isIntersecting === true) {
    safe2build = false;
  }

  arr.push({ x: current_x, y: current_y });

  if (safe2build) {
    walkTop(direction, arr, current_x, next_y);
  }

  return arr;
}
function walkBottom(direction, arr, current_x, current_y) {
  if (new_route.length > 1 && direction === "bottom") {
    // Don't walk if you previously already walked top. There must be direction change.
    return arr;
  }

  if (current_y > canvasHeight) {
    return arr;
  }

  let safe2build = true;
  let next_y = current_y + 64;

  const isIntersecting = intersect4(current_x, next_y);

  if (new_route.length === 1) {
    safe2build = true;
  }

  if (isIntersecting === true) {
    safe2build = false;
  }

  arr.push({ x: current_x, y: current_y });

  if (safe2build) {
    walkBottom(direction, arr, current_x, next_y);
  }

  return arr;
}

function intersect4(x, y) {
  let result = false;
  newWorldLines.forEach((line) => {
    const maxX = line.getBounds().maxX;
    const maxY = line.getBounds().maxY;
    const minX = line.getBounds().minX;
    const minY = line.getBounds().minY;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      result = true;
    }
  });
  //   console.log(result);
  return result;
}

function getStartingPositions() {
  const horizontalLines = Math.floor((canvasHeight - menuHeight) / 64) + 1;
  const verticalLines = Math.floor(canvasWidth / 64) + 1;

  let startingPositions = [];

  for (let h = 1; h < horizontalLines + 1; h++) {
    for (let v = 0; v < verticalLines; v++) {
      let y = h * 64 + 64;
      let x = v * 64;
      if (
        x === 0 ||
        x === canvasWidth ||
        y === menuHeight ||
        y === canvasHeight
      ) {
        startingPositions.push({ x: x, y: y });
      }
    }
  }

  // Filter out corners
  const corners = startingPositions.filter(
    (pos) =>
      (pos.x === 0 && pos.y === menuHeight) ||
      (pos.x === 0 && pos.y === canvasHeight) ||
      (pos.x === canvasWidth && pos.y === menuHeight) ||
      (pos.x === canvasWidth && pos.y === canvasHeight)
  );

  // Remove corners
  for (let index = 0; index < startingPositions.length; index++) {
    if (
      corners.some(
        (e) =>
          e.x === startingPositions[index].x &&
          e.y === startingPositions[index].y
      )
    ) {
      startingPositions.splice(index, 1);
    }
  }

  // Draw starting tiles
  startingPositions.forEach((pos) => {
    const nt = new NewTile(pos.x, pos.y, "startingTile");
    nt.on("pointerdown", startingTileSet);
    app.stage.addChild(nt);
    newTiles.push(nt);
  });
}
function startingTileSet() {
  // Add first entry to 'route'
  const startingTile_x = this.x;
  const startingTile_y = this.y;

  // Remove all starting tiles
  const strtTls = app.stage.children.filter(
    (strtTl) => strtTl.label === "startingTile"
  );
  destroyElements(strtTls);

  // Draw new tiles
  getNextPositions(startingTile_x, startingTile_y);
}
function cleanWorld() {
  new_route.length = 0;

  if (towers.length > 0) {
    towers.forEach((twr) => {
      if (twr.levelUpPin) {
        twr.removeLevelUpPin();
      }
      if (twr.crownSprite) {
        twr.removeCrown();
      }
    });
    destroyElements(towers);
  }

  destroyElements(paths);
  destroyElements(enemies);
  destroyElements(bullets);
  destroyElements(explosions);
  route.length = 0;
  destroyElements(newWorldLines);
  destroyElements(newTiles);
  const rrs = app.stage.children.filter(
    (el) => el.label === "roadTile" || el.label === "curveTile"
  );
  destroyElements(rrs);
  const grdLns = app.stage.children.filter((el) => el.label === "gridLine");
  destroyElements(grdLns);
}
function destroyElements(arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    app.stage.removeChild(arr[i]);
    arr[i].destroy();
    arr.splice(i, 1);
  }
}
function isEdge(x, y) {
  let result = false;
  if (x === 0 || x === canvasWidth || y === menuHeight || y === canvasHeight) {
    result = true;
  }
  return result;
}
