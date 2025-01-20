class Menu extends PIXI.Container {
  constructor(
    menuHeight,
    worldEditorSprite,
    loadSprite,
    saveSprite,
    heartSprite,
    towerSpritesheet,
    gold,
    lives,
    playPauseSpritesheet
  ) {
    super();
    this.menuHeight = menuHeight;
    this.gold = gold;
    this.lives = lives;
    this.roundCounter = 1;
    this.worldEditorSprite = worldEditorSprite;
    this.loadSprite = loadSprite;
    this.saveSprite = saveSprite;
    this.heartSprite = heartSprite;
    this.towerSpritesheet = towerSpritesheet;
    this.playPauseSpritesheet = playPauseSpritesheet;
    this.roundsLbl_x = 240;
    this.wrldEditor_x = 45;
    this.heartIcon_x = 250;
    this.menuIcon1_x = 390;
    this.menuIcon2_x = 440;
    this.menuIcon3_x = 490;
    this.menuIcon4_x = 576;
    this.menuIcon_y = 64;
    this.paused = true;
  }

  async initMenu() {
    this.drawMenuBackground();
    const [
      towerStandardTexture,
      towerSplashTexture,
      towerSlowTexture,
      coinTexture,
      playTexture,
      pauseTexture,
    ] = await this.getSprites();

    this.drawMenuIcons(
      towerStandardTexture,
      towerSplashTexture,
      towerSlowTexture,
      coinTexture,
      playTexture,
      pauseTexture
    );
    this.label = "menuTile";

    this.standardBtn.refreshButtonSprite(this.gold);
    this.splashBtn.refreshButtonSprite(this.gold);
    this.slowBtn.refreshButtonSprite(this.gold);
  }

  drawMenuIcons(
    towerStandardTexture,
    towerSplashTexture,
    towerSlowTexture,
    coinTexture,
    playTexture,
    pauseTexture
  ) {
    // Play button
    this.playBtn = new MenuButton(playTexture, "play", 45, 32);
    this.playBtn.deactivate();
    this.addChild(this.playBtn);
    // Pause button
    this.pauseBtn = new MenuButton(pauseTexture, "pause", 105, 32);
    this.pauseBtn.activate();
    this.addChild(this.pauseBtn);
    // Rounds
    this.roundsLbl = new MenuButtonLabel(
      "rounds",
      this.roundsLbl_x,
      this.menuIcon_y + 25,
      0,
      0,
      0,
      `Round: ${this.roundCounter}`
    );
    this.addChild(this.roundsLbl);

    // World Editor button
    this.worldEditorBtn = new MenuButton(
      this.worldEditorSprite,
      "wrldEditor",
      this.wrldEditor_x,
      this.menuIcon_y + 24
    );
    this.worldEditorBtn.eventMode = "static";
    this.worldEditorBtn.cursor = "pointer";
    this.addChild(this.worldEditorBtn);

    // Save button
    this.saveBtn = new MenuButton(this.saveSprite, "saveBtn", 115, 85);
    this.saveBtn.deactivate();
    this.addChild(this.saveBtn);

    // Load button
    this.loadBtn = new MenuButton(this.loadSprite, "loadBtn", 185, 85);
    this.loadBtn.deactivate();
    this.addChild(this.loadBtn);

    // Heart button
    this.heartBtn = new MenuButton(
      this.heartSprite,
      "heart",
      this.heartIcon_x + 3,
      this.menuIcon_y - 8
    );
    this.addChild(this.heartBtn);

    this.heartLbl = new MenuButtonLabel(
      "heart",
      this.heartIcon_x - 20,
      this.menuIcon_y,
      this.gold,
      0,
      this.lives
    );
    this.addChild(this.heartLbl);

    // Standard button
    this.standardBtn = new Tower(
      towerStandardTexture,
      this.menuIcon1_x,
      this.menuIcon_y,
      "standard",
      false,
      null
    );
    this.addChild(this.standardBtn);
    this.standardLbl = new MenuButtonLabel(
      "standard",
      this.menuIcon1_x,
      this.menuIcon_y,
      this.gold,
      this.standardBtn.cost
    );

    this.addChild(this.standardLbl);
    // Splash button
    this.splashBtn = new Tower(
      towerSplashTexture,
      this.menuIcon2_x,
      this.menuIcon_y,
      "splash",
      false,
      null
    );
    this.addChild(this.splashBtn);
    this.splashLbl = new MenuButtonLabel(
      "splash",
      this.menuIcon2_x,
      this.menuIcon_y,
      this.gold,
      this.splashBtn.cost
    );

    this.addChild(this.splashLbl);
    // Slow button
    this.slowBtn = new Tower(
      towerSlowTexture,
      this.menuIcon3_x,
      this.menuIcon_y,
      "slow",
      false,
      null
    );
    this.addChild(this.slowBtn);
    this.slowLbl = new MenuButtonLabel(
      "slow",
      this.menuIcon3_x,
      this.menuIcon_y,
      this.gold,
      this.slowBtn.cost
    );

    this.addChild(this.slowLbl);
    // Coin button
    this.coinBtn = new MenuButton(
      coinTexture,
      "coin",
      this.menuIcon4_x,
      this.menuIcon_y
    );
    this.addChild(this.coinBtn);

    this.coinLbl = new MenuButtonLabel(
      "coin",
      this.menuIcon4_x,
      this.menuIcon_y,
      this.gold
    );

    this.addChild(this.coinLbl);

    // console.log(this.heartBtn);
  }

  updateRoundCounter(roundNumber) {
    this.roundCounter = roundNumber;
    this.roundsLbl.getChildByLabel(
      "rounds"
    ).text = `Round: ${this.roundCounter}`;
  }

  addGold(amount) {
    this.gold = this.gold + amount;
    if (this.gold > 999) {
      this.gold = 999;
    }
    this.standardBtn.refreshButtonSprite(this.gold);
    this.splashBtn.refreshButtonSprite(this.gold);
    this.slowBtn.refreshButtonSprite(this.gold);
    this.coinLbl.getChildByLabel("coin").text = `${this.gold}€`;
  }

  substractGold(amount) {
    this.gold = this.gold - amount;
    if (this.gold < 0) {
      this.gold = 0;
    }
    this.standardBtn.refreshButtonSprite(this.gold);
    this.splashBtn.refreshButtonSprite(this.gold);
    this.slowBtn.refreshButtonSprite(this.gold);
    this.coinLbl.getChildByLabel("coin").text = `${this.gold}€`;
  }

  substractLives(amount) {
    this.lives = this.lives - amount;
    if (this.lives < 0) {
      this.lives = 0;
    }

    this.heartLbl.getChildByLabel("heart").text = this.lives;
  }

  addLives(amount) {
    this.lives = this.lives + amount;
    this.heartLbl.getChildByLabel("heart").text = this.lives;
    // console.log(this.heartBtn);
  }

  updateLives(livesNumber) {
    this.heartLbl.getChildByLabel("heart").text = livesNumber;
  }

  async getSprites() {
    // Standard button
    const towerStandardTexture = new PIXI.Sprite(
      this.towerSpritesheet.textures["standard"]
    );
    const towerSplashTexture = new PIXI.Sprite(
      this.towerSpritesheet.textures["splash"]
    );
    const towerSlowTexture = new PIXI.Sprite(
      this.towerSpritesheet.textures["slow"]
    );
    const coinTexture = new PIXI.Sprite(this.towerSpritesheet.textures["coin"]);
    const playTexture = new PIXI.Sprite(
      this.playPauseSpritesheet.textures["play"]
    );
    const pauseTexture = new PIXI.Sprite(
      this.playPauseSpritesheet.textures["pause"]
    );
    return [
      towerStandardTexture,
      towerSplashTexture,
      towerSlowTexture,
      coinTexture,
      playTexture,
      pauseTexture,
    ];
  }

  drawMenuBackground() {
    // Background
    const backGround = new PIXI.Graphics();
    backGround.rect(0, 0, canvasWidth, this.menuHeight);
    backGround.fill(0x4d3b25);
    this.addChild(backGround);
    // Separator
    const lineSeparator = new PIXI.Graphics();
    lineSeparator.moveTo(0, this.menuHeight);
    lineSeparator.lineTo(canvasWidth, this.menuHeight);
    lineSeparator.stroke({ width: 8, color: 0x2a4d1d, alpha: 1 });
    this.addChild(lineSeparator);
  }
}
