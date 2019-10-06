import levelScene from "./levelScene.js";
import pauseScene from "./pauseScene.js";

const config = {
    type: Phaser.AUTO,
    parent: 'gameCanvas',
    width: 640,
    height: 480,
    transparent: true,
    pixelArt: true,
    plugins: {
        scene: [
        ]
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [levelScene, pauseScene]
};

const game = new Phaser.Game(config);