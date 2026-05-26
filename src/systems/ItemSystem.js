export default class ItemSystem {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
    }

    createItems() {
        const itemTypes = [
            "medkit",
            "helmet",
            "vest"
        ];

        for (let i = 0; i < 35; i++) {
            const type = Phaser.Utils.Array.GetRandom(itemTypes);
            const pos = this.getSafePosition();

            this.spawnItem(pos.x, pos.y, type);
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
                Math.max(obstacle.width || 90, obstacle.height || 90) / 2 + 100;

            if (distance < safeDistance) {
                return true;
            }
        }

        return false;
    }

    spawnItem(x, y, type) {
        const item = this.scene.add.container(x, y);

        item.itemType = type;
        item.active = true;

        const shadow = this.scene.add.ellipse(
            0,
            14,
            40,
            12,
            0x000000,
            0.25
        );

        let visual;
        let labelText;

        if (type === "medkit") {
            visual = this.createMedkitVisual();
            labelText = "Medkit";
        } else if (type === "helmet") {
            visual = this.createHelmetVisual();
            labelText = "Helmet";
        } else {
            visual = this.createVestVisual();
            labelText = "Vest";
        }

        const label = this.scene.add.text(
            0,
            -34,
            labelText,
            {
                fontSize: "13px",
                color: "#ffffff",
                backgroundColor: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        item.add([
            shadow,
            visual,
            label
        ]);

        item.visual = visual;
        item.label = label;

        if (this.items.length < 15) {
            this.scene.tweens.add({
                targets: item,
                y: y - 4,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut"
            });
        }

        this.items.push(item);
    }

    createMedkitVisual() {
        const box = this.scene.add.rectangle(0, 0, 30, 24, 0xffffff);
        box.setStrokeStyle(2, 0x111111);

        const h = this.scene.add.rectangle(0, 0, 20, 6, 0xff3333);
        const v = this.scene.add.rectangle(0, 0, 6, 18, 0xff3333);

        const container = this.scene.add.container(0, 0);
        container.add([box, h, v]);

        return container;
    }

    createHelmetVisual() {
        const helmet = this.scene.add.arc(
            0,
            4,
            18,
            180,
            360,
            false,
            0x2f6b2f
        );

        helmet.setStrokeStyle(2, 0x111111);

        const visor = this.scene.add.rectangle(
            0,
            -3,
            26,
            6,
            0x111111
        );

        const container = this.scene.add.container(0, 0);
        container.add([helmet, visor]);

        return container;
    }

    createVestVisual() {
        const vest = this.scene.add.rectangle(
            0,
            0,
            30,
            34,
            0x4444ff
        );

        vest.setStrokeStyle(2, 0x111111);

        const line = this.scene.add.rectangle(
            0,
            0,
            4,
            30,
            0x222288
        );

        const container = this.scene.add.container(0, 0);
        container.add([vest, line]);

        return container;
    }

    checkPlayerPickup(player) {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            if (!item.active) continue;

            const distance = Phaser.Math.Distance.Between(
                player.sprite.x,
                player.sprite.y,
                item.x,
                item.y
            );

            if (distance < 55) {
                this.applyItemToPlayer(player, item.itemType);
                this.removeItem(item);

                return true;
            }
        }

        return false;
    }

    applyItemToPlayer(player, type) {
        if (type === "medkit") {
            player.heal(35);
        }

        if (type === "helmet") {
            player.equipHelmet();
        }

        if (type === "vest") {
            player.equipVest();
        }
    }

    removeItem(item) {
        if (item.label) item.label.destroy();
        if (item.visual) item.visual.destroy();

        item.active = false;
        item.destroy();
    }

    checkEnemyPickup(enemy) {

    for (let i = 0; i < this.items.length; i++) {

        const item = this.items[i];

        if (!item.active) continue;

        const distance = Phaser.Math.Distance.Between(
            enemy.sprite.x,
            enemy.sprite.y,
            item.x,
            item.y
        );

        if (distance < 55) {

            this.applyItemToEnemy(
                enemy,
                item.itemType
            );

            this.removeItem(item);

            return true;
        }
    }

    return false;
}

applyItemToEnemy(enemy, type) {

    if (type === "medkit") {

        // Enemy cuma heal kalau HP rendah
        if (enemy.hp < 50) {

            enemy.hp += 35;

            if (enemy.hp > 100) {
                enemy.hp = 100;
            }

        }

    }

    if (type === "helmet") {

        enemy.hasHelmet = true;

        if (enemy.helmet) {
            enemy.helmet.fillColor = 0x555555;
        }

    }

    if (type === "vest") {

        enemy.hasVest = true;

        if (enemy.body) {
            enemy.body.setStrokeStyle(
                5,
                0x4444ff
            );
        }

    }

    
}
findNearestItem(sprite) {
    let nearestItem = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];

        if (!item.active) continue;

        const distance = Phaser.Math.Distance.Between(
            sprite.x,
            sprite.y,
            item.x,
            item.y
        );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestItem = item;
        }
    }

    return nearestItem;
}
}