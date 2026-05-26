import WeaponVisualFactory from "./WeaponVisualFactory.js";

export default class WeaponSystem {
    constructor(scene) {
        this.scene = scene;
        this.weapons = [];

        this.weaponData = {
            pistol: { name: "Pistol", color: 0x444444 },
            uzi: { name: "UZI", color: 0x00ccff },
            smg: { name: "SMG", color: 0x00ff99 },
            ak: { name: "AK", color: 0xff6600 },
            m4: { name: "M4", color: 0x0066ff },
            scar: { name: "SCAR", color: 0xffff00 },
            sniper: { name: "AWM", color: 0xaa00ff },
            rpg: { name: "RPG", color: 0xff0000 },
            bomb: { name: "Grenade", color: 0xcc0000 }
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

        return { x, y };
    }

    isNearObstacle(x, y) {
        if (!this.scene.mapSystem) return false;

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

        const weapon = this.scene.add.container(x, y);

        weapon.weaponType = type;
        weapon.active = true;

        const shadow = this.scene.add.ellipse(
            0,
            13,
            46,
            14,
            0x000000,
            0.25
        );

        const visual = WeaponVisualFactory.create(
            this.scene,
            type,
            -20,
            0,
            0.75
        );

        const label = this.scene.add.text(
            0,
            -34,
            data.name,
            {
                fontSize: "13px",
                color: "#ffffff",
                backgroundColor: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        weapon.add([
            shadow,
            visual,
            label
        ]);

        weapon.label = label;
        weapon.visual = visual;

        if (this.weapons.length < 20) {
    this.scene.tweens.add({
        targets: weapon,
        y: y - 4,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
    });
}

        this.weapons.push(weapon);
    }

    removeWeapon(weapon) {
        if (weapon.label) {
            weapon.label.destroy();
        }

        if (weapon.visual) {
            weapon.visual.destroy();
        }

        weapon.active = false;
        weapon.destroy();
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

            if (distance < 55) {
                player.pickupWeapon(weapon.weaponType);
                this.removeWeapon(weapon);

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

            if (distance < 55) {
                enemy.pickupWeapon(weapon.weaponType);
                this.removeWeapon(weapon);

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