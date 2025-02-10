async function drawRoad(
  routeObj,
  pathTiles,
  canvas_left,
  canvas_right,
  canvas_top,
  canvas_bottom
) {
  //   routeObj[0].x = routeObj[0].x - 64;
  //   console.log(routeObj);

  if (routeObj[0].x === canvas_left) {
    // First tile is on left
    routeObj[0].x = routeObj[0].x - 64;
  }

  if (routeObj[0].x === canvas_right) {
    // First tile is on right
    routeObj[0].x = routeObj[0].x + 64;
  }

  if (routeObj[0].y === canvas_top) {
    // First tile is on top
    routeObj[0].y = routeObj[0].y - 64;
  }

  if (routeObj[0].y === canvas_bottom) {
    // First tile is on bottom
    routeObj[0].y = routeObj[0].y + 64;
  }

  return await path(routeObj, pathTiles);
}

async function path(routeObj, pathTiles) {
  const spriteWidth = 64;
  let new_x;
  let new_y;

  if (routeObj[1].y <= routeObj[0].y && routeObj[1].x > routeObj[0].x) {
    const a = routeObj[0].y - routeObj[1].y;
    const b = routeObj[1].x - routeObj[0].x;
    const c = Math.sqrt(a * a + b * b);
    const newDistance = c - spriteWidth;

    const tangent = b / a;
    const angleRadians = Math.atan(tangent);
    const new_a = newDistance * Math.cos(angleRadians);
    const new_b = newDistance * Math.sin(angleRadians);

    new_x = routeObj[0].x + (b - new_b);
    new_y = routeObj[0].y - (a - new_a);
  }

  if (routeObj[1].y < routeObj[0].y && routeObj[1].x <= routeObj[0].x) {
    const a = routeObj[0].y - routeObj[1].y;
    const b = routeObj[0].x - routeObj[1].x;
    const c = Math.sqrt(a * a + b * b);
    const newDistance = c - spriteWidth;

    const tangent = b / a;
    const angleRadians = Math.atan(tangent);
    const new_a = newDistance * Math.cos(angleRadians);
    const new_b = newDistance * Math.sin(angleRadians);

    new_x = routeObj[0].x - (b - new_b);
    new_y = routeObj[0].y - (a - new_a);
  }

  if (routeObj[1].y >= routeObj[0].y && routeObj[1].x < routeObj[0].x) {
    const a = routeObj[1].y - routeObj[0].y;
    const b = routeObj[0].x - routeObj[1].x;
    const c = Math.sqrt(a * a + b * b);
    const newDistance = c - spriteWidth;

    const tangent = b / a;
    const angleRadians = Math.atan(tangent);
    const new_a = newDistance * Math.cos(angleRadians);
    const new_b = newDistance * Math.sin(angleRadians);

    new_x = routeObj[0].x - (b - new_b);
    new_y = routeObj[0].y + (a - new_a);
  }

  if (routeObj[1].y > routeObj[0].y && routeObj[1].x >= routeObj[0].x) {
    const a = routeObj[1].y - routeObj[0].y;
    const b = routeObj[1].x - routeObj[0].x;
    const c = Math.sqrt(a * a + b * b);
    const newDistance = c - spriteWidth;

    const tangent = b / a;
    const angleRadians = Math.atan(tangent);
    const new_a = newDistance * Math.cos(angleRadians);
    const new_b = newDistance * Math.sin(angleRadians);

    new_x = routeObj[0].x + (b - new_b);
    new_y = routeObj[0].y + (a - new_a);
  }

  new_x = Math.round(new_x * 10) / 10;
  new_y = Math.round(new_y * 10) / 10;

  //   if (routeObj.length === 1) {
  //     console.log("Hit end");
  //     return;
  //   }

  let direction;
  let nextDirection;

  if (routeObj[1].y === routeObj[0].y && routeObj[1].x > routeObj[0].x) {
    direction = "right";
  }

  if (routeObj[1].y < routeObj[0].y && routeObj[1].x === routeObj[0].x) {
    direction = "top";
  }

  if (routeObj[1].y === routeObj[0].y && routeObj[1].x < routeObj[0].x) {
    direction = "left";
  }

  if (routeObj[1].y > routeObj[0].y && routeObj[1].x === routeObj[0].x) {
    direction = "bottom";
  }

  let road;

  if (direction === "right" || direction === "left") {
    road = new PIXI.Sprite(roadSpritesheet.textures.roadH);
  } else if (direction === "top" || direction === "bottom") {
    road = new PIXI.Sprite(roadSpritesheet.textures.roadV);
  }

  road.position.set(new_x, new_y);
  road.anchor.set(0.5);
  road.label = "roadTile";
  road.direction = direction;
  road.zIndex = 1;
  app.stage.addChild(road);
  pathTiles.push(road);

  routeObj[0].x = new_x;
  routeObj[0].y = new_y;

  if (
    isInRange(routeObj[0].x, routeObj[1].x, spriteWidth / 2) &&
    isInRange(routeObj[0].y, routeObj[1].y, spriteWidth / 2)
  ) {
    routeObj.shift();

    if (routeObj.length === 1) {
      return;
    }

    if (routeObj[1].y === routeObj[0].y && routeObj[1].x > routeObj[0].x) {
      nextDirection = "right";
    }

    if (routeObj[1].y < routeObj[0].y && routeObj[1].x === routeObj[0].x) {
      nextDirection = "top";
    }

    if (routeObj[1].y === routeObj[0].y && routeObj[1].x < routeObj[0].x) {
      nextDirection = "left";
    }

    if (routeObj[1].y > routeObj[0].y && routeObj[1].x === routeObj[0].x) {
      nextDirection = "bottom";
    }

    let curve;

    if (
      (direction === "left" && nextDirection === "top") ||
      (direction === "bottom" && nextDirection === "right")
    ) {
      curve = new PIXI.Sprite(roadSpritesheet.textures.q1curve);
      curve.direction = "q1";
    }

    if (
      (direction === "right" && nextDirection === "top") ||
      (direction === "bottom" && nextDirection === "left")
    ) {
      curve = new PIXI.Sprite(roadSpritesheet.textures.q2curve);
      curve.direction = "q2";
    }

    if (
      (direction === "right" && nextDirection === "bottom") ||
      (direction === "top" && nextDirection === "left")
    ) {
      curve = new PIXI.Sprite(roadSpritesheet.textures.q3curve);
      curve.direction = "q3";
    }

    if (
      (direction === "left" && nextDirection === "bottom") ||
      (direction === "top" && nextDirection === "right")
    ) {
      curve = new PIXI.Sprite(roadSpritesheet.textures.q4curve);
      curve.direction = "q4";
    }

    pathTiles.pop(); // remove previous tile, because you are going to place a curve. They will overlap and cause issues with collision hit

    curve.position.set(new_x, new_y);
    curve.anchor.set(0.5);
    curve.label = "curveTile";
    curve.zIndex = 1;
    app.stage.addChild(curve);
    pathTiles.push(curve);
  }

  result = await path(routeObj, pathTiles);

  return pathTiles;
}
