export default class UISystem {
    constructor(scene) {
        this.scene = scene;

        const w = scene.scale.width;
        const h = scene.scale.height;

        // Font family global untuk memberikan kesan militer/taktis modern
        const fontMain = "Arial, Helvetica, sans-serif";
        const fontMono = "Courier New, monospace";

        // ==========================================
        // 1. STATUS PANEL (ALIVE & KILLS) -> PINDAH KE POJOK KIRI ATAS
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
        // 2. ZONE SYSTEM TIMERS (TOP CENTER)
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
        // 3. KILL FEED NOTIFICATION (MIDDLE TOP)
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
        // 4. WEAPON DETAILED PANEL (BOTTOM RIGHT)
        // ==========================================
        const wpX = w - 200;
        const wpY = h - 55;

        // Ukuran panel sedikit diperlebar (210 -> 240) agar ruang teks nama senjata & peluru lebih lega
        this.weaponPanel = scene.add.rectangle(wpX, wpY, 240, 60, 0x0f141c, 0.75);
        this.weaponPanel.setStrokeStyle(1, 0xffffff, 0.1);

        // Garis aksen vertikal disesuaikan dengan lebar panel baru (+103 -> +118)
        this.wpAccent = scene.add.rectangle(wpX + 118, wpY, 4, 60, 0xf3a922, 0.8);

        // Nama Senjata digeser ke sisi kiri dalam panel (Origin diubah ke kiri '0')
        this.weaponText = scene.add.text(wpX - 105, wpY, "WEAPON\nNONE", {
            fontSize: "13px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMain,
            align: "left"
        }).setOrigin(0, 0.5);

        // AMMO TEXT: Diletakkan di sisi kanan dalam panel, presisi di tengah vertikal
        this.ammoText = scene.add.text(wpX + 95, wpY, "0 / 0", {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black",
            align: "right"
        }).setOrigin(1, 0.5); // Origin kanan '1' agar saat angka berubah, teks rapi memanjang ke kiri

        // RELOAD TEXT: Diletakkan tepat di atas panel senjata dengan warna merah berkedip/tegas
        this.reloadText = scene.add.text(wpX, wpY - 45, "RELOADING...", {
            fontSize: "16px",
            color: "#ff4444",
            fontStyle: "bold",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        this.reloadText.setVisible(false);


        // ==========================================
        // 5. IMPROVED WEAPON SLOTS MATRIX (BOTTOM CENTER)
        // ==========================================
        this.weaponSlots = [];
        const slotCount = 5;
        const slotSize = 52; 
        const gap = 8;
        const totalWidth = slotCount * slotSize + (slotCount - 1) * gap;
        const startX = w / 2 - totalWidth / 2 + slotSize / 2;
        const slotY = h - 95; 

        for (let i = 0; i < slotCount; i++) {
            const box = scene.add.rectangle(startX + i * (slotSize + gap), slotY, slotSize, slotSize, 0x141a22, 0.85);
            box.setStrokeStyle(1, 0xffffff, 0.15);

            const label = scene.add.text(startX + i * (slotSize + gap), slotY, (i + 1) + "\n-", {
                fontSize: "12px",
                color: "#8a96a0",
                align: "center",
                fontStyle: "bold",
                fontFamily: fontMono
            }).setOrigin(0.5);

            this.weaponSlots.push({ box, label });
        }


        // ==========================================
        // 6. HEALTH BAR SYSTEM (BOTTOM CENTER HUD)
        // ==========================================
        this.hpMaxWidth = 360;
        const hpY = h - 35;

        this.hpBarBg = scene.add.rectangle(w / 2, hpY, this.hpMaxWidth, 14, 0x141a22, 0.6);
        this.hpBarBg.setStrokeStyle(1, 0xffffff, 0.2);

        this.hpBar = scene.add.rectangle(w / 2 - this.hpMaxWidth / 2, hpY, this.hpMaxWidth, 14, 0xffffff, 0.95);
        this.hpBar.setOrigin(0, 0.5);

        this.hpText = scene.add.text(w / 2 - this.hpMaxWidth / 2, hpY - 20, "HP 100", {
            fontSize: "12px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: fontMono
        }).setOrigin(0, 0.5);


        // ==========================================
        // 7. ARRANGE SCROLL FACTORS & DEPTH OVERRIDE
        // ==========================================
        const fixedElements = [
            this.statusBg, this.aliveText, this.aliveLabel, this.statusDivider,
            this.killText, this.killLabel, this.zoneBg, this.zoneText,
            this.topKillBg, this.topKillText, this.weaponPanel, this.wpAccent, this.weaponText,
            this.hpBarBg, this.hpBar, this.hpText,
            this.ammoText,
            this.reloadText
        ];

        for (let i = 0; i < this.weaponSlots.length; i++) {
            fixedElements.push(this.weaponSlots[i].box);
            fixedElements.push(this.weaponSlots[i].label);
        }

        for (let i = 0; i < fixedElements.length; i++) {
            fixedElements[i].setScrollFactor(0);
            fixedElements[i].setDepth(4000); 
        }
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
        this.weaponText.setText(hasWeapon ? "WEAPON\nREADY" : "WEAPON\nNONE");
    }

    updateWeaponBar(player) {
        const shortName = {
            pistol: "PST", uzi: "UZI", smg: "SMG", ak: "AK",
            m4: "M4", scar: "SCR", sniper: "AWM", shotgun: "SGN",
            rpg: "RPG", bomb: "GRD"
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
            currentWeapon ? "EQUIPPED\n" + currentWeapon.toUpperCase() : "WEAPON\nNONE"
        );
    }

    updateAmmo(player) {
        const weapon = player.getCurrentWeapon();

        if (!weapon) {
            this.ammoText.setText("--");
            return;
        }

        const config = this.scene.bulletSystem.getWeaponConfig(weapon);
        this.ammoText.setText(
            player.getCurrentAmmo() + " / " + config.ammo
        );
    }

    showReloadText() {
        this.reloadText.setVisible(true);
    }

    hideReloadText() {
        this.reloadText.setVisible(false);
    }

    showKillFeed(text) {
        this.topKillText.setText(text.toUpperCase());
        this.topKillBg.setVisible(true);

        this.scene.time.delayedCall(3000, () => {
            this.topKillText.setText("");
            this.topKillBg.setVisible(false);
        });
    }
}