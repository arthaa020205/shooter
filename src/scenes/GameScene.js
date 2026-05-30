import Player from "../entities/Player.js";
import UISystem from "../systems/UISystem.js";
import BulletSystem from "../systems/BulletSystem.js";
import EnemySystem from "../systems/EnemySystem.js";
import MapSystem from "../systems/MapSystem.js";
import ZoneSystem from "../systems/ZoneSystem.js";
import MinimapSystem from "../systems/MinimapSystem.js";
import WeaponSystem from "../systems/WeaponSystem.js";
import KillFeedSystem from "../systems/KillFeedSystem.js";
import CompassSystem from "../systems/CompassSystem.js";
import EndGameSystem from "../systems/EndGameSystem.js";
import ItemSystem from "../systems/ItemSystem.js";
import ChestSystem from "../systems/ChestSystem.js";
import TutorialSystem from "../systems/TutorialSystem.js";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    init(data) {
        this.enemyCount = data.enemyCount || 10;
    }

    preload() {
        this.load.audio("explosionSound", "assets/sounds/explosion.mp3");
        this.load.audio("chestOpenSound", "assets/sounds/chest_open.mp3");
        this.load.audio("awmSound", "assets/sounds/awm.mp3");
        this.load.audio("scarSound", "assets/sounds/scar.mp3");
        this.load.audio("ak47Sound", "assets/sounds/ak47.mp3");
        this.load.audio("uziSound", "assets/sounds/uzi.mp3");
        this.load.audio("m4Sound", "assets/sounds/m4.mp3");
        this.load.audio("smgSound", "assets/sounds/smg.mp3");
        this.load.audio("pistolSound", "assets/sounds/pistol.mp3");
        this.load.audio("rpgSound", "assets/sounds/rpg.mp3");
        this.load.audio("reloadSound", "assets/sounds/reload.mp3");
        this.load.audio("victorySound", "assets/sounds/victory.mp3");
        this.load.audio("loseSound", "assets/sounds/lose.mp3");
    }

    create() {
        this.score = 0;
        this.kills = 0;
        this.totalDamage = 0;
        this.gameEnded = false;

        this.isMouseDown = false;
        this.lastShotTime = 0;

        this.isPauseMenuOpen = false;
        this.pauseContainer = null;

        this.mapSystem = new MapSystem(this);
        this.mapSystem.createWorld();
        this.mapSystem.createGrid();
        this.mapSystem.createObstacles();

        this.zoneSystem = new ZoneSystem(this);

        this.player = new Player(this, 3000, 2500);

        this.cameras.main.startFollow(
            this.player.sprite,
            true,
            0.08,
            0.08
        );

        this.cameras.main.setDeadzone(180, 120);
        this.cameras.main.setZoom(1);

        this.uiSystem = new UISystem(this);
        this.bulletSystem = new BulletSystem(this);
        this.enemySystem = new EnemySystem(this);
        this.tutorialSystem = new TutorialSystem(this);

        if (this.tutorialSystem.shouldShowTutorial()) {
            this.tutorialSystem.create();
        }

        this.weaponSystem = new WeaponSystem(this);
        this.itemSystem = new ItemSystem(this);
        this.chestSystem = new ChestSystem(this);
        this.minimapSystem = new MinimapSystem(this);
        this.killFeedSystem = new KillFeedSystem(this);
        this.compassSystem = new CompassSystem(this);
        this.endGameSystem = new EndGameSystem(this);

        this.chestSystem.createChests();
        this.enemySystem.createEnemies(this.enemyCount);

        this.physics.add.collider(
            this.player.sprite,
            this.mapSystem.obstacles
        );

        this.crosshair = this.add.circle(0, 0, 6, 0xffffff);

        this.crosshair.setPosition(
            this.input.activePointer.worldX,
            this.input.activePointer.worldY
        );

        this.crosshair.setDepth(9999);

        for (let i = 0; i < this.enemySystem.enemies.length; i++) {
            const enemy = this.enemySystem.enemies[i];

            this.physics.add.collider(
                enemy.sprite,
                this.mapSystem.obstacles,
                () => {
                    this.enemySystem.setRandomSafeWaypoint(enemy);
                }
            );
        }

        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            reload: Phaser.Input.Keyboard.KeyCodes.R,
            pickup: Phaser.Input.Keyboard.KeyCodes.F,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        this.weaponKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE,
            four: Phaser.Input.Keyboard.KeyCodes.FOUR,
            five: Phaser.Input.Keyboard.KeyCodes.FIVE
        });

        this.input.on("pointerdown", () => {
            if (this.isPauseMenuOpen) return;
            this.isMouseDown = true;
        });

        this.input.on("pointerup", () => {
            this.isMouseDown = false;
        });
    }

    shootPlayer(pointer) {
        if (this.gameEnded) return;
        if (this.isPauseMenuOpen) return;
        if (!this.player.hasWeapon()) return;
        if (this.player.isReloading) return;
        if (!this.player.canShoot) return;

        if (this.player.getCurrentAmmo() <= 0) {
            this.player.reload();
            return;
        }

        const currentWeapon = this.player.getCurrentWeapon();

        let spreadAngle = 0;

        if (currentWeapon === "ak") spreadAngle = 0.08;
        else if (currentWeapon === "m4" || currentWeapon === "scar") spreadAngle = 0.04;
        else if (currentWeapon === "uzi" || currentWeapon === "smg") spreadAngle = 0.06;
        else if (currentWeapon === "sniper") spreadAngle = 0.002;
        else if (currentWeapon === "pistol") spreadAngle = 0.03;
        else if (currentWeapon === "shotgun") spreadAngle = 0.12;
        else if (currentWeapon === "rpg") spreadAngle = 0.015;

        const baseAngle = Phaser.Math.Angle.Between(
            this.player.sprite.x,
            this.player.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        const finalAngle =
            baseAngle + (Math.random() - 0.5) * spreadAngle;

        const targetDistance = Phaser.Math.Distance.Between(
            this.player.sprite.x,
            this.player.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        const targetX =
            this.player.sprite.x + Math.cos(finalAngle) * targetDistance;

        const targetY =
            this.player.sprite.y + Math.sin(finalAngle) * targetDistance;

        this.bulletSystem.shoot(
            this.player.sprite.x,
            this.player.sprite.y,
            targetX,
            targetY,
            "player",
            this.player,
            currentWeapon
        );

        this.player.useAmmo();

        if (currentWeapon === "sniper") {
            this.player.startShootCooldown(1500);
        }

        this.uiSystem.updateAmmo(this.player);
    }

    update(time, delta) {
        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.pause
            )
        ) {
            if (this.isPauseMenuOpen) {
                this.closePauseMenu();
            } else {
                this.openPauseMenu();
            }

            return;
        }

        if (this.gameEnded) return;
        if (this.isPauseMenuOpen) return;

        this.player.move(this.keys);
        this.compassSystem.update(this.player);
        this.bulletSystem.cleanup();

        this.handleWeaponSwitch();

        if (this.isMouseDown) {
            this.tryAutoShoot(time);
        }

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.reload
            )
        ) {
            this.player.reload();
        }

        this.uiSystem.updateAmmo(this.player);
        this.uiSystem.updateReloadAnimation();

        if (
            Phaser.Input.Keyboard.JustDown(
                this.keys.pickup
            )
        ) {
            const chestOpened =
                this.chestSystem.openNearestChestByPlayer(
                    this.player
                );

            if (chestOpened) {
                return;
            }

            const weaponPicked =
                this.weaponSystem.checkPlayerPickup(
                    this.player
                );

            if (weaponPicked) {
                this.uiSystem.updateWeaponBar(this.player);
                this.uiSystem.updateAmmo(this.player);
                return;
            }

            const itemPicked =
                this.itemSystem.checkPlayerPickup(
                    this.player
                );

            if (itemPicked) {
                this.uiSystem.updateHP(this.player.hp);
                this.uiSystem.updateArmorIcons(this.player);
            }
        }

        const zoneDamage =
            this.zoneSystem.update(this.player, delta);

        this.uiSystem.updateZone(
            this.zoneSystem.getTimerText()
        );

        const nearWeapon =
            this.weaponSystem.findNearestWeapon(
                this.player.sprite
            );

        const nearItem = this.itemSystem.findNearestItem
            ? this.itemSystem.findNearestItem(this.player.sprite)
            : null;

        let showPickup = false;

        if (nearWeapon) {
            const d = Phaser.Math.Distance.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                nearWeapon.x,
                nearWeapon.y
            );

            if (d < 70) showPickup = true;
        }

        if (nearItem) {
            const d = Phaser.Math.Distance.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                nearItem.x,
                nearItem.y
            );

            if (d < 70) showPickup = true;
        }

        const nearChest =
            this.chestSystem.findNearestChest(this.player.sprite);

        if (nearChest) {
            const d = Phaser.Math.Distance.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                nearChest.x,
                nearChest.y
            );

            if (d < 80) showPickup = true;
        }

        this.uiSystem.showPickupText(showPickup);

        if (zoneDamage) {
            this.uiSystem.updateHP(this.player.hp);

            if (this.player.hp <= 0) {
                this.showLoseResult();
                return;
            }
        }

        this.enemySystem.update(
            this.player.sprite,
            this.zoneSystem,
            this.weaponSystem,
            this.bulletSystem,
            delta
        );

        for (let i = 0; i < this.enemySystem.enemies.length; i++) {
            const enemy = this.enemySystem.enemies[i];

            if (!enemy.sprite.active) continue;

            this.chestSystem.openNearestChestByEnemy(enemy);
            this.weaponSystem.checkEnemyPickup(enemy);
            this.itemSystem.checkEnemyPickup(enemy);
        }

        this.uiSystem.updateAlive(
            this.enemySystem.getAliveCount() + 1
        );

        this.checkBulletHitEnemies();
        this.checkEnemyBulletHitPlayer();
        this.checkEnemyBulletHitEnemy();
        this.checkBulletHitObstacles();
        this.checkEnemyHitPlayer();
        this.checkEnemyHitEnemy();
        this.checkWinCondition();

        this.minimapSystem.update(
            this.player,
            this.enemySystem.enemies,
            this.zoneSystem
        );
    }

    openPauseMenu() {
        this.isPauseMenuOpen = true;
        this.isMouseDown = false;

        const w = this.scale.width;
        const h = this.scale.height;

        this.pauseContainer = this.add.container(
            w / 2,
            h / 2
        );

        this.pauseContainer.setDepth(999999);
        this.pauseContainer.setScrollFactor(0);

        const overlay = this.add.rectangle(
            0,
            0,
            w,
            h,
            0x000000,
            0.65
        );

        overlay.setScrollFactor(0);

        const panel = this.add.rectangle(
            0,
            0,
            430,
            270,
            0x0f141c,
            0.96
        );

        panel.setStrokeStyle(3, 0xf3a922);
        panel.setScrollFactor(0);

        const title = this.add.text(
            0,
            -90,
            "PAUSE MENU",
            {
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }
        ).setOrigin(0.5);

        title.setScrollFactor(0);

        const resumeBtn = this.add.rectangle(
            0,
            -20,
            250,
            52,
            0xf3a922
        ).setInteractive({ useHandCursor: true });

        resumeBtn.setScrollFactor(0);

        const resumeText = this.add.text(
            0,
            -20,
            "RESUME",
            {
                fontSize: "20px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        resumeText.setScrollFactor(0);

        const menuBtn = this.add.rectangle(
            0,
            55,
            250,
            52,
            0x182026
        ).setInteractive({ useHandCursor: true });

        menuBtn.setStrokeStyle(2, 0xf3a922);
        menuBtn.setScrollFactor(0);

        const menuText = this.add.text(
            0,
            55,
            "MAIN MENU",
            {
                fontSize: "20px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        menuText.setScrollFactor(0);

        resumeBtn.on("pointerover", () => {
            resumeBtn.fillColor = 0xffffff;
        });

        resumeBtn.on("pointerout", () => {
            resumeBtn.fillColor = 0xf3a922;
        });

        resumeBtn.on("pointerup", () => {
            this.closePauseMenu();
        });

        menuBtn.on("pointerover", () => {
            menuBtn.fillColor = 0xf3a922;
            menuText.setColor("#000000");
        });

        menuBtn.on("pointerout", () => {
            menuBtn.fillColor = 0x182026;
            menuText.setColor("#ffffff");
        });

        menuBtn.on("pointerup", () => {
            this.closePauseMenu();
            this.scene.start("MenuScene");
        });

        this.pauseContainer.add([
            overlay,
            panel,
            title,
            resumeBtn,
            resumeText,
            menuBtn,
            menuText
        ]);

        this.physics.world.pause();
    }

    closePauseMenu() {
        if (this.pauseContainer) {
            this.pauseContainer.destroy();
            this.pauseContainer = null;
        }

        this.physics.world.resume();

        this.isPauseMenuOpen = false;
        this.isMouseDown = false;
    }

    checkBulletHitEnemies() {
        for (let i = 0; i < this.bulletSystem.bullets.length; i++) {
            const bullet = this.bulletSystem.bullets[i];

            if (!bullet.active) continue;
            if (bullet.ownerType === "enemy") continue;

            for (let j = 0; j < this.enemySystem.enemies.length; j++) {
                const enemy = this.enemySystem.enemies[j];

                if (!enemy.sprite.active) continue;

                const distance = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    enemy.sprite.x,
                    enemy.sprite.y
                );

                if (distance < 35) {
                    const damage = bullet.damage || 10;

                    bullet.destroy();
                    enemy.takeDamage(damage);

                    this.totalDamage += damage;

                    if (!enemy.sprite.active) {
                        this.score += 10;
                        this.kills += 1;

                        this.uiSystem.updateScore(this.score);
                        this.uiSystem.updateKills(this.kills);

                        this.uiSystem.showKillFeed(
                            "YOU killed " + enemy.nickname
                        );
                    }

                    break;
                }
            }
        }
    }

    checkEnemyBulletHitPlayer() {
        for (let i = 0; i < this.bulletSystem.bullets.length; i++) {
            const bullet = this.bulletSystem.bullets[i];

            if (!bullet.active) continue;
            if (bullet.ownerType !== "enemy") continue;

            const distance = Phaser.Math.Distance.Between(
                bullet.x,
                bullet.y,
                this.player.sprite.x,
                this.player.sprite.y
            );

            if (distance < 35) {
                bullet.destroy();

                this.player.takeDamage(bullet.damage || 10);
                this.uiSystem.updateHP(this.player.hp);

                if (this.player.hp <= 0) {
                    this.uiSystem.showKillFeed(
                        bullet.owner.nickname + " killed Player"
                    );

                    this.showLoseResult();
                    return;
                }
            }
        }
    }

    checkEnemyBulletHitEnemy() {
        for (let i = 0; i < this.bulletSystem.bullets.length; i++) {
            const bullet = this.bulletSystem.bullets[i];

            if (!bullet.active) continue;
            if (bullet.ownerType !== "enemy") continue;

            for (let j = 0; j < this.enemySystem.enemies.length; j++) {
                const enemy = this.enemySystem.enemies[j];

                if (!enemy.sprite.active) continue;
                if (bullet.owner === enemy) continue;

                const distance = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    enemy.sprite.x,
                    enemy.sprite.y
                );

                if (distance < 35) {
                    bullet.destroy();

                    enemy.takeDamage(bullet.damage || 10);

                    if (!enemy.sprite.active) {
                        this.uiSystem.showKillFeed(
                            bullet.owner.nickname + " killed " + enemy.nickname
                        );
                    }

                    break;
                }
            }
        }
    }

    checkEnemyHitPlayer() {
        for (let i = 0; i < this.enemySystem.enemies.length; i++) {
            const enemy = this.enemySystem.enemies[i];

            if (!enemy.sprite.active) continue;

            const distance = Phaser.Math.Distance.Between(
                enemy.sprite.x,
                enemy.sprite.y,
                this.player.sprite.x,
                this.player.sprite.y
            );

            if (distance < 40) {
                enemy.destroy();

                this.player.takeDamage(10);
                this.uiSystem.updateHP(this.player.hp);

                if (this.player.hp <= 0) {
                    this.showLoseResult();
                    return;
                }
            }
        }
    }

    checkEnemyHitEnemy() {
        for (let i = 0; i < this.enemySystem.enemies.length; i++) {
            const enemyA = this.enemySystem.enemies[i];

            if (!enemyA.sprite.active) continue;

            for (let j = i + 1; j < this.enemySystem.enemies.length; j++) {
                const enemyB = this.enemySystem.enemies[j];

                if (!enemyB.sprite.active) continue;

                const distance = Phaser.Math.Distance.Between(
                    enemyA.sprite.x,
                    enemyA.sprite.y,
                    enemyB.sprite.x,
                    enemyB.sprite.y
                );

                if (distance < 40) {
                    enemyA.takeDamage(10);
                    enemyB.takeDamage(10);
                }
            }
        }
    }

    checkBulletHitObstacles() {
        for (let i = 0; i < this.bulletSystem.bullets.length; i++) {
            const bullet = this.bulletSystem.bullets[i];

            if (!bullet.active) continue;

            for (let j = 0; j < this.mapSystem.obstacles.length; j++) {
                const obstacle = this.mapSystem.obstacles[j];

                const distance = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    obstacle.x,
                    obstacle.y
                );

                const hitDistance = Math.max(
                    obstacle.width || 60,
                    obstacle.height || 60
                ) / 2;

                if (distance < hitDistance) {
                    if (bullet.isBomb) {
                        this.bulletSystem.explodeBomb(bullet);
                    } else {
                        bullet.destroy();
                    }

                    break;
                }
            }
        }
    }

    checkWinCondition() {
        const aliveEnemies = this.enemySystem.getAliveCount();

        if (aliveEnemies <= 0) {
            this.showWinResult();
        }
    }

    handleWeaponSwitch() {
        if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.one)) {
            this.player.switchWeapon(0);
            this.uiSystem.updateWeaponBar(this.player);
        }

        if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.two)) {
            this.player.switchWeapon(1);
            this.uiSystem.updateWeaponBar(this.player);
        }

        if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.three)) {
            this.player.switchWeapon(2);
            this.uiSystem.updateWeaponBar(this.player);
        }

        if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.four)) {
            this.player.switchWeapon(3);
            this.uiSystem.updateWeaponBar(this.player);
        }

        if (Phaser.Input.Keyboard.JustDown(this.weaponKeys.five)) {
            this.player.switchWeapon(4);
            this.uiSystem.updateWeaponBar(this.player);
        }
    }

    showLoseResult() {
        if (this.gameEnded) return;

        this.gameEnded = true;

        this.sound.play("loseSound", {
            volume: 0.7
        });

        const placement =
            this.enemySystem.getAliveCount() + 1;

        this.endGameSystem.showResult(
            "GAME OVER",
            placement,
            this.kills,
            this.totalDamage
        );
    }

    showWinResult() {
        if (this.gameEnded) return;

        this.gameEnded = true;

        this.sound.play("victorySound", {
            volume: 0.7
        });

        this.endGameSystem.showResult(
            "YOU WIN",
            1,
            this.kills,
            this.totalDamage
        );
    }

    tryAutoShoot(time) {
        if (!this.player.hasWeapon()) return;

        const weapon = this.player.getCurrentWeapon();
        const fireRate = this.getFireRate(weapon);

        if (time - this.lastShotTime < fireRate) {
            return;
        }

        this.lastShotTime = time;

        this.shootPlayer(this.input.activePointer);
    }

    getFireRate(weapon) {
        const rates = {
            pistol: 350,
            uzi: 90,
            smg: 100,
            ak: 140,
            m4: 120,
            scar: 130,
            sniper: 1400,
            rpg: 900,
            bomb: 700
        };

        return rates[weapon] || 300;
    }

    playSpatialSound(
        key,
        x,
        y,
        maxDistance = 1200,
        maxVolume = 0.8
    ) {
        if (!this.player || !this.player.sprite) return;

        const distance = Phaser.Math.Distance.Between(
            this.player.sprite.x,
            this.player.sprite.y,
            x,
            y
        );

        let volume = 1 - distance / maxDistance;

        volume = Phaser.Math.Clamp(
            volume,
            0,
            1
        );

        if (volume <= 0) return;

        this.sound.play(key, {
            volume: volume * maxVolume
        });
    }
}