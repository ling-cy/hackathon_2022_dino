import Phaser from 'phaser';

class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene');
  }

  create() {
    const { height, width } = this.game.config;
    this.gameSpeed = 10;
    this.isGameRunning = false;
    this.respawnTime = 0;
    this.score = 0;
    this.life = 1;

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
    this.dino = this.physics.add
      .sprite(0, height, 'boy-idle')
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

    this.lifeText = this.add
      .text(width, this.scoreText.height + 20, '1', {
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
    this.armours = this.physics.add.group();

    this.initAnims();
    this.initStartTrigger();
    this.initColliders();
    this.handleInputs();
    this.handleScore();
  }

  initColliders() {
    this.physics.add.collider(
      this.dino,
      this.obstacles,
      (dino, obstacle) => {
        this.life--;
        if (this.life <= 0) {
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
          this.dino.setTexture('boy-hurt');
          this.respawnTime = 0;
          this.gameSpeed = 10;
          this.gameOverScreen.setAlpha(1);
          this.score = 0;
        } else {
          obstacle.disableBody(true, true);
        }
        this.setLifeText();
        this.hitSound.play();
      },
      null,
      this,
    );

    this.physics.add.overlap(
      this.dino,
      this.armours,
      (dino, armour) => {
        this.life++;
        armour.disableBody(true, true);
        this.setLifeText();
      },
      null,
      this,
    );
  }

  initStartTrigger() {
    const { width, height } = this.game.config;
    this.physics.add.overlap(
      this.startTrigger,
      this.dino,
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
            this.dino.setVelocityX(80);
            this.dino.play('boy-run', 1);

            if (this.ground.width < width) {
              this.ground.width += 17 * 2;
            }

            if (this.ground.width >= 1000) {
              this.ground.width = width;
              this.isGameRunning = true;
              this.dino.setVelocityX(0);
              this.scoreText.setAlpha(1);
              this.environment.setAlpha(1);
              this.setLifeText();
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
      key: 'boy-run',
      frames: this.anims.generateFrameNumbers('dino', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'dino-down-anim',
      frames: this.anims.generateFrameNumbers('dino-down', {
        start: 0,
        end: 1,
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

    this.anims.create({
      key: 'armour',
      frames: this.anims.generateFrameNumbers('armour', {
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
      this.life = 1;
      this.setLifeText();
      this.dino.setVelocityY(0);
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
      this.physics.resume();
      this.obstacles.clear(true, true);
      this.armours.clear(true, true);
      this.isGameRunning = true;
      this.gameOverScreen.setAlpha(0);
      this.anims.resumeAll();
    });

    const handleJump = () => {
      if (!this.dino.body.onFloor() || this.dino.body.velocity.x > 0) {
        return;
      }

      this.jumpSound.play();
      this.dino.body.height = 92;
      this.dino.body.offset.y = 0;
      this.dino.setVelocityY(-1600);
      this.dino.setTexture('dino', 0);
    };

    this.input.on('pointerdown', handleJump);

    this.input.keyboard.on('keydown_SPACE', handleJump);

    // this.input.keyboard.on('keydown_DOWN', () => {
    //   if (!this.dino.body.onFloor() || !this.isGameRunning) {
    //     return;
    //   }

    //   this.dino.body.height = 58;
    //   this.dino.body.offset.y = 34;
    // });

    // this.input.keyboard.on('keyup_DOWN', () => {
    //   if (this.score !== 0 && !this.isGameRunning) {
    //     return;
    //   }

    //   this.dino.body.height = 92;
    //   this.dino.body.offset.y = 0;
    // });
  }

  placeObstacle() {
    const obstacleNum = Math.floor(Math.random() * 7) + 1;
    const distance = Phaser.Math.Between(600, 900);

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

  placeArmour() {
    const hasArmour = Math.floor(Math.random() * 1000) / 900; //TODO: lesser when dino older
    const distance = Phaser.Math.Between(300, 400);

    if (hasArmour >= 1) {
      let armour;
      armour = this.armours
        .create(
          this.game.config.width + distance,
          this.game.config.height,
          'armour',
        )
        .setOrigin(0, 1);
      armour.play('armour', 1);
      armour.body.offset.y = +10;
      armour.setImmovable();
    }
  }

  setLifeText() {
    this.lifeText.setText('LIFE x' + this.life);
    this.lifeText.setAlpha(1);
  }

  update(time, delta) {
    if (!this.isGameRunning) {
      return;
    }

    this.ground.tilePositionX += this.gameSpeed;
    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.armours.getChildren(), -this.gameSpeed);
    Phaser.Actions.IncX(this.environment.getChildren(), -0.5);

    this.respawnTime += delta * this.gameSpeed * 0.08;
    if (this.respawnTime >= 1500) {
      this.placeObstacle();
      this.placeArmour();
      this.respawnTime = 0;
    }

    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle.getBounds().right < 0) {
        this.obstacles.killAndHide(obstacle);
      }
    });

    this.armours.getChildren().forEach(armour => {
      if (armour.getBounds().right < 0) {
        this.armours.killAndHide(armour);
      }
    });

    this.environment.getChildren().forEach(env => {
      if (env.getBounds().right < 0) {
        env.x = this.game.config.width + 30;
      }
    });

    if (this.dino.body.deltaAbsY() > 0) {
      this.dino.anims.stop();
      this.dino.setTexture('dino', 0);
    } else {
      this.dino.body.height <= 58
        ? this.dino.play('dino-down-anim', true)
        : this.dino.play('boy-run', true);
    }
  }
}

export default PlayScene;
