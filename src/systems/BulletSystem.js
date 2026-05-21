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

        if (weaponType === "shotgun") {
            this.shootShotgun(x, y, targetX, targetY, ownerType, owner);
            return;
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

    shootShotgun(x, y, targetX, targetY, ownerType, owner) {
        const baseAngle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
        const config = this.getWeaponConfig("shotgun");

        for (let i = -2; i <= 2; i++) {
            const angle = baseAngle + i * 0.15;

            const bullet = this.scene.add.rectangle(
                x,
                y,
                10,
                10,
                config.color
            );

            this.scene.physics.add.existing(bullet);

            bullet.ownerType = ownerType;
            bullet.owner = owner;
            bullet.damage = config.damage;
            bullet.weaponType = weaponType;
            bullet.damage = config.damage;
            bullet.range = config.range;
            bullet.startX = x;
            bullet.startY = y;

            this.bullets.push(bullet);

            bullet.body.setVelocity(
                Math.cos(angle) * config.speed,
                Math.sin(angle) * config.speed
            );
        }
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
        size: 9,
        color: 0xffffff,
        ammo: 12,
        reload: 1000
    },

    uzi: {
        damage: 10,
        speed: 850,
        size: 7,
        color: 0x00ccff,
        ammo: 25,
        reload: 1200
    },

    smg: {
        damage: 10,
        speed: 820,
        size: 8,
        color: 0x00ff99,
        ammo: 30,
        reload: 1400
    },

    ak: {
        damage: 15,
        speed: 760,
        size: 10,
        color: 0xff6600,
        ammo: 30,
        reload: 1700
    },

    m4: {
        damage: 13,
        speed: 820,
        size: 10,
        color: 0x0066ff,
        ammo: 30,
        reload: 1600
    },

    scar: {
        damage: 12,
        speed: 800,
        size: 10,
        color: 0xffff00,
        ammo: 30,
        reload: 1700
    },

    sniper: {
        damage: 50,
        speed: 1200,
        size: 13,
        color: 0xaa00ff,
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
        speed: 420,
        size: 18,
        color: 0xff0000,
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