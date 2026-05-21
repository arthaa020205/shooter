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
import VirtualJoystick from "../systems/VirtualJoystick.js"; // Pastikan Anda membuat file ini sesuai panduan sebelumnya

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    init(data) {
        this.enemyCount = data.enemyCount || 10;
    }

    preload() {
        // ==========================================================
        // 1. LOAD IMAGE UTAMU UNTUK INDIKATOR SENJATA DI BAR HUD
        // ==========================================================
        this.load.image('wp_pistol', 'assets/weapons/pistol.png');
        this.load.image('wp_uzi', 'assets/weapons/uzi.png');
        this.load.image('wp_smg', 'assets/weapons/smg.png');
        this.load.image('wp_ak', 'assets/weapons/ak.png');
        this.load.image('wp_m4', 'assets/weapons/m4.png');
        this.load.image('wp_scar', 'assets/weapons/scar.png');
        this.load.image('wp_sniper', 'assets/weapons/sniper.png');
        this.load.image('wp_shotgun', 'assets/weapons/shotgun.png');
        this.load.image('wp_rpg', 'assets/weapons/rpg.png');
        this.load.image('wp_bomb', 'assets/weapons/bomb.png');
    }

    create() {
        this.score = 0;
        this.kills = 0;
        this.totalDamage = 0;
        this.gameEnded = false;

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
        this.weaponSystem = new WeaponSystem(this);
        this.minimapSystem = new MinimapSystem(this);
        this.killFeedSystem = new KillFeedSystem(this);
        this.compassSystem = new CompassSystem(this);
        this.endGameSystem = new EndGameSystem(this);

        this.weaponSystem.createWeapons();
        this.enemySystem.createEnemies(this.enemyCount);

        this.physics.add.collider(
            this.player.sprite,
            this.mapSystem.obstacles
        );

        this.crosshair = this.add.circle(0, 0, 6, 0xffffff);
        this.crosshair.setDepth(9999);

        for (let i = 0; i < this.enemySystem.enemies.length; i++) {
            const enemy = this.enemySystem.enemies[i];
            this.physics.add.collider(
                enemy.sprite,
                this.mapSystem.obstacles,
                () => {
                    // paksa cari arah baru
                    this.enemySystem.setRandomSafeWaypoint(enemy);
                }
            );
        }

        // Kontrol Keyboard PC
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            reload: Phaser.Input.Keyboard.KeyCodes.R
        });

        this.weaponKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE,
            four: Phaser.Input.Keyboard.KeyCodes.FOUR,
            five: Phaser.Input.Keyboard.KeyCodes.FIVE
        });

        // ==========================================================
        // 2. CONFIG DETEKSI MOBILE DEVICE & SETUP DETEKSI ANALOG
        // ==========================================================
        const w = this.scale.width;
        const h = this.scale.height;
        this.isMobile = !this.sys.game.device.os.desktop;

        if (this.isMobile) {
            // Analog Kiri: Pergerakan (Move)
            this.joystickLeft = new VirtualJoystick(this, 120, h - 120, 65, false);
            // Analog Kanan: Membidik & Menembak (Shoot)
            this.joystickRight = new VirtualJoystick(this, w - 380, h - 120, 65, true);
            
            this.nextFireTime = 0; // Mengatur jeda fire-rate auto mobile tembak
        }

        // ==========================================================
        // 3. EVENT TEMBAK MANUAL PC (POINTERDOWN MOUSE KIRI)
        // ==========================================================
        this.input.on("pointerdown", (pointer) => {
            if (this.gameEnded || this.isMobile) return; // Abaikan jika mode hp/mobile aktif
            if (!this.player.hasWeapon()) return;
            if (this.player.isReloading) return;

            if (this.player.getCurrentAmmo() <= 0) {
                this.player.reload();
                return;
            }

            const currentWeapon = this.player.getCurrentWeapon();
            let spreadAngle = 0;
            
            if (currentWeapon === 'ak') spreadAngle = 0.08;       
            else if (currentWeapon === 'm4' || currentWeapon === 'scar') spreadAngle = 0.04; 
            else if (currentWeapon === 'uzi' || currentWeapon === 'smg') spreadAngle = 0.06; 
            else if (currentWeapon === 'sniper') spreadAngle = 0.002; 
            else if (currentWeapon === 'pistol') spreadAngle = 0.03;

            let baseAngle = Phaser.Math.Angle.Between(
                this.player.sprite.x,
                this.player.sprite.y,
                pointer.worldX,
                pointer.worldY
            );

            // Perbaikan typo kode lama: Menyatukan akumulasi penyebaran peluru acak
            let finalAngle = baseAngle + (Math.random() - 0.5) * spreadAngle;

            const targetDistance = Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, pointer.worldX, pointer.worldY);
            const targetX = this.player.sprite.x + Math.cos(finalAngle) * targetDistance;
            const targetY = this.player.sprite.y + Math.sin(finalAngle) * targetDistance;

            this.bulletSystem.shoot(
                this.player.sprite.x,
                this.player.sprite.y,
                targetX,
                targetY,
                "player",
                this.player,
                currentWeapon
            );

            this.bulletSystem.createMuzzleFlash(this.player.sprite.x, this.player.sprite.y, finalAngle);

            this.player.useAmmo();
            this.uiSystem.updateAmmo(this.player);
        });

        // Setup awal kondisi UI saat masuk peta pertama kali
        this.uiSystem.updateHP(this.player.hp);
        this.uiSystem.updateWeaponBar(this.player);
    }

    update(time, delta) {
        if (this.gameEnded) return;

        // ==========================================================
        // 4. KONTROL GERAK PLAYER & ROTASI HADAP (PC VS MOBILE)
        // ==========================================================
        if (this.isMobile && this.joystickLeft) {
            const moveX = this.joystickLeft.outputX;
            const moveY = this.joystickLeft.outputY;
            const moveSpeed = this.player.speed || 200;

            if (this.joystickLeft.isDown) {
                this.player.sprite.body.setVelocity(moveX * moveSpeed, moveY * moveSpeed);
                
                // Rotasi badan mengikuti arah gerak analog, jika analog kanan tidak sedang membidik
                if (!this.joystickRight.isDown) {
                    this.player.sprite.setRotation(Phaser.Math.Angle.Between(0, 0, moveX, moveY));
                }
            } else {
                this.player.sprite.body.setVelocity(0, 0);
            }
        } else {
            // Kontrol default Keyboard PC
            this.player.move(this.keys);
        }

        // ==========================================================
        // 5. KONTROL BIDIK & AUTO-SHOOT (MOBILE ANALOG KANAN)
        // ==========================================================
        if (this.isMobile && this.joystickRight && this.joystickRight.isDown) {
            const shootX = this.joystickRight.outputX;
            const shootY = this.joystickRight.outputY;

            // Sensitivitas analog harus ditarik sejauh 30% dari pusat lingkaran agar tidak salah tembak
            if (Math.abs(shootX) > 0.3 || Math.abs(shootY) > 0.3) {
                const fireAngle = Phaser.Math.Angle.Between(0, 0, shootX, shootY);
                this.player.sprite.setRotation(fireAngle);

                // Proyeksikan posisi crosshair di depan player mobile mengikuti arah bidikan analog kanan
                this.crosshair.setPosition(
                    this.player.sprite.x + Math.cos(fireAngle) * 160,
                    this.player.sprite.y + Math.sin(fireAngle) * 160
                );

                // Menembak secara otomatis berkala berdasarkan Fire-Rate
                if (time > this.nextFireTime) {
                    this.handleAnalogShoot(fireAngle);
                    this.nextFireTime = time + 140; // Kecepatan jeda tembak otomatis (140 ms)
                }
            }
        } else if (!this.isMobile) {
            // Jika PC, posisi crosshair mengikuti cursor pointer mouse absolut
            this.crosshair.setPosition(
                this.input.activePointer.worldX,
                this.input.activePointer.worldY
            );
        }

        // SINKRONISASI LOGIKA SYSTEM GAME UTAMA
        this.compassSystem.update(this.player);
        this.bulletSystem.cleanup();
        this.handleWeaponSwitch();

        if (Phaser.Input.Keyboard.JustDown(this.keys.reload)) {
            this.player.reload();
        }

        // Sembunyikan status teks reloading jika proses internal player selesai
        if (this.player.isReloading === false) {
            this.uiSystem.hideReloadText();
        } else {
            this.uiSystem.showReloadText();
        }

        this.uiSystem.updateAmmo(this.player);

        const weaponPicked = this.weaponSystem.checkPlayerPickup(this.player);
        if (weaponPicked) {
            this.uiSystem.updateWeaponBar(this.player);
        }

        const zoneDamage = this.zoneSystem.update(this.player, delta);
        this.uiSystem.updateZone(this.zoneSystem.getTimerText());

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

        this.uiSystem.updateAlive(this.enemySystem.getAliveCount() + 1);

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

    // Fungsi Pembantu: Mengeksekusi peluru melalui perhitungan arah data analog kanan HP
    handleAnalogShoot(angle) {
        if (!this.player.hasWeapon() || this.player.isReloading) return;

        if (this.player.getCurrentAmmo() <= 0) {
            this.player.reload();
            return;
        }

        const currentWeapon = this.player.getCurrentWeapon();
        let spreadAngle = 0;
        
        if (currentWeapon === 'ak') spreadAngle = 0.08;       
        else if (currentWeapon === 'm4' || currentWeapon === 'scar') spreadAngle = 0.04; 
        else if (currentWeapon === 'uzi' || currentWeapon === 'smg') spreadAngle = 0.06; 
        else if (currentWeapon === 'sniper') spreadAngle = 0.002; 
        else if (currentWeapon === 'pistol') spreadAngle = 0.03;

        // Tambahkan deviasi acak (Spread) ke sudut tembakan analog
        let finalAngle = angle + (Math.random() - 0.5) * spreadAngle;

        // Jarak jangkauan tembakan proyeksi peluru virtual
        const targetX = this.player.sprite.x + Math.cos(finalAngle) * 400;
        const targetY = this.player.sprite.y + Math.sin(finalAngle) * 400;

        this.bulletSystem.shoot(
            this.player.sprite.x,
            this.player.sprite.y,
            targetX,
            targetY,
            "player",
            this.player,
            currentWeapon
        );

        this.bulletSystem.createMuzzleFlash(this.player.sprite.x, this.player.sprite.y, finalAngle);
        this.player.useAmmo();
        this.uiSystem.updateAmmo(this.player);
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
                        this.uiSystem.showKillFeed("YOU killed " + enemy.nickname);
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
                    this.uiSystem.showKillFeed(bullet.owner.nickname + " killed Player");
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
                        this.uiSystem.showKillFeed(bullet.owner.nickname + " killed " + enemy.nickname);
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
        const placement = this.enemySystem.getAliveCount() + 1;
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
        this.endGameSystem.showResult(
            "YOU WIN",
            1,
            this.kills,
            this.totalDamage
        );
    }
}