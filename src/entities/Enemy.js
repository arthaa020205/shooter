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

        this.stuckTimer = 0;

        this.unstuckTime = 0;
        this.unstuckAngle = 0;

        this.waypoint = null;
        this.waypointTimer = 0;

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

        this.weaponSprite = scene.add.rectangle(
            12,
            2,
            36,
            8,
            0x222222
        );

        this.weaponSprite.setOrigin(0.1, 0.5);

        // =========================
        // ADD
        // =========================

        this.sprite.add([
            this.shadow,
            this.weaponSprite,
            this.body,
            this.helmet,
            this.visor
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

        this.nameText.setPosition(
            this.sprite.x,
            this.sprite.y - 50
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

        const colors = {
            pistol: 0x444444,
            uzi: 0x00ccff,
            smg: 0x00ff99,
            ak: 0xff6600,
            m4: 0x0066ff,
            scar: 0xffff00,
            sniper: 0xaa00ff,
            shotgun: 0xff9900,
            rpg: 0xff0000,
            bomb: 0xcc0000
        };

        this.weaponSprite.fillColor =
            colors[this.currentWeapon] || 0x222222;

        if (this.currentWeapon === "sniper") {
            this.weaponSprite.width = 55;
        }

        else if (this.currentWeapon === "shotgun") {
            this.weaponSprite.width = 45;
        }

        else if (this.currentWeapon === "rpg") {
            this.weaponSprite.width = 50;
        }

        else {
            this.weaponSprite.width = 36;
        }

    }

    hasWeapon() {
        return this.inventory.length > 0;
    }

    takeDamage(amount) {

        this.hp -= amount;

        this.body.fillColor = 0xff0000;

        this.scene.time.delayedCall(120, () => {

            if (this.hp > 0) {
                this.body.fillColor = 0xff6666;
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