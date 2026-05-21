import MenuScene from "./src/scenes/MenuScene.js";
import GameScene from "./src/scenes/GameScene.js";

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#5dbb63",

    // 1. TAMBAHKAN INPUT MULTI-TOUCH
    // Secara default Phaser hanya mengaktifkan 1 pointer (mouse).
    // Kita naikkan menjadi 3 agar jari kiri (move) dan jari kanan (shoot) bisa aktif bareng di HP.
    input: {
        activePointers: 3
    },

    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },

    // 2. SESUAIKAN SKALA UNTUK RESPONSIVITAS HP (MOBILE FRIENDLY)
    scale: {
        mode: Phaser.Scale.FIT,           // Memaksa game pas dengan layar HP tanpa merusak aspek rasio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Memastikan posisi kanvas game selalu presisi di tengah browser
        width: 1280,                      // Resolusi standar dasar (Landscape 16:9)
        height: 720
    },

    scene: [MenuScene, GameScene]
};

new Phaser.Game(config);