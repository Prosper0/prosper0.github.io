import Player from "./player.js";

export default class levelScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'levelScene'
        });
    }

    preload() {
        this.load.image("ship", "assets/ship2.png");
        this.load.image("bullets", "assets/bullet.png");
        this.load.image("asteroidBlack", "assets/asteroidb.png");
        this.load.image("asteroidBlue", "assets/asteroidblue.png");
        this.load.image("asteroidGreen", "assets/asteroidg.png");
        this.load.image("shield", "assets/shield2.png");
        this.load.image("gold", "assets/coin.png");
        this.load.image("particleRed", "assets/particleRed.png");
        this.load.image("particleGreen", "assets/particleGreen.png");
        this.load.image("particleBlue", "assets/particleBlue.png");
        this.load.scenePlugin('WeaponPlugin', 'lib/WeaponPlugin.js', null, 'weapons');
        
        this.load.audio('music1', 'assets/MainMusic.mp3', null);
        this.load.audio('music2', 'assets/PlayMusic1.mp3', null);
        this.load.audio('music3', 'assets/PlayMusic5.mp3', null);
        
        this.load.audio('coin', 'assets/coin.wav', null);
        this.load.audio('fire', 'assets/weaponfire.wav', null);
        this.load.audio('shield', 'assets/shield.wav', null);
        this.load.audio('weaponUpgrade', 'assets/weaponupgrade.wav', null);
        this.load.audio('playerDeath', 'assets/explosionlarge.wav', null);
        this.load.audio('playerGameOver', 'assets/explosionlarger.wav', null);
        this.load.audio('asteroidDeath', 'assets/explosion1.wav', null);
        this.load.audio('asteroidHit', 'assets/asteroidhit.wav', null);
    }

    create() {
        
        this.GameInBulletHell = false;
        document.getElementById('divLoading').style.display = 'none';
        
        this.musicCounter = 1;
        this.musicMax = 3;

        this.cam = this.cameras.main;
        this.cam.flash();

        this.keys = {};
        this.keys.cursors = this.input.keyboard.createCursorKeys();
        this.keys.pause = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.keys.pause2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.keys.shield = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.music = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        this.playerGroup = this.physics.add.group();
        this.asteroidGroup = this.physics.add.group();
        this.goldGroup = this.physics.add.group();

        this.player = new Player(this, 320, 240);

        this.score = 0;
        this.topScore = 0;
        this.highScore = 0;
        this.multiplier = 0;
        this.player.sprite.weaponType = 0;
        
        this.gameovertext = null;

        this.createTimer();
        
        this.sndCoin = this.sound.add('coin', { loop: false });
        this.sndCoin.volume = 0.5;
        this.sndPlayerDeath1 = this.sound.add('playerDeath', { loop: false });
        this.sndPlayerDeath1.volume = 0.6;
        this.sndPlayerGameOver = this.sound.add('playerGameOver', { loop: false });
        this.sndPlayerGameOver.volume = 0.9;
        this.sndAsteroidDeath = this.sound.add('asteroidDeath', { loop: false });
        this.sndAsteroidDeath.volume = 0.4;
        this.sndAsteroidHit = this.sound.add('asteroidHit', { loop: false });
        this.sndAsteroidHit.volume = 0.3;
        this.sndMusic = this.sound.add('music1', { loop: true });
        this.sndMusic.volume = 0.3;

        this.particles = this.add.particles('particleRed');
        this.explosionEmitter = this.particles.createEmitter({
            speed: 150,
            scale: {
                start: 0.05,
                end: 0
            },
            alpha: {
                start: 1,
                end: 0
            },
            lifespan: 5000,
            on: false
        });

        this.physics.add.collider(this.asteroidGroup, this.playerGroup, this.playerHit, null, this);
        this.physics.add.collider(this.asteroidGroup, this.player.sprite.weapon.bullets, this.bulletHitAsteroid, null, this);
        this.physics.add.collider(this.goldGroup, this.playerGroup, this.playerGold, null, this);

        this.sndMusic.play('', 0, 1, true);
        this.scene.pause();
        this.scene.launch('pauseScene');

    }

    createTimer() {
        this.spawnAsteroidsTimer = this.time.addEvent({
            delay: 10000,
            callback: function () {
                let howManyToCreate = Phaser.Math.Between(2, 10);
                
                if(this.score < 100 || this.topScore < 100 && this.player.sprite.lives < 3)
                    howManyToCreate = 1;
                
                for (let i = 0; i < howManyToCreate; i++) {
                    if (this.asteroidGroup.getChildren().length < 50) {
                        let scale = Phaser.Math.Between(3, 7);
                        this.createAsteroid(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 480), (scale / 10), scale, 'big', true);
                    }
                }
            },
            repeat: -1,
            callbackScope: this
        });
    }
    
    createTimerBulletHell() {
        this.GameInBulletHell = true;
        this.spawnAsteroidsTimer = this.time.addEvent({
            delay: 5000,
            callback: function () {
                for (let i = 0; i < Phaser.Math.Between(6, 10); i++) {
                    if (this.asteroidGroup.getChildren().length < 80) {
                        let scale = Phaser.Math.Between(6, 10);
                        this.createAsteroid(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 480), (scale / 10), scale, 'big', true);
                    }
                }
            },
            repeat: -1,
            callbackScope: this
        });
    }

    createAsteroid(x, y, scale, health, type, fadeIn) {
        let key;

        if (type === 'small') {
            if (Math.random() > 0.55) {
                key = 'asteroidBlue';
            } 
            else {
                key = 'asteroidGreen'; 
            }
        } 
        else {
            key = 'asteroidBlack';
        }
        this.asteroid = this.asteroidGroup.create(x, y, key).setOrigin(0.5, 0.5);
        this.asteroid.setScale(scale);
        this.asteroid.setImmovable(true);
        this.asteroid.scaleDefault = 0.25;
        this.asteroid.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50));
        this.asteroid.setMaxVelocity(100);
        this.asteroid.setMass(1);
        this.asteroid.setCircle(32);
        this.asteroid.type = type;
        this.asteroid.score = 100;
        this.asteroid.health = health;
        this.asteroid.timeAlive = 0;
        
        /*
        let text = this.add.text(0, 0, this.asteroid.health, {
            font: "bold 32px Arial",
            align: "center"
        });
        
        text.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
        //text.anchor.set(0.5);
        text.setOrigin(0.5, 0.5);
        
        let container = this.add.container(0, 0, [ this.asteroid, text ]);
        container.setSize(64, 64);
        this.physics.world.enable(container);
        */
        
        if (fadeIn) {
            this.asteroid.setAlpha(0.2)
            this.asteroid.startTween = this.tweens.add({
                targets: this.asteroid,
                alpha: 1,
                duration: 1500,
                ease: 'Power1',
            });
        }
    }

    update(time, delta) {
        this.player.update();
        
        document.getElementById('divLives').innerHTML = this.player.sprite.lives;
        document.getElementById('divScore').innerHTML = this.score;
        document.getElementById('divCoins').innerHTML = this.player.sprite.weaponType;
        document.getElementById('divWeapon').innerHTML = this.player.sprite.weaponTypeText;
        document.getElementById('divBestScore').innerHTML = this.topScore;
        
        this.physics.world.wrap(this.player.sprite, 16);
        this.physics.world.wrap(this.asteroidGroup, 16);
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
            this.scene.launch('pauseScene');
            this.scene.pause();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.music)) {
            this.musicCounter++;
            if(this.musicCounter > this.musicMax) {
                this.musicCounter = 1;
            }
            
            this.sndMusic.stop();
            this.sndMusic = this.sound.add('music' + this.musicCounter, { loop: true });
            this.sndMusic.volume = 0.3;
            this.sndMusic.play();
        }

        this.asteroidGroup.children.each(function (asteroid) {
            if (asteroid.active) {
                asteroid.timeAlive++;
            }
        });


    }
    
    handleAstroidHit(asteroid) {

        asteroid.health--;

        this.explosionEmitter.setPosition(asteroid.x, asteroid.y);
        this.explosionEmitter.explode(5);
        this.cam.shake(50, 0.006);
        this.sndAsteroidHit.play();

        if (asteroid.health <= 0) {
            asteroid.setActive(false).setVisible(false);
            asteroid.body.enable = false;
            this.sndAsteroidDeath.play();
            
            if (asteroid.type === 'big') {
                let num = ((asteroid.scaleX * 10) * 4)
                for (let i = 0; i < num; i++) {
                    this.createAsteroid(asteroid.x, asteroid.y, 0.2, 1, 'small', false);
                }

                this.explosionEmitter.setPosition(asteroid.x, asteroid.y);
                this.explosionEmitter.explode(20);
                this.cam.flash();
            }

            if (this.asteroidGroup.getChildren().length % 5 === 0) {
                this.multiplier++;
            }

            this.score += (asteroid.scaleX * 1000) * this.multiplier;
            asteroid.destroy();
            
            this.placeGold(asteroid);
        }
    }
    
    placeGold(asteroid) {
        this.gold = this.goldGroup.create(asteroid.x, asteroid.y, 'gold').setOrigin(0.5, 0.5);
        this.gold.setScale(0.2);
        this.gold.setImmovable(true);
        this.gold.scaleDefault = 0.25;
    }

    bulletHitAsteroid(bullet, asteroid) {

        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        bullet.kill();
        
        this.handleAstroidHit(asteroid);
        
        if(this.player.BulletHell) {
            this.player.BulletHell = false;
            this.GameInBulletHell = true;
            this.spawnAsteroidsTimer.destroy();
            this.createTimerBulletHell();
        }
    }

    playerHit(asteroid, playerObjectHit) {

        const currentPlayer = this.player;
        
        if(currentPlayer.shieldIsActive == true) {
            this.handleAstroidHit(asteroid);
            return;
        }
        
        if(asteroid.timeAlive > 100) {
        
            this.cam.flash();
            this.cam.shake(100, 0.01);
            this.sndPlayerDeath1.play();
            this.explosionEmitter.setPosition(currentPlayer.sprite.x, currentPlayer.sprite.y);
            this.explosionEmitter.explode(75);
            
            currentPlayer.sprite.lives--;
            this.multiplier = 0;
            currentPlayer.sprite.hitTween.play();
            
            this.asteroidGroup.children.each(function (asteroid) {
                asteroid.destroy();
            });
            
            this.goldGroup.children.each(function (gold) {
                gold.destroy();
            });
            
            if(this.GameInBulletHell) {
                this.spawnAsteroidsTimer.destroy();
                this.createTimer();   
            }


            if(currentPlayer.sprite.lives <= 0) {
                console.log('GAME OVER MAN; GAME OVER!');
                this.gameovertext = this.add.text(100, 100, 'GAME OVER, try again!', { fontSize: '32px', fill: '#000' });
                this.sndPlayerGameOver.play();
                playerObjectHit.setActive(false).setVisible(false);
                this.player.sprite.emitter.on = false;
                this.cam.fadeOut(3500, 255, 255, 255);

                this.spawnAsteroidsTimer.destroy();
                this.asteroidGroup.children.each(function (asteroid) {
                    asteroid.destroy();
                });

                if(this.score > 0 && this.score > this.topScore) {
                    this.topScore = this.score;
                }

                this.score = 0;
                this.multiplier = 0;
                this.player.sprite.weaponType = 0;

                // restart game
                this.time.addEvent({
                    delay: 4000,
                    callback: function () {
                        if(this.gameovertext != null) {
                            this.gameovertext.destroy();    
                        }
                        
                        this.createTimer();
                        currentPlayer.sprite.lives = 3;
                        this.cam.fadeIn(1000, 255, 255, 255);
                        playerObjectHit.setActive(true).setVisible(true);
                    },
                    callbackScope: this
                });
            }
        }
    }
    
    playerGold(gold, playerObjectHit) {
        if(playerObjectHit.texture.key != 'shield') {
            
            this.player.sprite.weaponType++;
            this.sndCoin.play();
            gold.destroy();   
            
        }
    }

}
