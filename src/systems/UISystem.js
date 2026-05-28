export default class UISystem {
    constructor(scene) {
        this.scene = scene;

        const w = scene.scale.width;
        const h = scene.scale.height;

        const fontMain = "Arial, Helvetica, sans-serif";
        const fontMono = "Courier New, monospace";

        // ==========================================
        // STATUS PANEL
        // ==========================================
        const statusX = 95;
        const statusY = 45;

        this.statusBg = scene.add.rectangle(statusX, statusY, 150, 42, 0x0f141c, 0.75);
        this.statusBg.setStrokeStyle(1, 0xffffff, 0.15);

        this.aliveLabel = scene.add.text(statusX - 45, statusY, "ALIVE", {
            fontSize: "11px",
            color: "#8a96a0",
            fontStyle: "bold",
            fontFamily: fontMain
        }).setOrigin(0.5);

        this.aliveText = scene.add.text(statusX - 15, statusY, "0", {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMain
        }).setOrigin(0.5);

        this.statusDivider = scene.add.rectangle(statusX + 10, statusY, 1, 20, 0xffffff, 0.2);

        this.killLabel = scene.add.text(statusX + 35, statusY, "KILL", {
            fontSize: "11px",
            color: "#8a96a0",
            fontStyle: "bold",
            fontFamily: fontMain
        }).setOrigin(0.5);

        this.killText = scene.add.text(statusX + 60, statusY, "0", {
            fontSize: "20px",
            color: "#f3a922",
            fontStyle: "bold",
            fontFamily: fontMain
        }).setOrigin(0.5);

        // ==========================================
        // ZONE TIMER
        // ==========================================
        this.zoneBg = scene.add.rectangle(w / 2, 100, 200, 32, 0x0f141c, 0.8);
        this.zoneBg.setStrokeStyle(1, 0xd93838, 0.4);

        this.zoneText = scene.add.text(w / 2, 100, "ZONE 1 - 60s", {
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMono
        }).setOrigin(0.5);

        // ==========================================
        // KILL FEED
        // ==========================================
        this.topKillBg = scene.add.rectangle(w / 2, 200, 450, 30, 0x05080c, 0.85);
        this.topKillBg.setStrokeStyle(1, 0xf3a922, 0.3);

        this.topKillText = scene.add.text(w / 2, 200, "", {
            fontSize: "13px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMain
        }).setOrigin(0.5);

        this.topKillBg.setVisible(false);

        // ==========================================
        // WEAPON PANEL
        // ==========================================
        const wpX = w - 200;
        const wpY = h - 55;

        this.weaponPanel = scene.add.rectangle(wpX, wpY, 240, 60, 0x0f141c, 0.75);
        this.weaponPanel.setStrokeStyle(1, 0xffffff, 0.1);

        this.wpAccent = scene.add.rectangle(wpX + 118, wpY, 4, 60, 0xf3a922, 0.8);

        this.weaponText = scene.add.text(wpX - 105, wpY, "WEAPON\nNONE", {
            fontSize: "13px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMain,
            align: "left"
        }).setOrigin(0, 0.5);

        this.ammoText = scene.add.text(wpX + 95, wpY, "--", {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black",
            align: "right"
        }).setOrigin(1, 0.5);

        // ==========================================
        // RELOAD ANIMATION CENTER
        // ==========================================
        this.reloadCircleBg = scene.add.circle(
            w / 2,
            h / 2,
            44,
            0x000000,
            0.45
        );

        this.reloadCircle = scene.add.graphics();

        this.reloadCountdownText = scene.add.text(
            w / 2,
            h / 2,
            "",
            {
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }
        ).setOrigin(0.5);

        this.reloadBox = scene.add.rectangle(
            w / 2,
            h / 2 + 82,
            190,
            46,
            0x111111,
            0.85
        );

        this.reloadLabel = scene.add.text(
            w / 2,
            h / 2 + 82,
            "Reloading",
            {
                fontSize: "26px",
                color: "#ffffff",
                fontFamily: fontMain
            }
        ).setOrigin(0.5);

        this.reloadCircleBg.setVisible(false);
        this.reloadCountdownText.setVisible(false);
        this.reloadBox.setVisible(false);
        this.reloadLabel.setVisible(false);

        this.reloadDuration = 0;
        this.reloadStartTime = 0;
        this.isReloadUIActive = false;

        // ==========================================
        // WEAPON SLOTS
        // ==========================================
        this.weaponSlots = [];

        const slotCount = 5;
        const slotSize = 52;
        const gap = 8;
        const totalWidth = slotCount * slotSize + (slotCount - 1) * gap;
        const startX = w / 2 - totalWidth / 2 + slotSize / 2;
        const slotY = h - 95;

        for (let i = 0; i < slotCount; i++) {
            const box = scene.add.rectangle(
                startX + i * (slotSize + gap),
                slotY,
                slotSize,
                slotSize,
                0x141a22,
                0.85
            );

            box.setStrokeStyle(1, 0xffffff, 0.15);

            const label = scene.add.text(
                startX + i * (slotSize + gap),
                slotY,
                (i + 1) + "\n-",
                {
                    fontSize: "12px",
                    color: "#8a96a0",
                    align: "center",
                    fontStyle: "bold",
                    fontFamily: fontMono
                }
            ).setOrigin(0.5);

            this.weaponSlots.push({ box, label });
        }

        // ==========================================
        // HP BAR
        // ==========================================
        this.hpMaxWidth = 360;
        const hpY = h - 35;

        this.hpBarBg = scene.add.rectangle(w / 2, hpY, this.hpMaxWidth, 14, 0x141a22, 0.6);
        this.hpBarBg.setStrokeStyle(1, 0xffffff, 0.2);

        this.hpBar = scene.add.rectangle(
            w / 2 - this.hpMaxWidth / 2,
            hpY,
            this.hpMaxWidth,
            14,
            0xffffff,
            0.95
        );

        this.hpBar.setOrigin(0, 0.5);

        this.hpText = scene.add.text(
            w / 2 - this.hpMaxWidth / 2,
            hpY - 20,
            "HP 100",
            {
                fontSize: "12px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: fontMono
            }
        ).setOrigin(0, 0.5);

        // =========================
// ARMOR ICONS
// =========================
this.helmetIcon = scene.add.text(
    w / 2 + this.hpMaxWidth / 2 + 28,
    hpY,
    "⛑",
    {
        fontSize: "30px",
        color: "#555555",
        fontStyle: "bold"
    }
).setOrigin(0.5);

this.vestIcon = scene.add.text(
    w / 2 + this.hpMaxWidth / 2 + 68,
    hpY,
    "🛡",
    {
        fontSize: "30px",
        color: "#555555",
        fontStyle: "bold"
    }
).setOrigin(0.5);

this.pickupText = scene.add.text(
    w / 2,
    h - 500,
    "PRESS F TO PICKUP",
    {
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold"
    }
).setOrigin(0.5);

this.pickupText.setVisible(false);

        // ==========================================
        // FIXED UI
        // ==========================================
        const fixedElements = [
            this.statusBg,
            this.aliveText,
            this.aliveLabel,
            this.statusDivider,
            this.killText,
            this.killLabel,
            this.helmetIcon,
            this.vestIcon,
            this.pickupText,

            this.zoneBg,
            this.zoneText,

            this.topKillBg,
            this.topKillText,

            this.weaponPanel,
            this.wpAccent,
            this.weaponText,
            this.ammoText,

            this.reloadCircleBg,
            this.reloadCountdownText,
            this.reloadBox,
            this.reloadLabel,

            this.hpBarBg,
            this.hpBar,
            this.hpText
        ];

        for (let i = 0; i < this.weaponSlots.length; i++) {
            fixedElements.push(this.weaponSlots[i].box);
            fixedElements.push(this.weaponSlots[i].label);
        }

        for (let i = 0; i < fixedElements.length; i++) {
            fixedElements[i].setScrollFactor(0);
            fixedElements[i].setDepth(4000);
        }

        this.reloadCircle.setScrollFactor(0);
        this.reloadCircle.setDepth(4001);
    }

    updateAlive(alive) {
        this.aliveText.setText(alive);
    }

    updateScore(score) {}

    updateKills(kills) {
        this.killText.setText(kills);
    }

    updateZone(text) {
        this.zoneText.setText(text.toUpperCase());
    }

    updateHP(hp) {
        if (hp < 0) hp = 0;
        if (hp > 100) hp = 100;

        this.hpText.setText("HP " + hp);
        this.hpBar.width = (hp / 100) * this.hpMaxWidth;

        if (hp > 30) {
            this.hpBar.fillColor = 0xffffff;
        } else {
            this.hpBar.fillColor = 0xd93838;
        }
    }

    updateWeapon(hasWeapon) {
        this.weaponText.setText(
            hasWeapon ? "WEAPON\nREADY" : "WEAPON\nNONE"
        );
    }

    updateWeaponBar(player) {
        const shortName = {
            pistol: "PST",
            uzi: "UZI",
            smg: "SMG",
            ak: "AK",
            m4: "M4",
            scar: "SCR",
            sniper: "AWM",
            rpg: "RPG",
            bomb: "GRD"
        };

        for (let i = 0; i < this.weaponSlots.length; i++) {
            const slot = this.weaponSlots[i];
            const weapon = player.inventory[i];

            if (weapon) {
                slot.label.setText((i + 1) + "\n" + shortName[weapon]);
            } else {
                slot.label.setText((i + 1) + "\n-");
            }

            if (i === player.currentWeaponIndex && weapon) {
                slot.box.fillColor = 0xf3a922;
                slot.box.setStrokeStyle(1.5, 0xffffff, 1);
                slot.label.setColor("#000000");
            } else {
                slot.box.fillColor = 0x141a22;
                slot.box.setStrokeStyle(1, 0xffffff, 0.15);
                slot.label.setColor("#8a96a0");
            }
        }

        const currentWeapon = player.getCurrentWeapon();

        this.weaponText.setText(
            currentWeapon
                ? "EQUIPPED\n" + currentWeapon.toUpperCase()
                : "WEAPON\nNONE"
        );
    }

    updateAmmo(player) {
        const weapon = player.getCurrentWeapon();

        if (!weapon) {
            this.ammoText.setText("--");
            return;
        }

        const maxAmmo =
    weapon === "bomb"
        ? 3
        : this.scene.bulletSystem
            .getWeaponConfig(weapon).ammo;

this.ammoText.setText(
    player.getCurrentAmmo() + " / " + maxAmmo
);
    }

    startReloadAnimation(duration) {
        this.reloadDuration = duration;
        this.reloadStartTime = this.scene.time.now;
        this.isReloadUIActive = true;

        this.reloadCircleBg.setVisible(true);
        this.reloadCountdownText.setVisible(true);
        this.reloadBox.setVisible(true);
        this.reloadLabel.setVisible(true);
    }

    stopReloadAnimation() {
        this.isReloadUIActive = false;

        this.reloadCircle.clear();

        this.reloadCircleBg.setVisible(false);
        this.reloadCountdownText.setVisible(false);
        this.reloadBox.setVisible(false);
        this.reloadLabel.setVisible(false);
    }

    updateReloadAnimation() {
        if (!this.isReloadUIActive) return;

        const elapsed = this.scene.time.now - this.reloadStartTime;

        const progress = Phaser.Math.Clamp(
            elapsed / this.reloadDuration,
            0,
            1
        );

        const remaining = Math.max(
            0,
            ((this.reloadDuration - elapsed) / 1000).toFixed(1)
        );

        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        this.reloadCountdownText.setText(remaining);

        this.reloadCircle.clear();

        this.reloadCircle.lineStyle(6, 0xffffff, 1);

        this.reloadCircle.beginPath();

        this.reloadCircle.arc(
            w / 2,
            h / 2,
            44,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * progress,
            false
        );

        this.reloadCircle.strokePath();
    }

    showReloadText() {
        this.startReloadAnimation(1000);
    }

    hideReloadText() {
        this.stopReloadAnimation();
    }

    showKillFeed(text) {
        this.topKillText.setText(text.toUpperCase());
        this.topKillBg.setVisible(true);

        this.scene.time.delayedCall(3000, () => {
            this.topKillText.setText("");
            this.topKillBg.setVisible(false);
        });
    }

    updateArmorIcons(player) {
    if (player.hasHelmet) {
        this.helmetIcon.setColor("#ffffff");
    } else {
        this.helmetIcon.setColor("#555555");
    }

    if (player.hasVest) {
        this.vestIcon.setColor("#ffffff");
    } else {
        this.vestIcon.setColor("#555555");
    }
}

showPickupText(show) {
    this.pickupText.setVisible(show);
}
}