export default class ZoneSystem {
    constructor(scene) {
        this.scene = scene;

        this.worldWidth = 6000;
        this.worldHeight = 4500;

        this.phase = 0;

        this.zonePhases = [
            {
                waitTime: 60,
                startRadius: 2200,
                endRadius: 1500,
                damage: 3
            },
            {
                waitTime: 60,
                startRadius: 1500,
                endRadius: 900,
                damage: 5
            },
            {
                waitTime: 60,
                startRadius: 900,
                endRadius: 450,
                damage: 8
            },
            {
                waitTime: 60,
                startRadius: 450,
                endRadius: 220,
                damage: 12
            }
        ];

        this.centerX = Phaser.Math.Between(1500, 4500);
        this.centerY = Phaser.Math.Between(1200, 3300);

        this.nextCenterX = this.centerX;
        this.nextCenterY = this.centerY;

        this.radius = this.zonePhases[0].startRadius;

        this.state = "waiting";
        this.timer = this.zonePhases[0].waitTime;

        this.shrinkDuration = 25;
        this.shrinkTimer = 0;

        this.startShrinkRadius = this.radius;
        this.targetShrinkRadius = this.zonePhases[0].endRadius;

        this.startCenterX = this.centerX;
        this.startCenterY = this.centerY;

        this.damageTimer = 0;
        this.active = false;

        this.zoneGraphics = scene.add.graphics();
        this.redOverlay = scene.add.graphics();

        this.redOverlay.setDepth(900);
        this.zoneGraphics.setDepth(1000);
    }

    update(player, delta) {
        const dt = delta / 1000;

        this.updatePhase(dt);

        this.drawDangerArea();
        this.drawZone();

        if (!this.active) {
            return false;
        }

        const distance = Phaser.Math.Distance.Between(
            player.sprite.x,
            player.sprite.y,
            this.centerX,
            this.centerY
        );

        if (distance > this.radius) {
            this.damageTimer += delta;

            if (this.damageTimer >= 1000) {
                player.takeDamage(this.getCurrentDamage());
                this.damageTimer = 0;
                return true;
            }
        }

        return false;
    }

    updatePhase(dt) {
        if (this.state === "waiting") {
            this.timer -= dt;

            if (this.timer <= 0) {
                this.startShrink();
            }
        } else if (this.state === "shrinking") {
            this.shrinkTimer += dt;

            const progress = Phaser.Math.Clamp(
                this.shrinkTimer / this.shrinkDuration,
                0,
                1
            );

            this.radius = Phaser.Math.Linear(
                this.startShrinkRadius,
                this.targetShrinkRadius,
                progress
            );

            this.centerX = Phaser.Math.Linear(
                this.startCenterX,
                this.nextCenterX,
                progress
            );

            this.centerY = Phaser.Math.Linear(
                this.startCenterY,
                this.nextCenterY,
                progress
            );

            if (progress >= 1) {
                this.finishShrink();
            }
        }
    }

    startShrink() {
        this.active = true;
        this.state = "shrinking";

        const currentPhase = this.zonePhases[this.phase];

        this.shrinkTimer = 0;

        this.startShrinkRadius = this.radius;
        this.targetShrinkRadius = currentPhase.endRadius;

        this.startCenterX = this.centerX;
        this.startCenterY = this.centerY;

        this.pickNextCenter();
    }

    finishShrink() {
        this.radius = this.targetShrinkRadius;
        this.centerX = this.nextCenterX;
        this.centerY = this.nextCenterY;

        this.phase++;

        if (this.phase >= this.zonePhases.length) {
            this.state = "final";
            return;
        }

        this.state = "waiting";
        this.timer = this.zonePhases[this.phase].waitTime;
    }

    pickNextCenter() {
        const margin = this.targetShrinkRadius + 200;

        const minX = Math.max(400, this.centerX - this.radius / 2);
        const maxX = Math.min(this.worldWidth - 400, this.centerX + this.radius / 2);

        const minY = Math.max(400, this.centerY - this.radius / 2);
        const maxY = Math.min(this.worldHeight - 400, this.centerY + this.radius / 2);

        this.nextCenterX = Phaser.Math.Between(
            Math.max(minX, margin),
            Math.min(maxX, this.worldWidth - margin)
        );

        this.nextCenterY = Phaser.Math.Between(
            Math.max(minY, margin),
            Math.min(maxY, this.worldHeight - margin)
        );
    }

    drawZone() {
        this.zoneGraphics.clear();

        if (!this.active) {
            return;
        }

        this.zoneGraphics.lineStyle(12, 0xff0000, 0.25);

        this.zoneGraphics.strokeCircle(
            this.centerX,
            this.centerY,
            this.radius
        );

        if (this.state === "waiting" && this.phase < this.zonePhases.length) {
            this.zoneGraphics.lineStyle(3, 0xffffff, 0.5);

            this.zoneGraphics.strokeCircle(
                this.nextCenterX,
                this.nextCenterY,
                this.zonePhases[this.phase].endRadius
            );
        }
    }

    drawDangerArea() {
        this.redOverlay.clear();

        if (!this.active) {
            return;
        }

        this.redOverlay.fillStyle(0xff0000, 0.18);

        this.redOverlay.fillRect(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.redOverlay.fillStyle(0x5dbb63, 0.18);

        this.redOverlay.fillCircle(
            this.centerX,
            this.centerY,
            this.radius
        );
    }

    isOutsideZone(sprite) {
        if (!this.active) return false;

        const distance = Phaser.Math.Distance.Between(
            sprite.x,
            sprite.y,
            this.centerX,
            this.centerY
        );

        return distance > this.radius;
    }

    getZoneCenterTarget() {
        return {
            x: this.centerX,
            y: this.centerY
        };
    }

    getCurrentDamage() {
        const currentPhase = this.zonePhases[
            Math.min(this.phase, this.zonePhases.length - 1)
        ];

        return currentPhase.damage;
    }

    getTimerText() {
        if (this.state === "waiting") {
            return "ZONE " + (this.phase + 1) + " - " + Math.ceil(this.timer) + "s";
        }

        if (this.state === "shrinking") {
            return "ZONE " + (this.phase + 1) + " CLOSING";
        }

        return "FINAL ZONE";
    }
}