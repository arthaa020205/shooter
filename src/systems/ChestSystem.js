export default class ChestSystem {
    constructor(scene) {
        this.scene = scene;
        this.chests = [];
    }

    createChests() {
        for (let i = 0; i < 45; i++) {
            const pos = this.getSafePosition();
            this.spawnChest(pos.x, pos.y);
        }
    }

    getSafePosition() {
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
                Math.max(obstacle.width || 90, obstacle.height || 90) / 2 + 120;

            if (distance < safeDistance) {
                return true;
            }
        }

        return false;
    }

    spawnChest(x, y) {
        const chest = this.scene.add.container(x, y);

        chest.active = true;
        chest.opened = false;

        const shadow = this.scene.add.ellipse(
            0,
            18,
            48,
            16,
            0x000000,
            0.25
        );

        const box = this.scene.add.rectangle(
            0,
            0,
            42,
            32,
            0x8b5a2b
        );

        box.setStrokeStyle(3, 0x3b2412);

        const lid = this.scene.add.rectangle(
            0,
            -13,
            46,
            10,
            0x5c3516
        );

        const lock = this.scene.add.rectangle(
            0,
            2,
            10,
            12,
            0xf3a922
        );

        const label = this.scene.add.text(
            0,
            -38,
            "CHEST",
            {
                fontSize: "12px",
                color: "#ffffff",
                backgroundColor: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        chest.add([
            shadow,
            box,
            lid,
            lock,
            label
        ]);

        chest.box = box;
        chest.lid = lid;
        chest.lock = lock;
        chest.label = label;

        if (this.chests.length < 20) {
            this.scene.tweens.add({
                targets: chest,
                y: y - 4,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        this.chests.push(chest);
    }

    findNearestChest(sprite) {
        let nearestChest = null;
        let nearestDistance = Infinity;

        for (let i = 0; i < this.chests.length; i++) {
            const chest = this.chests[i];

            if (!chest.active || chest.opened) continue;

            const distance = Phaser.Math.Distance.Between(
                sprite.x,
                sprite.y,
                chest.x,
                chest.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestChest = chest;
            }
        }

        return nearestChest;
    }

    openNearestChestByPlayer(player) {
        const chest = this.findNearestChest(player.sprite);

        if (!chest) return false;

        const distance = Phaser.Math.Distance.Between(
            player.sprite.x,
            player.sprite.y,
            chest.x,
            chest.y
        );

        if (distance > 70) return false;

        this.openChest(chest);

        return true;
    }

    openNearestChestByEnemy(enemy) {
        const chest = this.findNearestChest(enemy.sprite);

        if (!chest) return false;

        const distance = Phaser.Math.Distance.Between(
            enemy.sprite.x,
            enemy.sprite.y,
            chest.x,
            chest.y
        );

        if (distance > 65) return false;

        this.openChest(chest);

        return true;
    }

    openChest(chest) {
        if (!chest.active || chest.opened) return;

        chest.opened = true;
        chest.active = false;

        chest.box.fillColor = 0x4a2a12;
        chest.lid.y -= 16;

        if (chest.label) {
            chest.label.setText("OPENED");
        }

        const lootCount = Phaser.Math.Between(1, 3);

        for (let i = 0; i < lootCount; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(35, 75);

            const lootX = chest.x + Math.cos(angle) * distance;
            const lootY = chest.y + Math.sin(angle) * distance;

            this.spawnRandomLoot(lootX, lootY);
        }

        this.scene.time.delayedCall(1200, () => {
            if (chest.label) chest.label.destroy();
            chest.destroy();
        });
    }

    spawnRandomLoot(x, y) {
        const roll = Phaser.Math.Between(1, 100);

        if (roll <= 65) {
            const weapons = [
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

            const weaponType = Phaser.Utils.Array.GetRandom(weapons);

            this.scene.weaponSystem.spawnWeapon(
                x,
                y,
                weaponType
            );
        } else {
            const items = [
                "medkit",
                "helmet",
                "vest"
            ];

            const itemType = Phaser.Utils.Array.GetRandom(items);

            this.scene.itemSystem.spawnItem(
                x,
                y,
                itemType
            );
        }
    }
}