import SaveSystem from "../systems/SaveSystem.js";
import WeaponVisualFactory from "../systems/WeaponVisualFactory.js";

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.hp = 100;

        this.inventory = [];
        this.currentWeaponIndex = 0;

        this.weaponAmmo = {};
        this.isReloading = false;

        this.hasHelmet = false;
        this.hasVest = false;

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
        this.weaponVisual = null;

        this.sprite.add([
        this.shadow,
        this.body,
        this.helmet,
        this.visor,
        this.weaponSprite
]);

        this.applyCharacterSkin();

        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCircle(24);
        this.sprite.body.setOffset(-24, -24);
        this.sprite.body.setCollideWorldBounds(true);
    }

    heal(amount) {
    this.hp += amount;

    if (this.hp > 100) {
        this.hp = 100;
    }

    if (this.scene.uiSystem) {
        this.scene.uiSystem.updateHP(this.hp);
    }
}

equipHelmet() {
    this.hasHelmet = true;

    this.helmet.fillColor = 0x555555;
}

equipVest() {
    this.hasVest = true;

    this.body.setStrokeStyle(5, 0x4444ff);
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

    const originalColor = this.body.fillColor;

    this.body.fillColor = 0xff4444;

    this.scene.time.delayedCall(120, () => {
        if (this.hp > 0) {
            this.body.fillColor = originalColor;
        }
    });
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

        const config =
            this.scene.bulletSystem.getWeaponConfig(
                weaponType
            );

        this.weaponAmmo[weaponType] =
            weaponType === "bomb" ? 3 : config.ammo;
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

    if (this.weaponVisual) {
        this.weaponVisual.destroy();
        this.weaponVisual = null;
    }

    if (!weapon) return;

    this.weaponVisual = WeaponVisualFactory.create(
        this.scene,
        weapon,
        0,
        0,
        0.85
    );

    this.weaponSprite.add(this.weaponVisual);
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

    // bomb/grenade tidak bisa reload
    if (weapon === "bomb") {
        return;
    }

    const config = this.scene.bulletSystem.getWeaponConfig(weapon);

    if (this.weaponAmmo[weapon] >= config.ammo) {
        return;
    }

    this.isReloading = true;

    this.scene.uiSystem.startReloadAnimation(config.reload);

    this.scene.time.delayedCall(config.reload, () => {
        this.weaponAmmo[weapon] = config.ammo;

        this.isReloading = false;

        this.scene.uiSystem.stopReloadAnimation();
        this.scene.uiSystem.updateAmmo(this);
    });
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