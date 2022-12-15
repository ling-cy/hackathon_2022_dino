import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.audio('jump', 'assets/jump.m4a');
    this.load.audio('hit', 'assets/hit.m4a');
    this.load.audio('reach', 'assets/reach.m4a');

    this.load.image('ground', 'assets/ground.png');
    this.load.image('kid-idle', 'assets/kid-idle.png');
    this.load.image('kid-hurt', 'assets/kid-hurt.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.image('game-over', 'assets/game-over.png');
    this.load.image('cloud', 'assets/cloud.png');

    this.load.spritesheet('star', 'assets/stars.png', {
      frameWidth: 9,
      frameHeight: 9,
    });

    this.load.spritesheet('moon', 'assets/moon.png', {
      frameWidth: 20,
      frameHeight: 40,
    });

    this.load.spritesheet('kid-run', 'assets/kid-run.png', {
      frameWidth: 88,
      frameHeight: 94,
    });

    this.load.spritesheet('teen-run', 'assets/dino-down.png', {
      frameWidth: 118,
      frameHeight: 94,
    });

    // this.load.spritesheet('enemy-bird', 'assets/enemy-bird.png', {
    //   frameWidth: 92,
    //   frameHeight: 77,
    // });

    this.load.spritesheet('enemy-bird', 'assets/enemy-bird-virus.png', {
      frameWidth: 92,
      frameHeight: 77,
    });
    //
    // this.load.image('obstacle-1', 'assets/cactuses_small_1.png');
    // this.load.image('obstacle-2', 'assets/cactuses_small_2.png');
    // this.load.image('obstacle-3', 'assets/cactuses_small_3.png');
    // this.load.image('obstacle-4', 'assets/cactuses_big_1.png');
    // this.load.image('obstacle-5', 'assets/cactuses_big_2.png');
    // this.load.image('obstacle-6', 'assets/cactuses_big_3.png');

    // can adjust duplicate and adjust the file virus.png & virus_red.png
    this.load.image('obstacle-1', 'assets/virus_small_1.png');
    this.load.image('obstacle-2', 'assets/virus_small_2.png');
    this.load.image('obstacle-3', 'assets/virus_small_3.png');
    this.load.image('obstacle-4', 'assets/virus_big_1.png');
    this.load.image('obstacle-5', 'assets/virus_big_2.png');
    this.load.image('obstacle-6', 'assets/virus_big_3.png');
  }

  create() {
    this.scene.start('PlayScene');
  }
}

export default PreloadScene;
