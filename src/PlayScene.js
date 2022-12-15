import Phaser from 'phaser';

const LIFE_STAGE = {
  KID: 'kid',
  TEEN: 'teen',
  ADULT: 'adult',
  SENIOR: 'senior',
};

const OBSTACLES_CONSTANT = {
  [LIFE_STAGE.KID]: 0.16,
  [LIFE_STAGE.TEEN]: 0.1,
  [LIFE_STAGE.ADULT]: 0.08,
  [LIFE_STAGE.SENIOR]: 0.2,
};

const OBSTACLES_DISTANCE = {
  [LIFE_STAGE.KID]: 400,
  [LIFE_STAGE.TEEN]: 500,
  [LIFE_STAGE.ADULT]: 600,
  [LIFE_STAGE.SENIOR]: 400,
};

const INITIAL_GAME_SPEED = 10;
class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const { height, width } = this.game.config;
    this.gameSpeed = INITIAL_GAME_SPEED;
    this.isGameRunning = false;
    this.respawnTime = 0;
    this.score = 0;
    this.lifeStage = LIFE_STAGE.KID;

    this.jumpSound = this.sound.add('jump', { volume: 0.2 });
    this.hitSound = this.sound.add('hit', { volume: 0.2 });
    this.reachSound = this.sound.add('reach', { volume: 0.2 });

    this.startTrigger = this.physics.add
      .sprite(0, 10)
      .setOrigin(0, 1)
      .setImmovable();
    this.ground = this.add
      .tileSprite(0, height, 88, 26, 'ground')
      .setOrigin(0, 1);
    this.mainCharacter = this.physics.add
      .sprite(0, height, `${this.lifeStage}-idle`)
      .setCollideWorldBounds(true)
      .setGravityY(5000)
      .setBodySize(44, 92)
      .setDepth(1)
      .setOrigin(0, 1);

    this.scoreText = this.add
      .text(width, 0, '00000', {
        fill: '#535353',
        font: '900 35px Courier',
        resolution: 5,
      })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.highScoreText = this.add
      .text(0, 0, '00000', {
        fill: '#535353',
        font: '900 35px Courier',
        resolution: 5,
      })
      .setOrigin(1, 0)
      .setAlpha(0);

    this.environment = this.add.group();
    this.environment.addMultiple([
      this.add.image(width / 2, 170, 'cloud'),
      this.add.image(width - 80, 80, 'cloud'),
      this.add.image(width / 1.3, 100, 'cloud'),
    ]);
    this.environment.setAlpha(0);

    this.gameOverScreen = this.add
      .container(width / 2, height / 2 - 50)
      .setAlpha(0);
    this.gameOverText = this.add.image(0, 0, 'game-over');
    this.restart = this.add.image(0, 80, 'restart').setInteractive();
    this.gameOverScreen.add([this.gameOverText, this.restart]);

    this.obstacles = this.physics.add.group();

    this.initAnims();
    this.initStartTrigger();
    this.initColliders();
    this.handleInputs();
    this.handleScore();
  }

  initColliders() {
    this.physics.add.collider(
      this.mainCharacter,
      this.obstacles,
      () => {
        this.highScoreText.x = this.scoreText.x - this.scoreText.width - 20;

        const highScore = this.highScoreText.text.substr(
          this.highScoreText.text.length - 5,
        );
        const newScore =
          Number(this.scoreText.text) > Number(highScore)
            ? this.scoreText.text
            : highScore;

        this.highScoreText.setText('HI ' + newScore);
        this.highScoreText.setAlpha(1);

        this.physics.pause();
        this.isGameRunning = false;
        this.anims.pauseAll();
        this.mainCharacter.setTexture(`${this.lifeStage}-hurt`);
        this.respawnTime = 0;
        this.gameSpeed = INITIAL_GAME_SPEED;
        this.gameOverScreen.setAlpha(1);
        this.score = 0;
        this.hitSound.play();
      },
      null,
      this,
    );
  }

  initStartTrigger() {
    const { width, height } = this.game.config;
    this.physics.add.overlap(
      this.startTrigger,
      this.mainCharacter,
      () => {
        if (this.startTrigger.y === 10) {
          this.startTrigger.body.reset(0, height);
          return;
        }

        this.startTrigger.disableBody(true, true);

        const startEvent = this.time.addEvent({
          delay: 1000 / 60,
          loop: true,
          callbackScope: this,
          callback: () => {
            this.mainCharacter.setVelocityX(80);
            this.mainCharacter.play(`${this.lifeStage}-run`, 1);

            if (this.ground.width < width) {
              this.ground.width += 17 * 2;
            }

            if (this.ground.width >= 1000) {
              this.ground.width = width;
              this.isGameRunning = true;
              this.mainCharacter.setVelocityX(0);
              this.scoreText.setAlpha(1);
              this.environment.setAlpha(1);
              startEvent.remove();
            }
          },
        });
      },
      null,
      this,
    );
  }

  initAnims() {
    this.anims.create({
      key: 'kid-run',
      frames: this.anims.generateFrameNumbers('kid-texture', {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'teen-run',
      frames: this.anims.generateFrameNumbers('teen-texture', {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'adult-run',
      frames: this.anims.generateFrameNumbers('adult-texture', {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'senior-run',
      frames: this.anims.generateFrameNumbers('senior-texture', {
        start: 2,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'enemy-dino-fly',
      frames: this.anims.generateFrameNumbers('enemy-bird', {
        start: 0,
        end: 1,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }

  handleScore() {
    this.time.addEvent({
      delay: 1000 / 10,
      loop: true,
      callbackScope: this,
      callback: () => {
        if (!this.isGameRunning) {
          return;
        }

        this.score++;
        this.gameSpeed += 0.01;

        if (this.score % 100 === 0) {
          this.reachSound.play();

          this.tweens.add({
            targets: this.scoreText,
            duration: 100,
            repeat: 3,
            alpha: 0,
            yoyo: true,
          });
        }

        const score = Array.from(String(this.score), Number);
        for (let i = 0; i < 5 - String(this.score).length; i++) {
          score.unshift(0);
        }

        this.scoreText.setText(score.join(''));
      },
    });
  }

  handleInputs() {
    this.restart.on('pointerdown', () => {
      this.mainCharacter.setVelocityY(0);
      this.mainCharacter.body.height = 92;
      this.mainCharacter.body.offset.y = 0;
      this.physics.resume();
      this.obstacles.clear(true, true);
      this.isGameRunning = true;
      this.gameOverScreen.setAlpha(0);
      this.anims.resumeAll();
    });

    const handleJump = () => {
      if (
        !this.mainCharacter.body.onFloor() ||
        this.mainCharacter.body.velocity.x > 0
      ) {
        return;
      }
      console.log(this.lifeStage);

      this.jumpSound.play();
      this.mainCharacter.body.height = 92;
      this.mainCharacter.body.offset.y = 0;
      this.mainCharacter.setVelocityY(-1600);
      this.mainCharacter.setTexture(`${this.lifeStage}-texture`, 0);
    };

    this.input.on('pointerdown', handleJump);

    this.input.keyboard.on('keydown_SPACE', handleJump);
  }

  placeObstacle() {
    const obstacleNum = Math.floor(Math.random() * 7) + 1;
    const distanceBase = OBSTACLES_DISTANCE[this.lifeStage];
    const distance = Phaser.Math.Between(distanceBase, distanceBase * 1.5);

    let obstacle;
    if (obstacleNum > 6) {
      const enemyHeight = [20, 50];
      obstacle = this.obstacles
        .create(
          this.game.config.width + distance,
          this.game.config.height - enemyHeight[Math.floor(Math.random() * 2)],
          `enemy-bird`,
        )
        .setOrigin(0, 1);
      obstacle.play('enemy-dino-fly', 1);
      obstacle.body.height = obstacle.body.height / 1.5;
    } else {
      obstacle = this.obstacles
        .create(
          this.game.config.width + distance,
          this.game.config.height,
          `obstacle-${obstacleNum}`,
        )
        .setOrigin(0, 1);

      obstacle.body.offset.y = +10;
    }

    obstacle.setImmovable();
  }

  update_lifeStage() {
    if (this.score >= 0 && this.score < 100) {
      this.lifeStage = LIFE_STAGE.KID;
    } else if (this.score >= 100 && this.score < 200) {
      this.lifeStage = LIFE_STAGE.TEEN;
    } else if (this.score >= 200 && this.score < 300) {
      this.lifeStage = LIFE_STAGE.ADULT;
    } else {
      this.lifeStage = LIFE_STAGE.SENIOR;
    }
  }

  update(time, delta) {
    if (!this.isGameRunning) {
      return;
    }

    this.update_lifeStage();

    this.ground.tilePositionX += this.gameSpeed;
    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.environment.getChildren(), -0.5);

    this.respawnTime +=
      delta * this.gameSpeed * OBSTACLES_CONSTANT[this.lifeStage];
    if (this.respawnTime >= 1500) {
      this.placeObstacle();
      this.respawnTime = 0;
    }

    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.getBounds().right < 0) {
        this.obstacles.killAndHide(obstacle);
      }
    });

    this.environment.getChildren().forEach(env => {
      if (env.getBounds().right < 0) {
        env.x = this.game.config.width + 30;
      }
    });

    if (this.mainCharacter.body.deltaAbsY() > 0) {
      this.mainCharacter.anims.stop();
      this.mainCharacter.setTexture(`${this.lifeStage}-texture`, 0);
    } else {
      this.mainCharacter.play(`${this.lifeStage}-run`, true);
    }
  }
}

export default PlayScene;
