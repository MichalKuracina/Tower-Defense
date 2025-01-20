class Enemy extends PIXI.Graphics {
  constructor(
    x = 0,
    y = 0,
    radius = 10,
    color = 0xff0000,
    health = 5,
    healthMax = 5,
    speed = 1,
    route = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ],
    prizeMoney = 1
  ) {
    super();
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.health = health;
    this.healthMax = healthMax;
    this.speed = speed;
    this.route = route;
    this.prizeMoney = prizeMoney;
    this.enemyToolTip = null;

    this.finished = false;
    this.timeElapsed = 0;
    this.initialSpeed = this.speed;
    this.minimalSpeed = 0.2;
    this.freezeElapsed = 0;
    this.freezeRecover = 5000;
    this.zIndex = 999;

    this.initEnemy();
  }

  initEnemy() {
    this.eventMode = "static";
    this.drawEnemy(this.color);
    this.drawHealthBar();

    this.on("pointerover", (event) => {
      this.addEnemyToolTip();
    });

    this.on("pointerout", (event) => {
      this.destroyEnemyToolTip();
    });
  }

  addEnemyToolTip() {
    this.cursor = "pointer";

    // Add tooltip.
    this.enemyToolTip = new EnemyToolTip(
      this.x,
      this.y,
      "Enemy",
      this.radius,
      this.color,
      `${Math.round(this.health * 100) / 100}/${this.healthMax}`,
      Math.round(this.speed * 10) / 10,
      this.prizeMoney,
      this.radius,
      this.radius
    );
    app.stage.addChild(this.enemyToolTip);
    this.enemyToolTip.activate();
  }
  destroyEnemyToolTip() {
    // Destroy tooltip.
    app.stage.removeChild(this.enemyToolTip);
    this.enemyToolTip.destroy();
    this.enemyToolTip = null;
  }
  move(deltaMS) {
    // this.clear();
    this.freezeElapsed += deltaMS;

    if (this.freezeElapsed > this.freezeRecover) {
      // Recover from slow/freeze.
      this.speed = this.initialSpeed;
      this.freezeElapsed = 0;
      this.drawEnemy(this.color);
      this.drawHealthBar();
    }

    let new_x;
    let new_y;

    if (this.route.length === 1) {
      this.finished = true;
      return;
    }
    this.timeElapsed += deltaMS;
    if (this.timeElapsed >= this.speed) {
      this.distance++;
      // Q1
      if (this.route[1].y <= this.y && this.route[1].x > this.x) {
        // console.log("Q1");
        const a = this.y - this.route[1].y;
        const b = this.route[1].x - this.x;
        const c = Math.sqrt(a * a + b * b);
        const newDistance = c - this.speed;

        const tangent = b / a;
        const angleRadians = Math.atan(tangent);
        const new_a = newDistance * Math.cos(angleRadians);
        const new_b = newDistance * Math.sin(angleRadians);

        new_x = this.x + (b - new_b);
        new_y = this.y - (a - new_a);
      }

      // Q2
      if (this.route[1].y < this.y && this.route[1].x <= this.x) {
        //   console.log("Q2");
        const a = this.y - this.route[1].y;
        const b = this.x - this.route[1].x;
        const c = Math.sqrt(a * a + b * b);
        const newDistance = c - this.speed;

        const tangent = b / a;
        const angleRadians = Math.atan(tangent);
        const new_a = newDistance * Math.cos(angleRadians);
        const new_b = newDistance * Math.sin(angleRadians);

        new_x = this.x - (b - new_b);
        new_y = this.y - (a - new_a);
      }

      // Q3
      if (this.route[1].y >= this.y && this.route[1].x < this.x) {
        //   console.log("Q3");
        const a = this.route[1].y - this.y;
        const b = this.x - this.route[1].x;
        const c = Math.sqrt(a * a + b * b);
        const newDistance = c - this.speed;

        const tangent = b / a;
        const angleRadians = Math.atan(tangent);
        const new_a = newDistance * Math.cos(angleRadians);
        const new_b = newDistance * Math.sin(angleRadians);

        new_x = this.x - (b - new_b);
        new_y = this.y + (a - new_a);
      }

      // Q4
      if (this.route[1].y > this.y && this.route[1].x >= this.x) {
        //   console.log("Q4");
        const a = this.route[1].y - this.y;
        const b = this.route[1].x - this.x;
        const c = Math.sqrt(a * a + b * b);
        const newDistance = c - this.speed;

        const tangent = b / a;
        const angleRadians = Math.atan(tangent);
        const new_a = newDistance * Math.cos(angleRadians);
        const new_b = newDistance * Math.sin(angleRadians);

        new_x = this.x + (b - new_b);
        new_y = this.y + (a - new_a);
      }

      this.x = Math.round(new_x * 10) / 10;
      this.y = Math.round(new_y * 10) / 10;
      this.position.set(this.x, this.y);

      if (
        isInRange(this.x, this.route[1].x, this.speed) &&
        isInRange(this.y, this.route[1].y, this.speed)
      ) {
        // console.log("reached!");
        this.route.shift();
      }
    }
  }

  drawEnemy(enemyColor) {
    // Enemy
    this.circle(0, 0, this.radius);
    this.fill(0x000000);
    this.circle(0, 0, this.radius * 0.9);
    this.fill(enemyColor);

    // Health Bar Container
    this.rect(
      -this.radius,
      -(this.radius * 2),
      this.radius * 2,
      this.radius / 1.5
    );
    this.fill(0xfcfcfc);
  }

  drawHealthBar() {
    // this.clear();
    // Health Bar Slip
    let healthWidth =
      (this.radius * 2 - (this.radius / 15) * 2) *
      (this.health / this.healthMax);

    this.rect(
      -this.radius + this.radius / 15,
      -(this.radius * 2) + this.radius / 15,
      healthWidth,
      this.radius / 1.5 - (this.radius / 15) * 2
    );
    this.fill(0xfa0707);
  }

  hit(bulletDamage, bulletSlowCoefficient, bulletColor, bulletEffect) {
    this.health = this.health - bulletDamage;

    if (bulletEffect === "slow") {
      if (this.speed - bulletSlowCoefficient > this.minimalSpeed) {
        // Enemy is under effect of slow.
        this.speed = this.speed - bulletSlowCoefficient;
        this.drawEnemy(bulletColor);
      }
    }

    // Health Bar Container
    this.rect(
      -this.radius,
      -(this.radius * 2),
      this.radius * 2,
      this.radius / 1.5
    );
    this.fill(0xfcfcfc);

    // Health Bar Slip

    let healthWidth =
      (this.radius * 2 - (this.radius / 15) * 2) *
      (this.health / this.healthMax);

    this.rect(
      -this.radius + this.radius / 15,
      -(this.radius * 2) + this.radius / 15,
      healthWidth,
      this.radius / 1.5 - (this.radius / 15) * 2
    );
    this.fill(0xfa0707);
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
