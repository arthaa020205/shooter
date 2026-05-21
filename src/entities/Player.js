import SaveSystem from "../systems/SaveSystem.js";

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.hp = 100;

        this.inventory = [];
        this.currentWeaponIndex = 0;

        this.weaponAmmo = {};
        this.isReloading = false;

        this.selectedCharacter = SaveSystem.getSelectedCharacter();

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
            0xffffff
        );

        this.body.setStrokeStyle(3, 0xcccccc);

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
            0x2f6b2f
        );

        this.helmet.setStrokeStyle(2, 0x183818);

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

        this.weaponBody = scene.add.rectangle(
            18,
            0,
            34,
            8,
            0x222222
        );

        this.weaponBarrel = scene.add.rectangle(
            38,
            0,
            18,
            4,
            0x111111
        );

        this.weaponHandle = scene.add.rectangle(
            12,
            8,
            6,
            14,
            0x333333
        );

        this.weaponSprite.add([
            this.weaponBody,
            this.weaponBarrel,
            this.weaponHandle
        ]);

        this.sprite.add([
            this.shadow,
            this.weaponSprite,
            this.body,
            this.helmet,
            this.visor
        ]);

        this.applyCharacterSkin();

        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCircle(24);
        this.sprite.body.setOffset(-24, -24);
        this.sprite.body.setCollideWorldBounds(true);
    }

    move(keys) {
        const speed = 250;

        this.sprite.body.setVelocity(0);

        if (keys.left.isDown) {
            this.sprite.body.setVelocityX(-speed);
        }

        if (keys.right.isDown) {
            this.sprite.body.setVelocityX(speed);
        }

        if (keys.up.isDown) {
            this.sprite.body.setVelocityY(-speed);
        }

        if (keys.down.isDown) {
            this.sprite.body.setVelocityY(speed);
        }

        const pointer = this.scene.input.activePointer;

        const angle = Phaser.Math.Angle.Between(
            this.sprite.x,
            this.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        this.weaponSprite.setRotation(angle);
    }

    takeDamage(amount) {
        this.hp -= amount;

        const originalColor = this.body.fillColor;

        this.body.fillColor = 0xff4444;

        this.scene.time.delayedCall(120, () => {
            if (this.hp > 0) {
                this.body.fillColor = originalColor;
            }
        });
    }

    pickupWeapon(weaponType) {
        if (!this.inventory.includes(weaponType)) {
            this.inventory.push(weaponType);
        }

        this.currentWeaponIndex = this.inventory.indexOf(weaponType);
            if (!this.weaponAmmo[weaponType]) {

                const config =
                    this.scene.bulletSystem.getWeaponConfig(
                        weaponType
                    );

                this.weaponAmmo[weaponType] =
                    config.ammo;
            }

        this.updateWeaponVisual();
    }

    hasWeapon() {
        return this.inventory.length > 0;
    }

    getCurrentWeapon() {
        if (this.inventory.length === 0) {
            return null;
        }

        return this.inventory[this.currentWeaponIndex];
    }

    switchWeapon(index) {
        if (index >= 0 && index < this.inventory.length) {
            this.currentWeaponIndex = index;
            this.updateWeaponVisual();
        }
    }

    updateWeaponVisual() {
        const weapon = this.getCurrentWeapon();

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

        this.weaponBody.fillColor = colors[weapon] || 0x222222;
        this.weaponBarrel.fillColor = 0x111111;
        this.weaponHandle.fillColor = 0x333333;

        if (weapon === "pistol") {
            this.weaponBody.width = 20;
            this.weaponBody.height = 8;

            this.weaponBarrel.width = 9;
            this.weaponBarrel.height = 4;
            this.weaponBarrel.x = 25;

            this.weaponHandle.width = 6;
            this.weaponHandle.height = 12;
            this.weaponHandle.x = 10;
            this.weaponHandle.y = 8;
        } else if (weapon === "uzi" || weapon === "smg") {
            this.weaponBody.width = 28;
            this.weaponBody.height = 10;

            this.weaponBarrel.width = 12;
            this.weaponBarrel.height = 4;
            this.weaponBarrel.x = 31;

            this.weaponHandle.width = 7;
            this.weaponHandle.height = 14;
            this.weaponHandle.x = 13;
            this.weaponHandle.y = 9;
        } else if (weapon === "ak" || weapon === "m4" || weapon === "scar") {
            this.weaponBody.width = 38;
            this.weaponBody.height = 9;

            this.weaponBarrel.width = 22;
            this.weaponBarrel.height = 4;
            this.weaponBarrel.x = 43;

            this.weaponHandle.width = 7;
            this.weaponHandle.height = 15;
            this.weaponHandle.x = 15;
            this.weaponHandle.y = 9;
        } else if (weapon === "sniper") {
            this.weaponBody.width = 48;
            this.weaponBody.height = 8;

            this.weaponBarrel.width = 35;
            this.weaponBarrel.height = 3;
            this.weaponBarrel.x = 58;

            this.weaponHandle.width = 7;
            this.weaponHandle.height = 14;
            this.weaponHandle.x = 18;
            this.weaponHandle.y = 9;
        } else if (weapon === "shotgun") {
            this.weaponBody.width = 44;
            this.weaponBody.height = 12;

            this.weaponBarrel.width = 26;
            this.weaponBarrel.height = 6;
            this.weaponBarrel.x = 50;

            this.weaponHandle.width = 8;
            this.weaponHandle.height = 15;
            this.weaponHandle.x = 17;
            this.weaponHandle.y = 10;
        } else if (weapon === "rpg") {
            this.weaponBody.width = 52;
            this.weaponBody.height = 14;

            this.weaponBarrel.width = 28;
            this.weaponBarrel.height = 10;
            this.weaponBarrel.x = 56;

            this.weaponHandle.width = 9;
            this.weaponHandle.height = 18;
            this.weaponHandle.x = 18;
            this.weaponHandle.y = 13;
        } else if (weapon === "bomb") {
            this.weaponBody.width = 18;
            this.weaponBody.height = 18;

            this.weaponBarrel.width = 0;
            this.weaponBarrel.height = 0;

            this.weaponHandle.width = 0;
            this.weaponHandle.height = 0;
        } else {
            this.weaponBody.width = 28;
            this.weaponBody.height = 8;

            this.weaponBarrel.width = 12;
            this.weaponBarrel.height = 4;
            this.weaponBarrel.x = 31;

            this.weaponHandle.width = 6;
            this.weaponHandle.height = 12;
            this.weaponHandle.x = 12;
            this.weaponHandle.y = 8;
        }
    }

    getCurrentAmmo() {
    const weapon = this.getCurrentWeapon();

    if (!weapon) return 0;

    return this.weaponAmmo[weapon] || 0;
}

useAmmo() {
    const weapon = this.getCurrentWeapon();

    if (!weapon) return;

    if (this.weaponAmmo[weapon] > 0) {
        this.weaponAmmo[weapon]--;
    }
}

reload() {

    if (this.isReloading) return;

    const weapon = this.getCurrentWeapon();

    if (!weapon) return;

    const config =
        this.scene.bulletSystem.getWeaponConfig(
            weapon
        );

    if (
        this.weaponAmmo[weapon] >= config.ammo
    ) {
        return;
    }

    this.isReloading = true;

    this.scene.uiSystem.showReloadText();

    this.scene.time.delayedCall(
        config.reload,
        () => {

            this.weaponAmmo[weapon] =
                config.ammo;

            this.isReloading = false;

            this.scene.uiSystem.hideReloadText();

        }
    );
}

    applyCharacterSkin() {
        const skins = {
            default: {
                bodyColor: 0xffffff,
                helmetColor: 0x2f6b2f,
                strokeColor: 0xcccccc
            },

            red: {
                bodyColor: 0xff6666,
                helmetColor: 0x992222,
                strokeColor: 0xcc3333
            },

            blue: {
                bodyColor: 0x66aaff,
                helmetColor: 0x003399,
                strokeColor: 0x2255aa
            },

            gold: {
                bodyColor: 0xffdd55,
                helmetColor: 0xaa7700,
                strokeColor: 0xffaa00
            }
        };

        const skin = skins[this.selectedCharacter] || skins.default;

        this.body.fillColor = skin.bodyColor;
        this.body.setStrokeStyle(3, skin.strokeColor);

        this.helmet.fillColor = skin.helmetColor;
    }
}