import MenuScene from "./src/scenes/MenuScene.js";
import GameScene from "./src/scenes/GameScene.js";

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#5dbb63",

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: [MenuScene, GameScene]
};

new Phaser.Game(config);