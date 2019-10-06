export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Add ship sprite
        this.name = 'shipItIs';
        this.sprite = scene.playerGroup.create(x, y, "ship").setScale(0.3, 0.3).setOrigin(0.5, 0.5).setImmovable();
        this.sprite.setSize(32, 32, false).setOffset(16, 16);;
        this.sprite.depth = 5;
        
        this.sprite.setDamping(true);
        this.sprite.setDrag(0.98);
        this.sprite.body.setMaxVelocity(300);
        
        // Add shield
        this.shield = null; //scene.playerGroup.create(x, y, "shield").setOrigin(0.5, 0.5).setImmovable();
        this.shieldAliveConst = 12;
        this.shieldCoolDownConst = 20;
        this.shieldCounterAlive = this.shieldAliveConst;
        this.shieldCoolDownCounter = this.shieldCoolDownConst;
        this.shieldIsActive = false;
        this.BulletHell = false;

        this.sprite.lives = 3;

        // Add weapon
        this.sprite.autoFire = false;
        this.sprite.bulletMax = 30; // 30
        this.sprite.weapon = scene.weapons.add(this.sprite.bulletMax, 'bullets');
        this.sprite.weapon.bulletKillType = WeaponPlugin.consts.KILL_LIFESPAN; //WeaponPlugin.consts.KILL_WORLD_BOUNDS WeaponPlugin.consts.KILL_LIFESPAN
        this.sprite.weapon.bulletLifespan = 1000; // short range, dep on bulletSpeed
        this.sprite.weapon.bulletSpeed = 125; //  1250
        this.sprite.weapon.fireRate = 90; //90
        this.sprite.weapon.active = false;
        this.sprite.weaponType = 0;
        this.sprite.weaponTypeText = 'Shield';
        this.sprite.thereWasAWeapoUpgrade = false;
        
        // Add sound
        this.sndFire = this.scene.sound.add('fire', { loop: false });
        this.sndFire.volume = 0.2;
        this.sndShield = this.scene.sound.add('shield', { loop: false });
        this.sndShield.volume = 0.4;
        this.sndWeaponUpgrade = this.scene.sound.add('weaponUpgrade', { loop: false });
        this.sndWeaponUpgrade.volume = 0.9;

        this.sprite.weapon.bullets.children.each(function (bullet) {
            bullet.body.setImmovable(true);
            bullet.setScale(0.2, 0.1);
        }, this);

        this.sprite.weapon.trackSprite(this.sprite, 0, 0, true);

        this.particles = scene.add.particles('particleBlue');

        this.sprite.emitter = this.particles.createEmitter({
            speed: 50,
            scale: {
                start: 0.2,
                end: 0
            },
            lifespan: 350,
            blendMode: 'ADD',
            on: false
        });

        this.sprite.emitter.startFollow(this.sprite);

        this.sprite.hitTween = scene.tweens.add({
            targets: this.sprite,
            alpha: 0.2,
            duration: 150,
            yoyo: true,
            repeat: 10,
            ease: 'Power1',
        });

    }

    update() {

        const scene = this.scene;
        const sprite = this.sprite;
        let shield = this.shield;

        if(sprite.active) {
            
            this.activateWeapons();
            
            this.shieldCoolDownCounter--;

            if (scene.keys.cursors.space.isDown && sprite.weapon.active) {
                sprite.weapon.fire();
                this.sndFire.play();
            }
            if (scene.keys.shield.isDown && !this.shieldIsActive) {

                if(this.shieldCoolDownCounter < 0) {
                    
                    if(shield == null) {
                        this.shieldCounterAlive = this.shieldAliveConst;
                        this.shield = scene.playerGroup.create(sprite.x, sprite.y, "shield").setOrigin(0.5, 0.5).setImmovable();
                    } else {
                        //this.shield.setActive(true).setVisible(true);
                    }

                    this.shieldIsActive = true;
                    this.sndShield.play();
                }
                
                
            }

            if (scene.keys.cursors.up.isDown) {
                sprite.emitter.on = true;
                sprite.setDrag(0.98);
                scene.physics.velocityFromAngle(sprite.angle, 350, sprite.body.acceleration);
            } else {
                sprite.emitter.on = false;
                sprite.body.setAcceleration(0);
            }
            
            if (scene.keys.cursors.down.isDown) {
                sprite.setDrag(0.92);
            }

            if (scene.keys.cursors.left.isDown) {
                sprite.setAngularVelocity(-250);

            }
            else if (scene.keys.cursors.right.isDown) {
                sprite.setAngularVelocity(250);

            }
            else {
                sprite.setAngularVelocity(0);
            }
            
            if(shield != null && this.shieldIsActive) {
                
                this.shieldCounterAlive--;
                
                this.shield.x = sprite.x;
                this.shield.y = sprite.y;
                                
                if(this.shieldCounterAlive <= 0) {
                    this.shieldCounterAlive = this.shieldAliveConst;
                    this.shieldCoolDownCounter = this.shieldCoolDownConst;
                    this.shieldIsActive = false;
                    
                    const allchildren = scene.playerGroup.getChildren();
                    allchildren.forEach(function (spr) {
                        if(spr.texture.key == 'shield') {
                            spr.destroy();
                            //spr.setActive(false).setVisible(true);
                        }
                    });
                    
                    this.shield = null;
                }
            }
        }

    }
    
    resetWeapons () {
        this.sprite.weapon.active = false;
        this.sprite.weaponType = 0;
        this.sprite.weaponTypeText = 'Shield';
        this.sprite.thereWasAWeapoUpgrade = false;
    }
    
    activateWeapons () {

        if(this.sprite.weaponType >= 10 && this.sprite.weaponType < 15) {
            if(this.sprite.weaponTypeText != 'Pea-shooter') {
                this.sprite.bulletMax = 1;
                this.sprite.weapon.bulletLifespan = 500;
                this.sprite.weapon.bulletSpeed = 100;
                this.sprite.weapon.fireRate = 500;
                this.sprite.weapon.active = true;
                this.sprite.weaponTypeText = 'Pea-shooter';
                this.sprite.thereWasAWeapoUpgrade = true;   
            }
        } else if(this.sprite.weaponType >= 15 && this.sprite.weaponType < 30) {
            if(this.sprite.weaponTypeText != 'Poor-man-laser') {
                this.sprite.bulletMax = 3;
                this.sprite.weapon.bulletLifespan = 750;
                this.sprite.weapon.bulletSpeed = 200;
                this.sprite.weapon.fireRate = 700;
                this.sprite.weapon.active = true;
                this.sprite.weaponTypeText = 'Poor-man-laser';
                this.sprite.thereWasAWeapoUpgrade = true;
            }
        } else if(this.sprite.weaponType >= 30 && this.sprite.weaponType < 50) {
            if(this.sprite.weaponTypeText != 'AK-Z') {
                this.sprite.bulletMax = 3;
                this.sprite.weapon.bulletLifespan = 250;
                this.sprite.weapon.bulletSpeed = 300;
                this.sprite.weapon.fireRate = 300;
                this.sprite.weapon.active = true;
                this.sprite.weaponTypeText = 'AK-Z';
                this.sprite.thereWasAWeapoUpgrade = true;   
            }
        } else if(this.sprite.weaponType >= 50) {
            if(this.sprite.weaponTypeText != 'BulletHell') {
                this.sprite.bulletMax = 30;
                this.sprite.weapon.bulletLifespan = 800;
                this.sprite.weapon.bulletSpeed = 800;
                this.sprite.weapon.fireRate = 50;
                this.sprite.weapon.active = true;
                this.sprite.weaponTypeText = 'BulletHell';
                //this.BulletHell = true;
                this.sprite.thereWasAWeapoUpgrade = true;
            }
        }
        
        if(this.sprite.thereWasAWeapoUpgrade) {
            this.sndWeaponUpgrade.play();
            this.sprite.thereWasAWeapoUpgrade = false;
       }
        
    }

}