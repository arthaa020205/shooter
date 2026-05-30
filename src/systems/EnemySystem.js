import Enemy from "../entities/Enemy.js";

export default class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];

        this.worldWidth = 6000;
        this.worldHeight = 4500;

        this.minDistanceFromPlayer = 900;
        this.minDistanceBetweenEnemies = 800;
    }

    setRandomSafeWaypoint(enemy) {
        let x;
        let y;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 100) {
            attempts++;

            x = enemy.sprite.x + Phaser.Math.Between(-650, 650);
            y = enemy.sprite.y + Phaser.Math.Between(-650, 650);

            x = Phaser.Math.Clamp(x, 100, this.worldWidth - 100);
            y = Phaser.Math.Clamp(y, 100, this.worldHeight - 100);

            valid = !this.isNearObstacle(x, y);
        }

        enemy.setWaypoint(x, y);
    }

    isNearObstacle(x, y) {
        for (let i = 0; i < this.scene.mapSystem.obstacles.length; i++) {
            const obstacle = this.scene.mapSystem.obstacles[i];

            const distance = Phaser.Math.Distance.Between(
                x,
                y,
                obstacle.x,
                obstacle.y
            );

            const safeDistance =
                Math.max(obstacle.width || 80, obstacle.height || 80) / 2 + 90;

            if (distance < safeDistance) {
                return true;
            }
        }

        return false;
    }

    hasLineOfSight(fromX, fromY, toX, toY) {
        const obstacles = this.scene.mapSystem.obstacles;

        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];

            const width = obstacle.width || 80;
            const height = obstacle.height || 80;

            const left = obstacle.x - width / 2;
            const right = obstacle.x + width / 2;
            const top = obstacle.y - height / 2;
            const bottom = obstacle.y + height / 2;

            for (let t = 0; t <= 1; t += 0.08) {
                const px = Phaser.Math.Linear(fromX, toX, t);
                const py = Phaser.Math.Linear(fromY, toY, t);

                if (px > left && px < right && py > top && py < bottom) {
                    return false;
                }
            }
        }

        return true;
    }

    createEnemies(amount) {
        for (let i = 0; i < amount; i++) {
            this.spawnEnemy(i + 1);
        }
    }

    spawnEnemy(number) {
        const player = this.scene.player.sprite;

        let x;
        let y;
        let validSpawn = false;
        let attempts = 0;

        while (!validSpawn && attempts < 1000) {
            attempts++;

            x = Phaser.Math.Between(150, this.worldWidth - 150);
            y = Phaser.Math.Between(150, this.worldHeight - 150);

            const distanceFromPlayer = Phaser.Math.Distance.Between(
                x,
                y,
                player.x,
                player.y
            );

            if (distanceFromPlayer < this.minDistanceFromPlayer) continue;
            if (this.isNearObstacle(x, y)) continue;

            let tooCloseToEnemy = false;

            for (let i = 0; i < this.enemies.length; i++) {
                const enemy = this.enemies[i];

                if (!enemy.sprite.active) continue;

                const distance = Phaser.Math.Distance.Between(
                    x,
                    y,
                    enemy.sprite.x,
                    enemy.sprite.y
                );

                if (distance < this.minDistanceBetweenEnemies) {
                    tooCloseToEnemy = true;
                    break;
                }
            }

            if (!tooCloseToEnemy) {
                validSpawn = true;
            }
        }

        const nickname = "bot" + String(number).padStart(2, "0");
        const enemy = new Enemy(this.scene, x, y, nickname);

        this.enemies.push(enemy);
    }

    update(playerSprite, zoneSystem, weaponSystem, bulletSystem, delta) {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];

            if (!enemy.sprite.active) continue;

            enemy.updateNamePosition();

            const isUnstucking = enemy.avoidStuck(delta);

            if (isUnstucking) {
                this.setRandomSafeWaypoint(enemy);
                enemy.updateNamePosition();
                continue;
            }

            const isAvoidingObstacle = enemy.avoidObstacle(
                this.scene.mapSystem.obstacles
            );

            if (isAvoidingObstacle) {
                enemy.updateNamePosition();
                continue;
            }

            enemy.shootCooldown -= delta;

            const dangerousBullet = this.findDangerousBullet(
                enemy,
                bulletSystem
            );

            if (dangerousBullet) {
                enemy.dodgeFromPoint(dangerousBullet, 260);
                continue;
            }

            weaponSystem.checkEnemyPickup(enemy);

            if (this.scene.itemSystem) {
                this.scene.itemSystem.checkEnemyPickup(enemy);
            }

            if (this.scene.chestSystem) {
                this.scene.chestSystem.openNearestChestByEnemy(enemy);
            }

            if (zoneSystem && zoneSystem.isOutsideZone(enemy.sprite)) {
                enemy.moveTo(
                    zoneSystem.getZoneCenterTarget(),
                    220
                );
                continue;
            }

            if (!enemy.hasWeapon()) {
                this.handleSearchWeapon(enemy, weaponSystem);
                continue;
            }

            const targetData = this.findNearestTarget(enemy, playerSprite);

            if (!targetData) {
                this.wander(enemy);
                continue;
            }

            const target = targetData.sprite;

            const distanceToTarget = Phaser.Math.Distance.Between(
                enemy.sprite.x,
                enemy.sprite.y,
                target.x,
                target.y
            );

            const canSeeTarget = this.hasLineOfSight(
                enemy.sprite.x,
                enemy.sprite.y,
                target.x,
                target.y
            );

            if (!canSeeTarget) {
                this.handleNoLineOfSight(enemy, target, weaponSystem);
                continue;
            }

            this.handleCombat(
                enemy,
                target,
                distanceToTarget,
                bulletSystem
            );
        }
    }

    handleSearchWeapon(enemy, weaponSystem) {
        const nearestWeapon = weaponSystem.findNearestWeapon(enemy.sprite);

        if (nearestWeapon) {
            const canSeeWeapon = this.hasLineOfSight(
                enemy.sprite.x,
                enemy.sprite.y,
                nearestWeapon.x,
                nearestWeapon.y
            );

            if (canSeeWeapon) {
                enemy.moveTo(nearestWeapon, 220);
            } else {
                this.setRandomSafeWaypoint(enemy);
            }

            return;
        }

        if (this.scene.chestSystem) {
            const nearestChest =
                this.scene.chestSystem.findNearestChest(enemy.sprite);

            if (nearestChest) {
                enemy.moveTo(nearestChest, 210);
                return;
            }
        }

        this.wander(enemy);
    }

    handleNoLineOfSight(enemy, target, weaponSystem) {
        const distance = Phaser.Math.Distance.Between(
            enemy.sprite.x,
            enemy.sprite.y,
            target.x,
            target.y
        );

        if (distance < 700) {
            enemy.strafeAround(target, 160);
        } else {
            this.handleSearchWeapon(enemy, weaponSystem);
        }
    }

    handleCombat(enemy, target, distanceToTarget, bulletSystem) {
        const attackRange = this.getAttackRange(enemy.currentWeapon);

        if (distanceToTarget < 120) {
            enemy.moveAwayFrom(target, 190);
            return;
        }

        if (distanceToTarget <= attackRange) {
            enemy.strafeAround(target, 175);

            const fireRate = this.getEnemyFireRate(enemy.currentWeapon);

            if (this.scene.time.now - enemy.lastShotTime < fireRate) {
                return;
            }

            enemy.lastShotTime = this.scene.time.now;

            const aim = this.getAimPosition(enemy, target);

            // kalau ammo enemy habis, jangan tembak
            if (
                enemy.getCurrentAmmo &&
                enemy.getCurrentAmmo() <= 0
            ) {
                enemy.currentWeapon = null;
                this.handleSearchWeapon(enemy, this.scene.weaponSystem);
                return;
            }

            bulletSystem.shoot(
                enemy.sprite.x,
                enemy.sprite.y,
                aim.x,
                aim.y,
                "enemy",
                enemy,
                enemy.currentWeapon
            );

            // kurangi ammo enemy setelah tembak
            if (enemy.useAmmo) {
                enemy.useAmmo();
            }

            return;
            return;
        }

        enemy.moveTo(target, 200);
    }

    getAimPosition(enemy, target) {
        const weapon = enemy.currentWeapon;

        let spread = 0;

        if (weapon === "sniper") spread = 12;
        else if (weapon === "ak") spread = 38;
        else if (weapon === "m4" || weapon === "scar") spread = 30;
        else if (weapon === "uzi" || weapon === "smg") spread = 45;
        else if (weapon === "pistol") spread = 35;
        else if (weapon === "rpg") spread = 25;
        else spread = 35;

        return {
            x: target.x + Phaser.Math.Between(-spread, spread),
            y: target.y + Phaser.Math.Between(-spread, spread)
        };
    }

    findDangerousBullet(enemy, bulletSystem) {
        for (let i = 0; i < bulletSystem.bullets.length; i++) {
            const bullet = bulletSystem.bullets[i];

            if (!bullet.active) continue;
            if (bullet.ownerType === "enemy") continue;

            const distance = Phaser.Math.Distance.Between(
                enemy.sprite.x,
                enemy.sprite.y,
                bullet.x,
                bullet.y
            );

            if (distance < 180) {
                return bullet;
            }
        }

        return null;
    }

    findNearestTarget(currentEnemy, playerSprite) {
        let nearestTarget = {
            sprite: playerSprite,
            type: "player",
            data: null
        };

        let nearestDistance = Phaser.Math.Distance.Between(
            currentEnemy.sprite.x,
            currentEnemy.sprite.y,
            playerSprite.x,
            playerSprite.y
        );

        for (let i = 0; i < this.enemies.length; i++) {
            const otherEnemy = this.enemies[i];

            if (otherEnemy === currentEnemy) continue;
            if (!otherEnemy.sprite.active) continue;

            const distance = Phaser.Math.Distance.Between(
                currentEnemy.sprite.x,
                currentEnemy.sprite.y,
                otherEnemy.sprite.x,
                otherEnemy.sprite.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;

                nearestTarget = {
                    sprite: otherEnemy.sprite,
                    type: "enemy",
                    data: otherEnemy
                };
            }
        }

        return nearestTarget;
    }

    wander(enemy) {
        if (!enemy.wanderTimer) {
            enemy.wanderTimer = 0;
            enemy.wanderAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        }

        enemy.wanderTimer++;

        if (enemy.wanderTimer > 80) {
            enemy.wanderAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            enemy.wanderTimer = 0;
        }

        enemy.sprite.body.setVelocity(
            Math.cos(enemy.wanderAngle) * 105,
            Math.sin(enemy.wanderAngle) * 105
        );
    }

    getAttackRange(weapon) {
        const ranges = {
            pistol: 520,
            uzi: 480,
            smg: 540,
            ak: 720,
            m4: 760,
            scar: 740,
            sniper: 1100,
            rpg: 850,
            bomb: 500
        };

        return ranges[weapon] || 600;
    }

    getEnemyFireRate(weapon) {
        const rates = {
            pistol: 380,
            uzi: 95,
            smg: 105,
            ak: 145,
            m4: 125,
            scar: 135,
            sniper: 1450,
            rpg: 2200,
            bomb: 1800
        };

        return rates[weapon] || 350;
    }

    getCooldownByWeapon(weaponType) {
        const cooldowns = {
            pistol: 700,
            uzi: 240,
            smg: 280,
            ak: 420,
            m4: 390,
            scar: 410,
            sniper: 1200,
            rpg: 1400,
            bomb: 1500
        };

        return cooldowns[weaponType] || 600;
    }

    getAliveCount() {
        let count = 0;

        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].sprite.active) {
                count++;
            }
        }

        return count;
    }
}