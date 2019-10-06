export default class pauseScene extends Phaser.Scene {
    constructor() {
      super({ key: 'pauseScene' });
    }

    create() {

        const text = "Paused!\nEnter or P to Play!";
        this.startText = this.add.text(320, 200, text, { font: '24px gameFont', fill: '#424340', align: 'center' });
        this.startText.setOrigin(0.5, 0.5).setScrollFactor(0);

        this.keys = {};
        this.keys.pause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keys.pause2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    }

    update() {
      if(Phaser.Input.Keyboard.JustDown(/*this.controls.keys.pause*/this.keys.pause) || Phaser.Input.Keyboard.JustDown(/*this.controls.keys.pause2*/this.keys.pause2)) {
        this.startText.setText('');
        this.scene.resume('levelScene');
      }
    }
  
  }