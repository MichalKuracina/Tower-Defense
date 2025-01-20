class TowerToolTip extends PIXI.Graphics {
  constructor(
    x = 0,
    y = 0,
    type = "standard",
    damage = 1,
    rateOfFire = 1000,
    radius = 100,
    effect = "none",
    color = 0x56a843,
    towerWidth = 0,
    towerHeight = 0,
    towerUid = null,
    level = 1,
    cost = 5,
    bulletSpeed = 1,
    next_level,
    next_cost,
    next_damage,
    next_rateOfFire,
    next_bulletSpeed,
    next_radius,
    maxedOut
  ) {
    super();
    this.tower_x = x;
    this.tower_y = y;
    this.type = type;
    this.damage = damage;
    this.rateOfFire = rateOfFire;
    this.radius = radius;
    this.effect = effect;
    this.color = color;
    this.towerWidth = towerWidth;
    this.towerHeight = towerHeight;
    this.towerUid = "towerToolTip" + towerUid;
    this.level = level;
    this.cost = cost;
    this.bulletSpeed = bulletSpeed;
    this.toolTipWidth = 145; // arbitrary num
    this.toolTipHeight = 113; // arbitrary num
    this.toolTip_x = 0;
    this.toolTip_y = 0;
    this.toolTipCorners = 5;
    this.toolTipGap = 5; // gap between tooltip and tower
    this.toolTipActive = false; // to determine which tooptip to update when gold is changing
    this.toolTipTextStart = 4; // where the first row starts
    this.toolTipTextRowOffset = 13; // gap between rows
    this.next_level = next_level;
    this.next_cost = next_cost;
    this.next_damage = next_damage;
    this.next_rateOfFire = next_rateOfFire;
    this.next_bulletSpeed = next_bulletSpeed;
    this.next_radius = next_radius;
    this.maxedOut = maxedOut;

    this.zIndex = 999;
    // this.towerIsActive = false;

    this.initTowerDetail();
  }

  async initTowerDetail() {
    this.eventMode = "none";
    const canvasWidth = app.renderer.width;
    const canvasHeight = app.renderer.height;

    this.toolTip_x = this.tower_x + this.towerWidth / 2 + this.toolTipGap;
    this.toolTip_y = this.tower_y - this.towerHeight / 2;

    if (this.toolTip_x + this.toolTipWidth > canvasWidth) {
      this.toolTip_x =
        this.tower_x -
        this.towerWidth / 2 -
        this.toolTipGap -
        this.toolTipWidth;
    }

    if (this.toolTip_y + this.toolTipHeight > canvasHeight) {
      this.toolTip_x = this.tower_x - this.towerWidth / 2;
      this.toolTip_y =
        this.tower_y -
        this.towerHeight / 2 -
        this.toolTipGap -
        this.toolTipHeight;
    }

    if (
      this.toolTip_y + this.toolTipHeight > canvasHeight ||
      this.toolTip_x + this.toolTipWidth > canvasWidth
    ) {
      this.toolTip_x =
        this.tower_x -
        this.towerWidth / 2 -
        this.toolTipGap -
        this.toolTipWidth;
      this.toolTip_y =
        this.tower_y -
        this.towerHeight / 2 -
        this.toolTipGap -
        this.toolTipHeight;
    }

    this.roundRect(
      this.toolTip_x,
      this.toolTip_y,
      this.toolTipWidth,
      this.toolTipHeight,
      this.toolTipCorners
    );
    this.fill(0x000000);

    this.roundRect(
      this.toolTip_x + 2,
      this.toolTip_y + 2,
      this.toolTipWidth - 4,
      this.toolTipHeight - 4,
      this.toolTipCorners - 1
    );
    this.fill(this.color);

    if (!this.maxedOut) {
      this.writeEntry(
        "Type",
        String(this.type).charAt(0).toUpperCase() + String(this.type).slice(1),
        ""
      );
      this.writeEntry("Level", this.level, this.next_level);
      this.writeEntry("Cost", this.cost, this.next_cost);
      this.writeEntry("Damage", this.damage, this.next_damage);
      this.writeEntry("Rate of fire", this.rateOfFire, this.next_rateOfFire);
      this.writeEntry(
        "Bullet speed",
        Math.round(this.bulletSpeed * 100) / 100,
        Math.round(this.next_bulletSpeed * 100) / 100
      );
      this.writeEntry("Radius", this.radius, this.next_radius);
      this.writeEntry("Effect", this.effect, "");
    } else {
      // Tower is max level, so tooltip will look a bit different
      this.writeEntry(
        "Type",
        String(this.type).charAt(0).toUpperCase() +
          String(this.type).slice(1) +
          " MAX",
        ""
      );
      this.writeEntry("Level", this.level, "");
      this.writeEntry("Cost", this.cost, "");
      this.writeEntry("Damage", this.damage, "");
      this.writeEntry("Rate of fire", this.rateOfFire, "");
      this.writeEntry(
        "Bullet speed",
        Math.round(this.bulletSpeed * 100) / 100,
        ""
      );
      this.writeEntry("Radius", this.radius, "");
      this.writeEntry("Effect", this.effect, "");
    }
  }

  writeEntry(key, value, value2) {
    const fontStyle = {
      fontSize: 12,
      align: "left",
      fill: 0x000000, // black
    };

    const fontStyle2 = {
      fontSize: 12,
      align: "left",
      fill: 0xff0000, // red
    };

    const lbl = new PIXI.BitmapText({
      text: `${key}: ${value}`,
      style: fontStyle,
    });

    lbl.x = this.toolTip_x + 5;
    lbl.y = this.toolTip_y + this.toolTipTextStart;

    if (value2 !== "") {
      // 'Next' value must be entered
      // Opening round brackets
      const lbl2 = new PIXI.BitmapText({
        text: "(",
        style: fontStyle,
      });

      lbl2.x = this.toolTip_x + 5 + lbl.width + 5;
      lbl2.y = this.toolTip_y + this.toolTipTextStart;
      this.addChild(lbl2);

      // 'Next' value
      const lbl3 = new PIXI.BitmapText({
        text: `${value2}`,
        style: fontStyle2,
      });

      lbl3.x = this.toolTip_x + 5 + lbl.width + 10;
      lbl3.y = this.toolTip_y + this.toolTipTextStart;
      this.addChild(lbl3);

      // Closing round brackets
      const lbl4 = new PIXI.BitmapText({
        text: ")",
        style: fontStyle,
      });

      lbl4.x = this.toolTip_x + 5 + lbl.width + lbl3.width + 12;
      lbl4.y = this.toolTip_y + this.toolTipTextStart;
      this.addChild(lbl4);
    }
    this.toolTip_y = this.toolTip_y + this.toolTipTextRowOffset;
    this.addChild(lbl);
  }

  activate() {
    this.toolTipActive = true;
  }

  deactivate() {
    this.toolTipActive = false;
  }
}
