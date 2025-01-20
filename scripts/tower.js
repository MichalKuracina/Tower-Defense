class Tower extends PIXI.Sprite {
  constructor(
    texture,
    x = 0,
    y = 0,
    type = "standard",
    active = false,
    crownTexture = null
  ) {
    super(texture);
    this.x = x;
    this.y = y;
    this.type = type;
    this.active = active;
    this.crownTexture = crownTexture;
    this.maxLevel = 10;
    this.crownSprite = null;
    this.level = 1;
    this.damage = 1;
    this.rateOfFire = 1000;
    this.maxRateOfFire = 100;
    this.rateOfFire_incrementor = 100; // By how much you speed up when click on button upgrade.
    this.radius = 100;
    this.effect = "none";
    this.bullet_radius = 5;
    this.bullet_color = 0xf4fc03;
    this.bulletSpeed = 1;
    this.bullet_splashRadius = 0;
    this.bullet_slowCoefficient = 0;
    this.shotTimeElapsed = 0;
    this.detailTooltip = null;
    this.detailButtonUpgrade = null;
    this.detailButtonSell = null;
    this.cost = 5;
    this.cost_incrementor = 1;
    this.towerToolTip = null;
    this.towerCircle = null;
    this.towerButtonUpgdare = null;
    this.towerButtonSell = null;
    this.next_level = 0;
    this.next_cost = 0;
    this.next_damage = 0;
    this.next_rateOfFire = 0;
    this.next_bulletSpeed = 0;
    this.next_radius = 0;
    this.levelUpPin = false;
    this.zIndex = 1;
    this.maxedOut = false;

    this.initTower();
  }

  async initTower() {
    switch (this.type) {
      case "splash":
        this.maxLevel = 5;
        this.effect = "splash";
        this.bullet_radius = 5;
        this.bullet_color = 0x996863;
        this.maxRateOfFire = 200;
        this.bullet_splashRadius = 25;
        this.bullet_slowCoefficient = 0;

        this.level = 1;
        this.cost = 7;
        this.damage = 3;
        this.rateOfFire = 1500;
        this.bulletSpeed = 2.5;
        this.radius = 125;

        this.level_incrementor = 1;
        this.cost_incrementor = 20;
        this.damage_incrementor = 2;
        this.rateOfFire_incrementor = 100;
        this.bulletSpeed_incrementor = 0.2;
        this.radius_incrementor = 1.1;
        break;

      case "slow":
        this.maxLevel = 5;
        this.effect = "slow";
        this.bullet_radius = 4;
        this.bullet_color = 0x85b4f2;
        this.maxRateOfFire = 300;
        this.bullet_splashRadius = 0;
        this.bullet_slowCoefficient = 0.2;

        this.level = 1;
        this.cost = 6;
        this.damage = 2;
        this.rateOfFire = 2000;
        this.bulletSpeed = 2.4;
        this.radius = 100;

        this.level_incrementor = 1;
        this.cost_incrementor = 15;
        this.damage_incrementor = 1.7;
        this.rateOfFire_incrementor = 150;
        this.bulletSpeed_incrementor = 0.3;
        this.radius_incrementor = 1.2;
        break;

      default: // "standard"
        this.maxLevel = 5;
        this.effect = "none";
        this.bullet_radius = 3.5;
        this.bullet_color = 0x56a843;
        this.maxRateOfFire = 100;
        this.bullet_splashRadius = 0;
        this.bullet_slowCoefficient = 0;

        this.level = 1;
        this.cost = 5;
        this.damage = 1;
        this.rateOfFire = 1000;
        this.bulletSpeed = 2.8;
        this.radius = 200;

        this.level_incrementor = 1;
        this.cost_incrementor = 10;
        this.damage_incrementor = 1.2;
        this.rateOfFire_incrementor = 50;
        this.bulletSpeed_incrementor = 0.1;
        this.radius_incrementor = 1.05;
        break;
    }

    this.setNextLevelValues();

    this.position.set(this.x, this.y);
    this.anchor.set(0.5);
    this.label = this.type;
    this.name = this.type;
    this.eventMode = "static";
    this.width = 40;
    this.height = 40;

    this.addTowerSprites();
    this.destroyTowerSprites();
    this.towerToolTip.deactivate();

    this.on("pointerdown", this.clickOptions);

    this.on("pointerenter", (event) => {
      this.addTowerSprites();
    });

    this.on("pointerleave", (event) => {
      this.destroyTowerSprites();
      this.towerToolTip.deactivate();
    });

    if (this.active) {
      menu.substractGold(this.cost);
    }
  }

  clickOptions(event) {
    const buttonOption = this.checkTowerButtonClicked(
      event.data.global,
      this.uid
    );

    switch (buttonOption) {
      case "upgrade":
        this.upgrade();
        this.destroyTowerSprites();
        this.addTowerSprites();
        if (this.level === this.maxLevel) {
          this.addCrown();
        }
        break;
      case "sell":
        app.stage.removeChild(this);
        this.destroy();

        const towerIndex = towers.findIndex((obj) => obj["uid"] === this.uid);
        towers.splice(towerIndex, 1);
        this.destroyTowerSprites();
        menu.addGold(this.cost);

        if (this.levelUpPin) {
          this.removeLevelUpPin();
        }

        if (this.crownSprite) {
          this.removeCrown();
        }
        break;

      default:
        // Do nothing.
        break;
    }
  }

  addTowerSprites() {
    // console.log("add");
    this.cursor = "pointer";
    // Add circle.
    this.towerCircle = new TowerCircle(
      this.x,
      this.y,
      this.radius,
      this.bullet_color
    );
    app.stage.addChild(this.towerCircle);

    if (this.level >= this.maxLevel) {
      this.maxedOut = true;
    }

    // Add tooltip.
    this.towerToolTip = new TowerToolTip(
      this.x,
      this.y,
      this.type,
      this.damage,
      this.rateOfFire,
      this.radius,
      this.effect,
      this.bullet_color,
      this.width,
      this.height,
      this.uid,
      this.level,
      this.cost,
      this.bulletSpeed,
      this.next_level,
      this.next_cost,
      this.next_damage,
      this.next_rateOfFire,
      this.next_bulletSpeed,
      this.next_radius,
      this.maxedOut
    );
    app.stage.addChild(this.towerToolTip);
    this.towerToolTip.activate();

    if (this.active) {
      // Add upgrade button.
      if (this.cost <= menu.gold && this.level < this.maxLevel) {
        // if (this.cost + this.cost_incrementor <= menu.gold) { // why was this including 'this.cost_incrementor'?
        this.addUpgradeButton();
      }

      // Add sell button.
      this.towerButtonSell = new TowerButton(
        this.x - 16,
        this.y + 5,
        this.bullet_color,
        "Sell",
        "sell" + this.uid
      );
      app.stage.addChild(this.towerButtonSell);
    }
  }

  addUpgradeButton() {
    // Add upgrade button.
    this.towerButtonUpgdare = new TowerButton(
      this.x - 16,
      this.y - 14,
      this.bullet_color,
      "Upgrade",
      "upgrade" + this.uid
    );

    app.stage.addChild(this.towerButtonUpgdare);
  }

  removeUpgradeButton() {
    app.stage.removeChild(this.towerButtonUpgdare);
    this.towerButtonUpgdare.destroy();
  }

  destroyTowerSprites() {
    // console.log("destroy");

    // Destroy tooltip.
    app.stage.removeChild(this.towerToolTip);
    this.towerToolTip.destroy();
    // Destroy circle.
    app.stage.removeChild(this.towerCircle);
    this.towerCircle.destroy();
    if (this.active) {
      if (this.towerButtonUpgdare) {
        // Destroy upgrade button.
        app.stage.removeChild(this.towerButtonUpgdare);
        this.towerButtonUpgdare.destroy();
      }

      // Destroy sell button.
      app.stage.removeChild(this.towerButtonSell);
      this.towerButtonSell.destroy();
    }
  }

  setNextLevelValues() {
    this.next_level = this.level + this.level_incrementor;
    this.next_cost = this.cost + this.cost_incrementor * this.level;
    this.next_damage = this.damage + this.damage_incrementor * this.level;
    if (this.rateOfFire - this.rateOfFire_incrementor > this.maxRateOfFire) {
      // Max Rate of fire was not reached
      this.next_rateOfFire = this.rateOfFire - this.rateOfFire_incrementor;
    }
    this.next_bulletSpeed = this.bulletSpeed + this.bulletSpeed_incrementor;
    this.next_radius = Math.round(this.radius * this.radius_incrementor);
  }

  upgrade() {
    menu.substractGold(this.cost);
    this.setNextLevelValues();

    this.level = this.next_level;
    this.cost = this.next_cost;
    this.damage = this.next_damage;
    this.rateOfFire = this.next_rateOfFire;
    this.bulletSpeed = this.next_bulletSpeed;
    this.radius = this.next_radius;
    this.setNextLevelValues();
  }

  checkTowerButtonClicked(pointerPosition, towerUid) {
    const hitObjects = app.stage.children.filter((item) => {
      if (item) {
        return (
          pointerPosition.x > item.tower_x &&
          pointerPosition.x < item.tower_x + item.width &&
          pointerPosition.y > item.tower_y &&
          pointerPosition.y < item.tower_y + item.height &&
          (item.label === "upgrade" + towerUid ||
            item.label === "sell" + towerUid)
        );
      }
    });

    if (hitObjects.length === 0 || hitObjects.length > 1) {
      return "";
    } else {
      return hitObjects[0].text.toLowerCase();
    }
  }

  rotateTower(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    const angle = Math.atan2(dy, dx);
    const rotationOffset = Math.PI / 2;
    this.rotation = angle + rotationOffset;
  }

  shoot(enemy, deltaMS) {
    this.shotTimeElapsed += deltaMS;

    if (this.shotTimeElapsed >= this.rateOfFire) {
      //   console.log(this.shotTimeElapsed);
      this.shotTimeElapsed = 0;
      const enemy_x = enemy.x;
      const enemy_y = enemy.y;

      const dx = Math.abs(enemy_x - this.x);
      const dy = Math.abs(enemy_y - this.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > this.radius) {
        // Don't shoot. Target is out of range.
        return;
      }

      return new Bullet(
        this.x,
        this.y,
        this.x,
        this.y,
        enemy_x,
        enemy_y,
        this.bulletSpeed,
        this.bullet_radius,
        this.bullet_color,
        this.damage,
        this.bullet_splashRadius,
        this.bullet_slowCoefficient,
        this.effect,
        enemy.uid
      );
    }
  }

  getClosestEnemy(enemies) {
    let currentEnemyDistance;
    let closesEnemyDistance;
    let closesEnemyObject;

    for (let i = 0; i < enemies.length; i++) {
      // Q1
      if (enemies[i].y <= this.y && enemies[i].x > this.x) {
        //   console.log("Q1");
        const a = this.y - enemies[i].y;
        const b = enemies[i].x - this.x;
        currentEnemyDistance = Math.sqrt(a * a + b * b);
      }

      // Q2
      if (enemies[i].y < this.y && enemies[i].x <= this.x) {
        //   console.log("Q2");
        const a = this.y - enemies[i].y;
        const b = this.x - enemies[i].x;
        currentEnemyDistance = Math.sqrt(a * a + b * b);
      }

      // Q3
      if (enemies[i].y >= this.y && enemies[i].x < this.x) {
        //   console.log("Q3");
        const a = enemies[i].y - this.y;
        const b = this.x - enemies[i].x;
        currentEnemyDistance = Math.sqrt(a * a + b * b);
      }

      // Q4
      if (enemies[i].y > this.y && enemies[i].x >= this.x) {
        //   console.log("Q4");
        const a = enemies[i].y - this.y;
        const b = enemies[i].x - this.x;
        currentEnemyDistance = Math.sqrt(a * a + b * b);
      }

      if (i === 0) {
        closesEnemyDistance = currentEnemyDistance;
        closesEnemyObject = enemies[i];
        continue;
      }

      if (currentEnemyDistance < closesEnemyDistance) {
        closesEnemyDistance = currentEnemyDistance;
        closesEnemyObject = enemies[i];
      }
    }
    // console.log(closesEnemyObject.x);
    return closesEnemyObject;
  }

  refreshButtonSprite(gold) {
    if (gold < this.cost) {
      this.tint = 0x9c9a95;
      this.eventMode = "none";
    } else {
      this.eventMode = "static";
      this.cursor = "pointer";
      this.tint = 16777215;
    }
  }

  addLevelUpPin() {
    if (this.level === this.maxLevel) {
      return;
    }
    this.levelUpPin = PIXI.Sprite.from(levelUpTexture);
    this.levelUpPin.anchor.set(0.5);
    this.levelUpPin.width = 24;
    this.levelUpPin.height = 24;
    this.levelUpPin.tint = 0x00ff00;
    this.levelUpPin.position.set(this.x - 12, this.y - 18);
    this.levelUpPin.zIndex = 999;
    app.stage.addChild(this.levelUpPin);
  }

  addCrown() {
    if (this.crownTexture === null) {
      return;
    }
    this.crownSprite = PIXI.Sprite.from(this.crownTexture);
    this.crownSprite.anchor.set(0.5);
    this.crownSprite.width = 16;
    this.crownSprite.height = 16;
    this.crownSprite.position.set(this.x - 12, this.y - 18);
    this.crownSprite.zIndex = 999;
    app.stage.addChild(this.crownSprite);
  }

  removeLevelUpPin() {
    app.stage.removeChild(this.levelUpPin);
    if (this.levelUpPin) {
      // There is was a scenario where the function was triggered even though 'this.levelUpPin' was nothing, so handle this
      this.levelUpPin.destroy();
    }
    this.levelUpPin = null;
  }

  removeCrown() {
    app.stage.removeChild(this.crownSprite);
    this.crownSprite.destroy();
    this.crownSprite = null;
  }
}
