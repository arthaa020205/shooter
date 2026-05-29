import WeaponVisualFactory from "../systems/WeaponVisualFactory.js";

export default class Enemy {
    constructor(scene, x, y, nickname) {

        this.scene = scene;

        this.hp = 100;

        this.inventory = [];
        this.currentWeapon = null;

        this.nickname = nickname;

        this.shootCooldown = 0;

        this.lastX = x;
        this.lastY = y;

        this.lastShotTime = 0;

        this.stuckTimer = 0;

        this.unstuckTime = 0;
        this.unstuckAngle = 0;

        this.waypoint = null;
        this.waypointTimer = 0;

        this.hasHelmet = false;
        this.hasVest = false;

        // =========================
        // CONTAINER
        // =========================

        this.sprite = scene.add.container(x, y);

        // =========================
        // SHADOW
        // =========================

        this.shadow = scene.add.ellipse(
            0,
            18,
            46,
            18,
            0x000000,
            0.25
        );

        // =========================
        // BODY
        // =========================

        this.body = scene.add.circle(
            0,
            0,
            24,
            0xff6666
        );

        this.body.setStrokeStyle(
            3,
            0xcc3333
        );

        // =========================
        // HELMET
        // =========================

        this.helmet = scene.add.arc(
            0,
            -6,
            25,
            180,
            360,
            false,
            0x992222
        );

        this.helmet.setStrokeStyle(
            2,
            0x551111
        );

        // =========================
        // VISOR
        // =========================

        this.visor = scene.add.rectangle(
            0,
            -12,
            30,
            8,
            0x111111
        );

        // =========================
        // WEAPON
        // =========================

        this.weaponSprite = scene.add.container(8, 2);
        this.weaponVisual = null;

        this.sprite.add([
            this.shadow,
            this.body,
            this.helmet,
            this.visor,
            this.weaponSprite
        ]);
        // =========================
        // PHYSICS
        // =========================

        scene.physics.add.existing(this.sprite);

        this.sprite.body.setSize(35, 35);

        this.sprite.body.setOffset(
            -17.5,
            -17.5
        );

        this.sprite.body.setCollideWorldBounds(true);

        // =========================
        // NAME
        // =========================

        this.nameText = scene.add.text(
            x,
            y - 50,
            nickname,
            {
                fontSize: "14px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

    }

    updateNamePosition() {

        this.nameText.x = Phaser.Math.Linear(
    this.nameText.x,
    this.sprite.x,
    0.15
);

this.nameText.y = Phaser.Math.Linear(
    this.nameText.y,
    this.sprite.y - 48,
    0.15
);

    }

    moveTo(target, speed = 130) {

        const angle =
            Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                target.x,
                target.y
            );

        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.weaponSprite.rotation = angle;

    }

    moveAwayFrom(target, speed = 130) {

        const angle =
            Phaser.Math.Angle.Between(
                target.x,
                target.y,
                this.sprite.x,
                this.sprite.y
            );

        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        this.weaponSprite.rotation = angle;

    }

    strafeAround(target, speed = 110) {

        const angle =
            Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                target.x,
                target.y
            );

        const side =
            this.nickname.length % 2 === 0
                ? 1
                : -1;

        const strafeAngle =
            angle + side * Math.PI / 2;

        this.sprite.body.setVelocity(
            Math.cos(strafeAngle) * speed,
            Math.sin(strafeAngle) * speed
        );

        this.weaponSprite.rotation = angle;

    }

    dodgeFromPoint(point, speed = 180) {

        const angle =
            Phaser.Math.Angle.Between(
                point.x,
                point.y,
                this.sprite.x,
                this.sprite.y
            );

        this.sprite.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

    }

    stop() {
        this.sprite.body.setVelocity(0);
    }

    pickupWeapon(weaponType) {

        if (!this.inventory.includes(weaponType)) {
            this.inventory.push(weaponType);
        }

        this.currentWeapon = weaponType;

        this.updateWeaponVisual();

    }

    updateWeaponVisual() {
    if (this.weaponVisual) {
        this.weaponVisual.destroy();
        this.weaponVisual = null;
    }

    if (!this.currentWeapon) return;

    this.weaponVisual = WeaponVisualFactory.create(
        this.scene,
        this.currentWeapon,
        0,
        0,
        0.85
    );

    this.weaponSprite.add(this.weaponVisual);
}

    hasWeapon() {
        return this.inventory.length > 0;
    }

    takeDamage(amount) {

    let finalDamage = amount;

    if (this.hasHelmet) {
        finalDamage -= 3;
    }

    if (this.hasVest) {
        finalDamage -= 5;
    }

    if (finalDamage < 1) {
        finalDamage = 1;
    }

    this.hp -= finalDamage;

    this.body.fillColor = 0xff4444;

    this.scene.time.delayedCall(100, () => {

        if (this.hp > 0) {

            this.body.fillColor =
                this.originalBodyColor || 0xff5555;

        }

    });

    if (this.hp <= 0) {

        this.destroy();

    }
}

    destroy() {

        this.nameText.destroy();

        this.sprite.destroy();

    }

    avoidStuck(delta) {

        if (!this.sprite.active) return false;

        if (this.unstuckTime > 0) {

            this.unstuckTime -= delta;

            this.sprite.body.setVelocity(
                Math.cos(this.unstuckAngle) * 240,
                Math.sin(this.unstuckAngle) * 240
            );

            return true;

        }

        const movedDistance =
            Phaser.Math.Distance.Between(
                this.sprite.x,
                this.sprite.y,
                this.lastX,
                this.lastY
            );

        if (movedDistance < 1) {
            this.stuckTimer += delta;
        }

        else {
            this.stuckTimer = 0;
        }

        this.lastX = this.sprite.x;
        this.lastY = this.sprite.y;

        if (this.stuckTimer > 500) {

            this.unstuckAngle =
                Phaser.Math.FloatBetween(
                    0,
                    Math.PI * 2
                );

            this.unstuckTime = 700;

            this.stuckTimer = 0;

            return true;

        }

        return false;

    }

    avoidObstacle(obstacles) {

        for (let i = 0; i < obstacles.length; i++) {

            const obstacle = obstacles[i];

            const distance =
                Phaser.Math.Distance.Between(
                    this.sprite.x,
                    this.sprite.y,
                    obstacle.x,
                    obstacle.y
                );

            const safeDistance =
                Math.max(
                    obstacle.width || 80,
                    obstacle.height || 80
                ) / 2 + 70;

            if (distance < safeDistance) {

                const angle =
                    Phaser.Math.Angle.Between(
                        obstacle.x,
                        obstacle.y,
                        this.sprite.x,
                        this.sprite.y
                    );

                const sideAngle =
                    angle + Math.PI / 2;

                this.sprite.body.setVelocity(
                    Math.cos(sideAngle) * 170,
                    Math.sin(sideAngle) * 170
                );

                return true;

            }

        }

        return false;

    }

    setWaypoint(x, y) {

        this.waypoint = { x, y };

        this.waypointTimer = 1200;

    }

    moveToWaypoint(delta) {

        if (!this.waypoint) return false;

        this.waypointTimer -= delta;

        const distance =
            Phaser.Math.Distance.Between(
                this.sprite.x,
                this.sprite.y,
                this.waypoint.x,
                this.waypoint.y
            );

        if (
            distance < 40 ||
            this.waypointTimer <= 0
        ) {

            this.waypoint = null;

            return false;

        }

        this.moveTo(
            this.waypoint,
            170
        );

        return true;

    }
}