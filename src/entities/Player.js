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

        this.canShoot = true;

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
    const maxSlots = 5;

    const config =
        this.scene.bulletSystem.getWeaponConfig(
            weaponType
        );

    // kalau senjata yang sama sudah ada, cukup pindah ke slot itu
    if (this.inventory.includes(weaponType)) {
        this.currentWeaponIndex =
            this.inventory.indexOf(weaponType);

        this.updateWeaponVisual();
        return;
    }

    // kalau slot masih kosong, tambah senjata baru
    if (this.inventory.length < maxSlots) {
        this.inventory.push(weaponType);

        this.currentWeaponIndex =
            this.inventory.length - 1;

        this.weaponAmmo[weaponType] =
            weaponType === "bomb"
                ? 3
                : config.ammo;

        this.updateWeaponVisual();
        return;
    }

    // kalau inventory penuh, ganti senjata di slot aktif
    const oldWeapon =
        this.inventory[this.currentWeaponIndex];

    delete this.weaponAmmo[oldWeapon];

    this.inventory[this.currentWeaponIndex] =
        weaponType;

    this.weaponAmmo[weaponType] =
        weaponType === "bomb"
            ? 3
            : config.ammo;

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
            },

            desert: {
                bodyColor: 0xd2b48c,
                helmetColor: 0x8b6f47,
                strokeColor: 0xb8945f
            },

            urban: {
                bodyColor: 0x888888,
                helmetColor: 0x333333,
                strokeColor: 0x555555
            },

            toxic: {
                bodyColor: 0x00ff66,
                helmetColor: 0x006633,
                strokeColor: 0x00aa44
            },

            cyber: {
                bodyColor: 0xaa00ff,
                helmetColor: 0x440066,
                strokeColor: 0x7700aa
            },

            inferno: {
                bodyColor: 0xff6600,
                helmetColor: 0x992200,
                strokeColor: 0xcc4400
            },

            phantom: {
                bodyColor: 0x111111,
                helmetColor: 0x555555,
                strokeColor: 0x777777
            }
        };

        const skin = skins[this.selectedCharacter] || skins.default;

        this.body.fillColor = skin.bodyColor;
        this.body.setStrokeStyle(3, skin.strokeColor);

        this.helmet.fillColor = skin.helmetColor;
    }

    startShootCooldown(duration) {
    this.canShoot = false;

    this.scene.time.delayedCall(duration, () => {
        this.canShoot = true;
    });
}
}