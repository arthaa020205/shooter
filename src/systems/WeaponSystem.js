export default class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.weapons = [];

        // Tambahkan dimensi visual hiasan barrel senjata di constructor WeaponSystem kamu:
this.weaponData = {
    pistol: {
        name: "P1911",
        color: 0x555555,
        clipSize: 7,
        maxReserve: 35,
        visualW: 24, // Panjang moncong saat dipegang hand
        visualH: 6   // Tebal senjatanya
    },
    uzi: {
        name: "UZI",
        color: 0x00ccff,
        clipSize: 25,
        maxReserve: 100,
        visualW: 22,
        visualH: 10
    },
    smg: {
        name: "MP5",
        color: 0x00ff99,
        clipSize: 30,
        maxReserve: 120,
        visualW: 32,
        visualH: 8
    },
    ak: {
        name: "AK-47",
        color: 0xff6600,
        clipSize: 30,
        maxReserve: 90,
        visualW: 42,
        visualH: 9
    },
    m4: {
        name: "M416",
        color: 0x0066ff,
        clipSize: 30,
        maxReserve: 90,
        visualW: 44,
        visualH: 8
    },
    scar: {
        name: "SCAR-L",
        color: 0xffff00,
        clipSize: 30,
        maxReserve: 90,
        visualW: 40,
        visualH: 9
    },
    sniper: {
        name: "AWM",
        color: 0xaa00ff,
        clipSize: 5,
        maxReserve: 15,
        visualW: 56, // Sangat panjang khas sniper rifle
        visualH: 6
    },
    rpg: {
        name: "RPG-7",
        color: 0xff0000,
        clipSize: 1,
        maxReserve: 3,
        visualW: 48,
        visualH: 14
    },
    bomb: {
        name: "Grenade",
        color: 0xcc0000,
        clipSize: 1,
        maxReserve: 4,
        visualW: 14, // Bulat kecil di genggaman tangan
        visualH: 14
    }
};
    }

    createWeapons() {
        const types = [
            "pistol",
            "uzi",
            "smg",
            "ak",
            "m4",
            "scar",
            "sniper",
            "rpg",
            "bomb"
        ];

        for (let i = 0; i < 45; i++) {
            const type = Phaser.Utils.Array.GetRandom(types);

            const position = this.getSafeWeaponPosition();

            this.spawnWeapon(
                position.x,
                position.y,
                type
            );
        }
    }

    getSafeWeaponPosition() {
        let x;
        let y;
        let valid = false;
        let attempts = 0;

        while (!valid && attempts < 500) {
            attempts++;

            x = Phaser.Math.Between(200, 5800);
            y = Phaser.Math.Between(200, 4300);

            if (!this.isNearObstacle(x, y)) {
                valid = true;
            }
        }

        return {
            x: x,
            y: y
        };
    }

    isNearObstacle(x, y) {
        if (!this.scene.mapSystem) {
            return false;
        }

        for (let i = 0; i < this.scene.mapSystem.obstacles.length; i++) {
            const obstacle = this.scene.mapSystem.obstacles[i];

            const distance = Phaser.Math.Distance.Between(
                x,
                y,
                obstacle.x,
                obstacle.y
            );

            const safeDistance =
                Math.max(
                    obstacle.width || 90,
                    obstacle.height || 90
                ) / 2 + 120;

            if (distance < safeDistance) {
                return true;
            }
        }

        return false;
    }

    spawnWeapon(x, y, type) {
        const data = this.weaponData[type];

        const weapon = this.scene.add.rectangle(
            x,
            y,
            42,
            22,
            data.color
        );

        weapon.weaponType = type;

        const label = this.scene.add.text(
            x,
            y - 28,
            data.name,
            {
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: "#000000"
            }
        ).setOrigin(0.5);

        weapon.label = label;

        this.weapons.push(weapon);
    }

    checkPlayerPickup(player) {
        for (let i = 0; i < this.weapons.length; i++) {
            const weapon = this.weapons[i];

            if (!weapon.active) continue;

            const distance = Phaser.Math.Distance.Between(
                player.sprite.x,
                player.sprite.y,
                weapon.x,
                weapon.y
            );

            if (distance < 50) {
                player.pickupWeapon(weapon.weaponType);

                if (weapon.label) weapon.label.destroy();

                weapon.destroy();

                return true;
            }
        }

        return false;
    }

    checkEnemyPickup(enemy) {
        for (let i = 0; i < this.weapons.length; i++) {
            const weapon = this.weapons[i];

            if (!weapon.active) continue;

            const distance = Phaser.Math.Distance.Between(
                enemy.sprite.x,
                enemy.sprite.y,
                weapon.x,
                weapon.y
            );

            if (distance < 50) {
                enemy.pickupWeapon(weapon.weaponType);

                if (weapon.label) weapon.label.destroy();

                weapon.destroy();

                return true;
            }
        }

        return false;
    }

    findNearestWeapon(sprite) {
        let nearestWeapon = null;
        let nearestDistance = Infinity;

        for (let i = 0; i < this.weapons.length; i++) {
            const weapon = this.weapons[i];

            if (!weapon.active) continue;

            const distance = Phaser.Math.Distance.Between(
                sprite.x,
                sprite.y,
                weapon.x,
                weapon.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestWeapon = weapon;
            }
        }

        return nearestWeapon;
    }
}