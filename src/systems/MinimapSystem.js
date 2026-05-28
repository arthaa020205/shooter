export default class MinimapSystem {
    constructor(scene) {
        this.scene = scene;

        this.mapWidth = 6000;
        this.mapHeight = 4500;

        this.size = 180;
        this.margin = 30;

        this.x = scene.scale.width - this.size - this.margin;
        this.y = this.margin;

        this.centerX = this.x + this.size / 2;
        this.centerY = this.y + this.size / 2;
        this.radius = this.size / 2;

        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(2500);

        this.createCompassLabels(scene);
    }

    createCompassLabels(scene) {
        const style = {
            fontSize: "11px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black, Arial, sans-serif"
        };

        this.lblN = scene.add.text(this.centerX, this.y - 12, "N", style).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblS = scene.add.text(this.centerX, this.y + this.size + 12, "S", style).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblW = scene.add.text(this.x - 12, this.centerY, "W", style).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblE = scene.add.text(this.x + this.size + 12, this.centerY, "E", style).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
    }

    worldToMinimap(worldX, worldY) {
        return {
            x: this.x + (worldX / this.mapWidth) * this.size,
            y: this.y + (worldY / this.mapHeight) * this.size
        };
    }

    isInsideRadar(x, y, padding = 0) {
        const distance = Phaser.Math.Distance.Between(
            this.centerX,
            this.centerY,
            x,
            y
        );

        return distance <= this.radius - padding;
    }

    clampPointToRadar(x, y, padding = 4) {
        const distance = Phaser.Math.Distance.Between(
            this.centerX,
            this.centerY,
            x,
            y
        );

        const maxRadius = this.radius - padding;

        if (distance <= maxRadius) {
            return { x, y };
        }

        const angle = Phaser.Math.Angle.Between(
            this.centerX,
            this.centerY,
            x,
            y
        );

        return {
            x: this.centerX + Math.cos(angle) * maxRadius,
            y: this.centerY + Math.sin(angle) * maxRadius
        };
    }

    drawClippedCircle(centerX, centerY, radius, color, alpha, lineWidth) {
        const segments = 180;
        let drawing = false;

        this.graphics.lineStyle(lineWidth, color, alpha);

        for (let i = 0; i <= segments; i++) {
            const angle = (Math.PI * 2 * i) / segments;

            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;

            const inside = this.isInsideRadar(px, py, 1);

            if (inside) {
                if (!drawing) {
                    this.graphics.beginPath();
                    this.graphics.moveTo(px, py);
                    drawing = true;
                } else {
                    this.graphics.lineTo(px, py);
                }
            } else {
                if (drawing) {
                    this.graphics.strokePath();
                    drawing = false;
                }
            }
        }

        if (drawing) {
            this.graphics.strokePath();
        }
    }

    update(player, enemies, zoneSystem) {
        this.graphics.clear();

        // =========================
        // BASE RADAR
        // =========================
        this.graphics.fillStyle(0x0c1014, 0.75);
        this.graphics.fillCircle(
            this.centerX,
            this.centerY,
            this.radius
        );

        this.graphics.lineStyle(1, 0xffffff, 0.05);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius * 0.66);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius * 0.33);

        this.graphics.lineStyle(1, 0xffffff, 0.08);
        this.graphics.moveTo(this.x, this.centerY);
        this.graphics.lineTo(this.x + this.size, this.centerY);
        this.graphics.moveTo(this.centerX, this.y);
        this.graphics.lineTo(this.centerX, this.y + this.size);
        this.graphics.strokePath();

        // =========================
        // ZONE
        // =========================
        if (zoneSystem.active) {
            const zonePos = this.worldToMinimap(
                zoneSystem.centerX,
                zoneSystem.centerY
            );

            const zoneRadius =
                (zoneSystem.radius / this.mapWidth) * this.size;

            this.drawClippedCircle(
                zonePos.x,
                zonePos.y,
                zoneRadius,
                0x00f0ff,
                1,
                2.5
            );
        }

        if (
            zoneSystem.state === "waiting" &&
            zoneSystem.active &&
            zoneSystem.phase < zoneSystem.zonePhases.length
        ) {
            const nextZonePos = this.worldToMinimap(
                zoneSystem.nextCenterX,
                zoneSystem.nextCenterY
            );

            const nextZoneRadius =
                (zoneSystem.zonePhases[zoneSystem.phase].endRadius / this.mapWidth) * this.size;

            this.drawClippedCircle(
                nextZonePos.x,
                nextZonePos.y,
                nextZoneRadius,
                0xffffff,
                0.85,
                1.5
            );
        }

        // =========================
        // ENEMIES
        // =========================
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];

            if (!enemy.sprite.active) continue;

            const rawPos = this.worldToMinimap(
                enemy.sprite.x,
                enemy.sprite.y
            );

            const pos = this.clampPointToRadar(
                rawPos.x,
                rawPos.y,
                5
            );

            this.graphics.fillStyle(0x000000, 0.6);
            this.graphics.fillCircle(pos.x, pos.y, 4.5);

            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillCircle(pos.x, pos.y, 3);
        }

        // =========================
        // PLAYER
        // =========================
        const rawPlayerPos = this.worldToMinimap(
            player.sprite.x,
            player.sprite.y
        );

        const playerPos = this.clampPointToRadar(
            rawPlayerPos.x,
            rawPlayerPos.y,
            6
        );

        const pointer = this.scene.input.activePointer;

        const angleToMouse = Phaser.Math.Angle.Between(
            player.sprite.x,
            player.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        const coneLength = 18;
        const coneAngle = 0.45;

        this.graphics.fillStyle(0xf3a922, 0.4);
        this.graphics.beginPath();
        this.graphics.moveTo(playerPos.x, playerPos.y);
        this.graphics.lineTo(
            playerPos.x + Math.cos(angleToMouse - coneAngle) * coneLength,
            playerPos.y + Math.sin(angleToMouse - coneAngle) * coneLength
        );
        this.graphics.lineTo(
            playerPos.x + Math.cos(angleToMouse + coneAngle) * coneLength,
            playerPos.y + Math.sin(angleToMouse + coneAngle) * coneLength
        );
        this.graphics.closePath();
        this.graphics.fill();

        this.graphics.fillStyle(0x000000, 0.8);
        this.graphics.fillCircle(playerPos.x, playerPos.y, 5.5);

        this.graphics.fillStyle(0xf3a922, 1);
        this.graphics.fillCircle(playerPos.x, playerPos.y, 3.5);

        // =========================
        // BORDER
        // =========================
        this.graphics.lineStyle(2, 0x1f262e, 1);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius);

        this.graphics.lineStyle(1, 0xf3a922, 0.4);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius + 2);
    }
}