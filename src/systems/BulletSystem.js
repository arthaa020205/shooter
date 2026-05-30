export default class BulletSystem {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
    }

    shoot(x, y, targetX, targetY, ownerType = "player", owner = null, weaponType = "pistol") {
        if (weaponType === "bomb") {
            this.throwBomb(x, y, targetX, targetY, ownerType, owner);
            return;
        }

        if (weaponType === "sniper") {
            this.scene.playSpatialSound(
                "awmSound",
                x,
                y,
                1600,
                0.85
            );
        }

        if (weaponType === "scar") {

            this.scene.playSpatialSound(
                "scarSound",
                x,
                y,
                1300,
                0.45
            );

        }

        if (weaponType === "ak") {

            this.scene.playSpatialSound(
                "ak47Sound",
                x,
                y,
                1450,
                0.6
            );

        }

        if (weaponType === "uzi") {

            this.scene.playSpatialSound(
                "uziSound",
                x,
                y,
                900,
                0.32
            );

        }

        if (weaponType === "m4") {

            this.scene.playSpatialSound(
                "m4Sound",
                x,
                y,
                1250,
                0.42
            );

        }

        if (weaponType === "smg") {

            this.scene.playSpatialSound(
                "smgSound",
                x,
                y,
                1000,
                0.36
            );

        }

        if (weaponType === "pistol") {

            this.scene.playSpatialSound(
                "pistolSound",
                x,
                y,
                850,
                0.28
            );

        }

        if (weaponType === "rpg") {
            this.scene.playSpatialSound(
                "rpgSound",
                x,
                y,
                1400,
                0.65
            );
        }

        const config = this.getWeaponConfig(weaponType);

        this.createBullet(
            x,
            y,
            targetX,
            targetY,
            ownerType,
            owner,
            config
        );
    }


    createBulletVisual(x, y, weaponType, config) {

        const container = this.scene.add.container(
            x,
            y
        );

        let width = 18;
        let height = 3;

        // =========================
        // SIZE BERDASARKAN SENJATA
        // =========================
        if (
            weaponType === "uzi" ||
            weaponType === "smg"
        ) {
            width = 12;
            height = 2;
        }

        else if (
            weaponType === "ak" ||
            weaponType === "m4" ||
            weaponType === "scar"
        ) {
            width = 20;
            height = 3;
        }

        else if (weaponType === "sniper") {
            width = 32;
            height = 3;
        }



        else if (weaponType === "rpg") {
            width = 26;
            height = 8;
        }

        // =========================
        // TRAIL / GLOW
        // =========================
        const glow = this.scene.add.rectangle(
            -width / 2,
            0,
            width * 1.5,
            height * 2.5,
            0xffffff,
            0.15
        );

        // =========================
        // BULLET CORE
        // =========================
        const bullet = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0xffffff
        );

        // =========================
        // BULLET HEAD
        // =========================
        const tip = this.scene.add.circle(
            width / 2,
            0,
            height,
            0xffffff
        );

        container.add([
            glow,
            bullet,
            tip
        ]);

        container.setDepth(2000);

        return container;
    }
    throwBomb(x, y, targetX, targetY, ownerType, owner) {

        const bomb = this.scene.add.circle(
            x,
            y,
            12,
            0xff0000
        );

        this.scene.physics.add.existing(bomb);

        bomb.ownerType = ownerType;
        bomb.owner = owner;

        bomb.damage = 60;

        bomb.isBomb = true;

        bomb.exploded = false;

        this.bullets.push(bomb);

        const angle =
            Phaser.Math.Angle.Between(
                x,
                y,
                targetX,
                targetY
            );

        bomb.body.setVelocity(
            Math.cos(angle) * 350,
            Math.sin(angle) * 350
        );

        // grenade meledak otomatis
        this.scene.time.delayedCall(1200, () => {

            if (!bomb.active) return;

            this.explodeBomb(bomb);

        });
    }

    explodeBomb(bomb) {

        if (!bomb.active) return;

        if (bomb.exploded) return;

        bomb.exploded = true;

        const soundOn = localStorage.getItem("br_sfx_on") !== "false";

        if (soundOn) {
            this.scene.playSpatialSound(
                "explosionSound",
                bomb.x,
                bomb.y,
                1600,
                0.9
            );
        }

        // stop movement
        if (bomb.body) {
            bomb.body.setVelocity(0);
        }

        // EFFECT LEDAKAN
        const explosion =
            this.scene.add.circle(
                bomb.x,
                bomb.y,
                30,
                0xff6600,
                0.7
            );

        explosion.setDepth(999);

        this.scene.tweens.add({
            targets: explosion,
            radius: 150,
            alpha: 0,
            duration: 350,
            onComplete: () => {
                explosion.destroy();
            }
        });

        // DAMAGE PLAYER
        const player =
            this.scene.player;

        const playerDistance =
            Phaser.Math.Distance.Between(
                bomb.x,
                bomb.y,
                player.sprite.x,
                player.sprite.y
            );

        if (playerDistance < 140) {

            player.takeDamage(35);

            this.scene.uiSystem.updateHP(
                player.hp
            );

        }

        // DAMAGE ENEMY
        for (
            let i = 0;
            i < this.scene.enemySystem.enemies.length;
            i++
        ) {

            const enemy =
                this.scene.enemySystem.enemies[i];

            if (!enemy.sprite.active) continue;

            const distance =
                Phaser.Math.Distance.Between(
                    bomb.x,
                    bomb.y,
                    enemy.sprite.x,
                    enemy.sprite.y
                );

            if (distance < 140) {

                enemy.takeDamage(45);

            }

        }

        bomb.destroy();

    }

    createBullet(x, y, targetX, targetY, ownerType, owner, config) {
        const bullet = this.scene.add.rectangle(
            x,
            y,
            config.size,
            config.size,
            config.color
        );

        this.scene.physics.add.existing(bullet);

        bullet.ownerType = ownerType;
        bullet.owner = owner;
        bullet.damage = config.damage;

        this.bullets.push(bullet);

        const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        bullet.setRotation(angle);
        bullet.body.setVelocity(
            Math.cos(angle) * config.speed,
            Math.sin(angle) * config.speed
        );
    }

    getWeaponConfig(type) {
        const weapons = {

            pistol: {
                damage: 5,
                speed: 600,
                size: 5,
                color: 0xffff00,
                ammo: 12,
                reload: 1100
            },

            uzi: {
                damage: 10,
                speed: 850,
                size: 5,
                color: 0xffff00,
                ammo: 25,
                reload: 1200
            },

            smg: {
                damage: 10,
                speed: 820,
                size: 5,
                color: 0xffff00,
                ammo: 30,
                reload: 1400
            },

            ak: {
                damage: 15,
                speed: 760,
                size: 8,
                color: 0xffff00,
                ammo: 30,
                reload: 1700
            },

            m4: {
                damage: 13,
                speed: 820,
                size: 7,
                color: 0xffff00,
                ammo: 30,
                reload: 1600
            },

            scar: {
                damage: 12,
                speed: 800,
                size: 7,
                color: 0xffff00,
                ammo: 30,
                reload: 1700
            },

            sniper: {
                damage: 50,
                speed: 1250,
                size: 10,
                color: 0xffff00,
                ammo: 5,
                reload: 2300
            },

            // shotgun: {
            //     damage: 30,
            //     speed: 550,
            //     size: 9,
            //     color: 0xffaa00,
            //     ammo: 6,
            //     reload: 2400
            // },

            rpg: {
                damage: 100,
                speed: 1100,
                size: 10,
                color: 0xffff00,
                ammo: 1,
                reload: 3000
            }

        };

        return weapons[type] || weapons.pistol;
    }

    cleanup() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            if (!bullet.active) {
                this.bullets.splice(i, 1);
                continue;
            }

            const distance = Phaser.Math.Distance.Between(
                bullet.x,
                bullet.y,
                bullet.startX || bullet.x,
                bullet.startY || bullet.y
            );

            if (
                distance > (bullet.range || 900) ||
                bullet.x < 0 ||
                bullet.x > 6000 ||
                bullet.y < 0 ||
                bullet.y > 4500
            ) {
                bullet.destroy();
                this.bullets.splice(i, 1);
            }
        }
    }

}