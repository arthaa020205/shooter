export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        this.load.audio("menuMusic", "assets/music/menu.mp3");
        this.load.audio("hoverSound", "assets/sounds/hover.mp3");
        this.load.audio("clickSound", "assets/sounds/click.mp3");
    }

    playHoverSound() {

        this.sound.play("hoverSound", {
            volume: 0.35
        });

    }

    playClickSound() {
        this.sound.play("clickSound", {
            volume: 0.45
        });
    }

    create() {
        const soundOn =
            localStorage.getItem("br_music_on") !== "false";

        if (soundOn) {

            let music = this.sound.get("menuMusic");

            if (!music) {

                music = this.sound.add("menuMusic", {
                    loop: true,
                    volume: 0.4
                });

            }

            if (!music.isPlaying) {
                music.play();
            }
        }
        const w = this.scale.width;
        const h = this.scale.height;

        this.add.rectangle(w / 2, h / 2, w, h, 0x12161a);

        const bgGradient = this.add.graphics();

        bgGradient.fillGradientStyle(
            0x1a2229,
            0x1a2229,
            0x0a0d10,
            0x0a0d10,
            1
        );

        bgGradient.fillRect(0, 0, w, h);

        const hud = this.add.graphics();

        hud.lineStyle(1, 0xffffff, 0.03);

        for (let x = 0; x < w; x += 80) {
            hud.moveTo(x, 0);
            hud.lineTo(x, h);
        }

        for (let y = 0; y < h; y += 80) {
            hud.moveTo(0, y);
            hud.lineTo(w, y);
        }

        hud.strokePath();

        hud.lineStyle(2, 0xf3a922, 0.5);
        hud.strokeRect(20, 20, w - 40, h - 40);

        this.createHUDAccents(hud, w, h);

        for (let i = 0; i < 35; i++) {
            const dust = this.add.circle(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(0, h),
                Phaser.Math.Between(1, 3),
                0xf3a922,
                Phaser.Math.FloatBetween(0.05, 0.18)
            );

            this.tweens.add({
                targets: dust,
                x: dust.x + Phaser.Math.Between(-40, 40),
                y: dust.y + Phaser.Math.Between(-20, 20),
                alpha: 0,
                duration: Phaser.Math.Between(2500, 5000),
                yoyo: true,
                repeat: -1
            });
        }

        this.add.text(
            65,
            73,
            "DEADLY STRAY",
            {
                fontSize: "64px",
                color: "#f3a922",
                fontStyle: "bold",
                fontFamily: "Arial Black, Impact, sans-serif"
            }
        ).setAlpha(0.2).setOrigin(0);

        this.add.text(
            60,
            70,
            "DEADLY STRAY",
            {
                fontSize: "64px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black, Impact, sans-serif"
            }
        ).setOrigin(0);

        this.add.text(
            65,
            140,
            "// TOP-DOWN SURVIVAL OPERATIVE",
            {
                fontSize: "16px",
                color: "#f3a922",
                fontStyle: "bold",
                fontFamily: "Courier New, monospace"
            }
        ).setOrigin(0);

        this.createCoinPanel(w);
        this.createCharacterDisplay(w, h);
        this.createShopButton(w, h);
        this.createGuideButton(w, h);
        this.createSettingsButton(w, h);
        this.createModePanel(w, h);
        this.createFooter(h);
    }

    createCoinPanel(w) {
        const coins = this.getCoins();

        const coinBox = this.add.rectangle(
            w - 150,
            65,
            220,
            52,
            0x090d10,
            0.88
        );

        coinBox.setStrokeStyle(2, 0xf3a922, 0.8);

        this.add.text(
            w - 150,
            65,
            "COIN: " + coins,
            {
                fontSize: "24px",
                color: "#ffd700",
                fontStyle: "bold",
                fontFamily: "Arial, sans-serif"
            }
        ).setOrigin(0.5);
    }

    createCharacterDisplay(w, h) {
        const selected = this.getSelectedCharacter();
        const skin = this.getCharacterSkin(selected);

        const x = w / 2 - 170;
        const y = h / 2 + 15;

        const glow = this.add.circle(
            x,
            y,
            115,
            skin.accent,
            0.08
        );

        const shadow = this.add.ellipse(
            x,
            y + 95,
            150,
            35,
            0x000000,
            0.35
        );

        const body = this.add.circle(
            x,
            y,
            55,
            skin.bodyColor
        );

        body.setStrokeStyle(5, skin.strokeColor);

        const helmet = this.add.arc(
            x,
            y - 15,
            58,
            180,
            360,
            false,
            skin.helmetColor
        );

        helmet.setStrokeStyle(4, 0x111111);

        this.add.rectangle(
            x,
            y - 30,
            70,
            16,
            0x111111
        );

        const gun = this.add.rectangle(
            x + 70,
            y + 6,
            95,
            14,
            0xf3a922
        );

        gun.setStrokeStyle(2, 0x111111);

        const barrel = this.add.rectangle(
            x + 130,
            y + 6,
            45,
            7,
            0x111111
        );

        const handle = this.add.rectangle(
            x + 55,
            y + 25,
            12,
            32,
            0x333333
        );

        this.tweens.add({
            targets: [
                glow,
                shadow,
                body,
                helmet,
                gun,
                barrel,
                handle
            ],
            y: "+=8",
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
        });

        this.add.text(
            x,
            y + 145,
            skin.name,
            {
                fontSize: "18px",
                color: "#f3a922",
                fontFamily: "Courier New, monospace",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);
    }

    createCharacterShop(w, h) {

        const panelX = 350;
        const panelY = h - 205;

        // =========================
        // PANEL
        // =========================
        const panel = this.add.rectangle(
            panelX,
            panelY,
            620,
            190,
            0x090d10,
            0.88
        );

        panel.setStrokeStyle(2, 0xf3a922, 0.8);

        // TITLE
        this.add.text(
            panelX - 285,
            panelY - 78,
            "CHARACTER SHOP",
            {
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }
        );

        const characters = [
            {
                id: "default",
                name: "DEFAULT",
                price: 0,
                color: 0xffffff,
                helmet: 0x2f6b2f
            },
            {
                id: "red",
                name: "RED",
                price: 10,
                color: 0xff4444,
                helmet: 0x992222
            },
            {
                id: "blue",
                name: "BLUE",
                price: 20,
                color: 0x4488ff,
                helmet: 0x003399
            },
            {
                id: "gold",
                name: "GOLD",
                price: 35,
                color: 0xffcc00,
                helmet: 0xaa7700
            }
        ];

        const unlocked = this.getUnlockedCharacters();
        const selected = this.getSelectedCharacter();

        // =========================
        // CHARACTER CARDS
        // =========================
        for (let i = 0; i < characters.length; i++) {

            const char = characters[i];

            const x = panelX - 210 + (i * 140);
            const y = panelY + 8;

            const isUnlocked =
                unlocked.includes(char.id);

            const isSelected =
                selected === char.id;

            // CARD BG
            const card = this.add.rectangle(
                x,
                y,
                118,
                132,
                isSelected
                    ? 0x234423
                    : 0x1a2229,
                1
            );

            card.setInteractive({
                useHandCursor: true
            });

            card.setStrokeStyle(
                isSelected ? 3 : 2,
                isSelected
                    ? 0x77ff77
                    : 0x666666
            );

            // SHADOW
            this.add.ellipse(
                x,
                y + 28,
                46,
                12,
                0x000000,
                0.25
            );

            // BODY
            this.add.circle(
                x,
                y - 20,
                24,
                char.color
            ).setStrokeStyle(3, char.helmet);

            // VISOR
            this.add.rectangle(
                x,
                y - 28,
                30,
                8,
                0x111111
            );

            // NAME
            this.add.text(
                x,
                y + 18,
                char.name,
                {
                    fontSize: "14px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    fontFamily: "Arial"
                }
            ).setOrigin(0.5);

            // =========================
            // BUTTON STATE
            // =========================
            let buttonLabel = "";
            let buttonColor = 0xf3a922;
            let textColor = "#000000";

            if (isSelected) {
                buttonLabel = "USED";
                buttonColor = 0x2f6b2f;
                textColor = "#ffffff";
            }
            else if (isUnlocked) {
                buttonLabel = "USE";
            }
            else {
                buttonLabel = char.price + " COIN";
            }

            // BUTTON
            const button = this.add.rectangle(
                x,
                y + 52,
                82,
                28,
                buttonColor,
                1
            );

            button.setStrokeStyle(1, 0xffffff);

            // BUTTON TEXT
            this.add.text(
                x,
                y + 52,
                buttonLabel,
                {
                    fontSize: "12px",
                    color: textColor,
                    fontStyle: "bold",
                    fontFamily: "Arial"
                }
            ).setOrigin(0.5);

            // =========================
            // HOVER EFFECT
            // =========================
            card.on("pointerover", () => {

                this.tweens.add({
                    targets: card,
                    scaleX: 1.04,
                    scaleY: 1.04,
                    duration: 120
                });
                this.playHoverSound();

            });

            card.on("pointerout", () => {

                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 120
                });
                this.playHoverSound();

            });

            // =========================
            // CLICK
            // =========================
            card.on("pointerdown", () => {

                this.handleCharacterClick(char);

            });

        }

    }

    createModePanel(w, h) {
        const panelX = w - 280;
        const panelY = h / 2 + 40;

        const panel = this.add.rectangle(
            panelX,
            panelY,
            380,
            420,
            0x090d10,
            0.75
        ).setOrigin(0.5);

        panel.setStrokeStyle(1, 0xffffff, 0.1);

        this.add.text(
            panelX - 160,
            panelY - 170,
            "SELECT OPERATION LEVEL",
            {
                fontSize: "14px",
                color: "#8a96a0",
                fontStyle: "bold",
                fontFamily: "Arial, sans-serif"
            }
        ).setOrigin(0);

        this.createPUBGButton(
            10,
            panelX,
            panelY - 90,
            "EASY MODE",
            "DESERT SKIRMISH",
            0xf3a922
        );

        this.createPUBGButton(
            15,
            panelX,
            panelY,
            "NORMAL MODE",
            "URBAN ASSAULT",
            0xf3a922
        );

        this.createPUBGButton(
            20,
            panelX,
            panelY + 90,
            "HARDCORE MODE",
            "MILITARY ISLAND",
            0xd93838
        );
    }

    createFooter(h) {
        this.add.rectangle(
            60,
            h - 55,
            450,
            30,
            0x000000,
            0.4
        ).setOrigin(0, 0.5);

        this.add.text(
            75,
            h - 55,
            "SYSTEM: READY  |  [W][A][S][D] MOVE  |  [LMB] FIRE  |  [1-5] WEAPONS",
            {
                fontSize: "12px",
                color: "#8a96a0",
                fontFamily: "Courier New, monospace",
                fontStyle: "bold"
            }
        ).setOrigin(0, 0.5);
    }

    createHUDAccents(graphics, w, h) {
        const size = 15;

        graphics.lineStyle(2, 0xffffff, 0.3);

        graphics.moveTo(30, 30 + size);
        graphics.lineTo(30, 30);
        graphics.lineTo(30 + size, 30);

        graphics.moveTo(w - 30, 30 + size);
        graphics.lineTo(w - 30, 30);
        graphics.lineTo(w - 30 - size, 30);

        graphics.moveTo(30, h - 30 - size);
        graphics.lineTo(30, h - 30);
        graphics.lineTo(30 + size, h - 30);

        graphics.moveTo(w - 30, h - 30 - size);
        graphics.lineTo(w - 30, h - 30);
        graphics.lineTo(w - 30 - size, h - 30);

        graphics.strokePath();
    }

    createPUBGButton(enemyCount, x, y, titleLabel, subLabel, accentColor) {
        const btnWidth = 340;
        const btnHeight = 65;

        const btnContainer = this.add.container(x, y);

        const bg = this.add.rectangle(
            0,
            0,
            btnWidth,
            btnHeight,
            0x182026,
            0.9
        );

        bg.setStrokeStyle(1, 0xffffff, 0.15);
        bg.setInteractive({ useHandCursor: true });

        const accentBar = this.add.rectangle(
            -btnWidth / 2 + 4,
            0,
            6,
            btnHeight - 12,
            accentColor,
            0.8
        );

        const mainText = this.add.text(
            -btnWidth / 2 + 25,
            -14,
            titleLabel,
            {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial, sans-serif"
            }
        );

        const detailText = this.add.text(
            -btnWidth / 2 + 25,
            8,
            `${subLabel} // ${enemyCount} ENEMIES`,
            {
                fontSize: "11px",
                color: "#8a96a0",
                fontFamily: "Courier New, monospace",
                fontStyle: "bold"
            }
        );

        btnContainer.add([
            bg,
            accentBar,
            mainText,
            detailText
        ]);

        bg.on("pointerover", () => {
            bg.fillColor = accentColor;
            bg.setStrokeStyle(1, 0xffffff, 0.5);

            mainText.setColor("#000000");
            detailText.setColor("#1a2229");

            this.tweens.add({
                targets: btnContainer,
                x: x + 8,
                duration: 100,
                ease: "Power1"
            });
            // this.playHoverSound();
            this.playClickSound();
        });

        bg.on("pointerout", () => {
            bg.fillColor = 0x182026;
            bg.setStrokeStyle(1, 0xffffff, 0.15);

            mainText.setColor("#ffffff");
            detailText.setColor("#8a96a0");

            this.tweens.add({
                targets: btnContainer,
                x: x,
                duration: 100,
                ease: "Power1"
            });
            // this.playHoverSound();
            this.playClickSound();
        });

        bg.on("pointerdown", () => {
            bg.fillColor = 0xffffff;

            this.cameras.main.once("camerafadeoutcomplete", () => {
                const music = this.sound.get("menuMusic");

                if (music && music.isPlaying) {
                    music.stop();
                }

                this.scene.start("GameScene", {
                    enemyCount: enemyCount
                });
                // this.playHoverSound();
                this.playClickSound();
            });

            // toggleBtn.on("pointerdown", () => {
            //     const current = localStorage.getItem("br_sound_on") !== "false";
            //     const newValue = !current;

            //     localStorage.setItem("br_sound_on", newValue ? "true" : "false");

            //     const music = this.sound.get("menuMusic");

            //     if (newValue) {
            //         if (music && !music.isPlaying) {
            //             music.play();
            //         }
            //     } else {
            //         if (music) {
            //             music.stop();
            //         }
            //     }

            //     updateSoundText();
            // });

            const music = this.sound.get("menuMusic");

            if (music && music.isPlaying) {
                music.stop();
            }

            this.scene.start("GameScene", {
                enemyCount: enemyCount
            });
        });
    }

    createShopButton(w, h) {
        const button = this.add.rectangle(
            170,
            230,
            230,
            52,
            0x182026,
            0.95
        ).setInteractive({ useHandCursor: true });

        button.setStrokeStyle(2, 0xf3a922);

        const text = this.add.text(
            170,
            230,
            "CHARACTER SHOP",
            {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        button.on("pointerover", () => {
            this.playHoverSound();
            button.fillColor = 0xf3a922;
            text.setColor("#000000");
        });

        button.on("pointerout", () => {
            this.playHoverSound();
            button.fillColor = 0x182026;
            text.setColor("#ffffff");
        });

        button.on("pointerdown", () => {
            this.playHoverSound();
            this.openCharacterShop();
        });
    }

    openCharacterShop() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Bersihkan container lama jika ada
        if (this.shopContainer) {
            this.shopContainer.destroy();
        }

        // 1. Container Utama (Gunakan koordinat pusat di tengah layar)
        this.shopContainer = this.add.container(w / 2, h / 2);
        this.shopContainer.setDepth(5000);

        // Overlay background (koordinat relatif ke tengah)
        const overlay = this.add.rectangle(0, 0, w, h, 0x000000, 0.75);

        // Panel Utama Toko dengan Sudut Membulat (Ukuran: 880 x 560)
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x090d10, 0.98);
        panelBg.lineStyle(3, 0xf3a922, 1);
        panelBg.fillRoundedRect(-440, -250, 880, 500, 16);
        panelBg.strokeRoundedRect(-440, -250, 880, 500, 16);

        // Judul Utama Shop
        const title = this.add.text(-410, -205, "CHARACTER SHOP", {
            fontSize: "30px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black"
        }).setOrigin(0, 0.5);
        title.setShadow(2, 2, "#000000", 4, true, true);

        // Tampilan Saldo Koin Player
        const coinText = this.add.text(250, -205, "💰 COIN: " + this.getCoins(), {
            fontSize: "20px",
            color: "#ffd700",
            fontStyle: "bold",
            fontFamily: "Arial Black"
        }).setOrigin(1, 0.5);
        coinText.setShadow(1, 1, "#000000", 2, true, true);

        this.shopContainer.add([overlay, panelBg, title, coinText]);

        const characters = [
            { id: "default", name: "DEFAULT", price: 0, color: 0xffffff, helmet: 0x2f6b2f },
            { id: "desert", name: "DESERT", price: 25, color: 0xd2b48c, helmet: 0x8b6f47 },
            { id: "urban", name: "URBAN", price: 50, color: 0x888888, helmet: 0x333333 },
            { id: "red", name: "RED", price: 100, color: 0xff4444, helmet: 0x992222 },
            { id: "blue", name: "BLUE", price: 150, color: 0x4488ff, helmet: 0x003399 },
            { id: "gold", name: "GOLD", price: 250, color: 0xffcc00, helmet: 0xaa7700 },
            { id: "toxic", name: "TOXIC", price: 400, color: 0x00ff66, helmet: 0x006633 },
            { id: "cyber", name: "CYBER", price: 600, color: 0xaa00ff, helmet: 0x440066 },
            { id: "inferno", name: "INFERNO", price: 900, color: 0xff6600, helmet: 0x992200 },
            { id: "phantom", name: "PHANTOM", price: 1500, color: 0x111111, helmet: 0x555555 }
        ];

        const unlocked = this.getUnlockedCharacters();
        const selected = this.getSelectedCharacter();

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];

            const col = i % 5;
            const row = Math.floor(i / 5);

            // Posisi dihitung relatif terhadap titik tengah container (0,0)
            const x = -310 + col * 155;
            const y = -45 + row * 165;

            const isUnlocked = unlocked.includes(char.id);
            const isSelected = selected === char.id;

            // --- GROUP CARD (Untuk mempermudah animasi hover) ---
            const cardGroup = this.add.container(x, y);

            // Background Card
            const cardColor = isSelected ? 0x1a331e : 0x141b22;
            const strokeColor = isSelected ? 0x4ade80 : 0x374151;
            const card = this.add.rectangle(0, 0, 140, 145, cardColor, 1)
                .setInteractive({ useHandCursor: true });
            card.setStrokeStyle(isSelected ? 3 : 1.5, strokeColor);

            // Avatar Karakter (Lingkaran)
            const icon = this.add.circle(0, -45, 32, char.color);
            icon.setStrokeStyle(4, char.helmet);

            // Visor Kacamata Karakter
            const visor = this.add.rectangle(0, -56, 42, 9, 0x111111);

            // Nama Karakter
            const name = this.add.text(0, 5, char.name, {
                fontSize: "15px",
                color: isSelected ? "#4ade80" : "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }).setOrigin(0.5);

            // Setup Label & Warna Tombol berdasarkan Status kepemilikan
            let label = "";
            let btnColor = 0xf3a922;
            let txtColor = "#000000";

            if (isSelected) {
                label = "SELECTED";
                btnColor = 0x22c55e;
                txtColor = "#ffffff";
            } else if (isUnlocked) {
                label = "EQUIP";
                btnColor = 0x3b82f6;
                txtColor = "#ffffff";
            } else {
                label = `🪙 ${char.price}`;
                btnColor = 0x1f2937;
                txtColor = "#ffd700";
            }

            // Tombol Aksi di dalam Kartu
            const btn = this.add.rectangle(0, 46, 115, 28, btnColor, 1);
            btn.setStrokeStyle(1, 0xffffff, 0.1);

            const btnText = this.add.text(0, 46, label, {
                fontSize: "13px",
                color: txtColor,
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }).setOrigin(0.5);

            // Gabungkan elemen spesifik kartu ke dalam cardGroup
            cardGroup.add([card, icon, visor, name, btn, btnText]);
            this.shopContainer.add(cardGroup);

            // --- LOGIKA INTERAKTIF (HOVER & CLICK EFFECT) ---
            card.on("pointerover", () => {
                card.setStrokeStyle(3, isSelected ? 0x4ade80 : 0xf3a922);
                // Animasi scale-up mikro saat disorot mouse
                this.tweens.add({
                    targets: cardGroup,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
                this.playHoverSound();
            });

            card.on("pointerout", () => {
                card.setStrokeStyle(isSelected ? 3 : 1.5, strokeColor);
                this.tweens.add({
                    targets: cardGroup,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
                this.playHoverSound();
            });

            card.on("pointerdown", () => {
                // Berikan feedback scale-down kecil saat ditekan klik
                this.tweens.add({
                    targets: cardGroup,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    yoyo: true,
                    onComplete: () => {
                        this.handleCharacterClick(char);
                    }
                });
                this.playHoverSound();
            });
        }

        // ==========================================
        // TOMBOL CLOSE MODERN (POJOK KANAN ATAS [✕])
        // ==========================================
        const closeBtnBg = this.add.rectangle(410, -205, 40, 40, 0x1c2431)
            .setInteractive({ useHandCursor: true });
        closeBtnBg.setStrokeStyle(1, 0xffffff, 0.15);

        const closeText = this.add.text(410, -205, "✕", {
            fontSize: "18px",
            color: "#a0aec0",
            fontStyle: "bold",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        // Animasi Hover Tombol Close
        closeBtnBg.on("pointerover", () => {
            closeBtnBg.setFillStyle(0xe53e3e); // Berubah merah sakral game kompetitif
            closeText.setColor("#ffffff");
        });
        closeBtnBg.on("pointerout", () => {
            closeBtnBg.setFillStyle(0x1c2431);
            closeText.setColor("#a0aec0");
        });
        closeBtnBg.on("pointerdown", () => {
            // Efek transisi keluar sebelum dihancurkan
            this.tweens.add({
                targets: this.shopContainer,
                scaleX: 0.7,
                scaleY: 0.7,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                    this.shopContainer.destroy();
                    this.shopContainer = null;
                }
            });
        });

        this.shopContainer.add([closeBtnBg, closeText]);

        // ==========================================
        // ANIMASI POP-IN (MEMBAL) SAAT TOKO DIBUKA
        // ==========================================
        this.shopContainer.alpha = 0;
        this.shopContainer.scaleX = 0.8;
        this.shopContainer.scaleY = 0.8;

        this.tweens.add({
            targets: this.shopContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 250,
            ease: 'Back.easeOut'
        });
    }

    handleCharacterClick(char) {
        const unlocked = this.getUnlockedCharacters();
        const selected = this.getSelectedCharacter();

        if (selected === char.id) {
            return;
        }

        if (unlocked.includes(char.id)) {
            localStorage.setItem("br_selected_character", char.id);
            this.scene.restart();
            return;
        }

        const coins = this.getCoins();

        if (coins >= char.price) {
            localStorage.setItem("br_coins", coins - char.price);

            unlocked.push(char.id);

            localStorage.setItem(
                "br_unlocked_characters",
                JSON.stringify(unlocked)
            );

            localStorage.setItem("br_selected_character", char.id);

            this.scene.restart();
        } else {
            this.showMessage("COIN TIDAK CUKUP");
        }
    }

    showMessage(text) {
        const w = this.scale.width;

        const bg = this.add.rectangle(
            w / 2,
            160,
            320,
            45,
            0x000000,
            0.85
        );

        bg.setStrokeStyle(2, 0xd93838);

        const message = this.add.text(
            w / 2,
            160,
            text,
            {
                fontSize: "20px",
                color: "#ff5555",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            bg.destroy();
            message.destroy();
        });
    }

    getCoins() {
        const coins = localStorage.getItem("br_coins");
        return coins ? parseInt(coins) : 0;
    }

    getUnlockedCharacters() {
        const data = localStorage.getItem("br_unlocked_characters");

        if (!data) {
            return ["default"];
        }

        return JSON.parse(data);
    }

    getSelectedCharacter() {
        return localStorage.getItem("br_selected_character") || "default";
    }

    getCharacterSkin(id) {
        const skins = {
            default: {
                name: "DEFAULT SOLDIER",
                bodyColor: 0xffffff,
                helmetColor: 0x2f6b2f,
                strokeColor: 0xcccccc,
                accent: 0xf3a922
            },
            red: {
                name: "RED RANGER",
                bodyColor: 0xff4444,
                helmetColor: 0x992222,
                strokeColor: 0xcc3333,
                accent: 0xff4444
            },
            blue: {
                name: "BLUE NINJA",
                bodyColor: 0x4488ff,
                helmetColor: 0x003399,
                strokeColor: 0x2255aa,
                accent: 0x4488ff
            },
            gold: {
                name: "GOLD KNIGHT",
                bodyColor: 0xffcc00,
                helmetColor: 0xaa7700,
                strokeColor: 0xffaa00,
                accent: 0xffcc00
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

        return skins[id] || skins.default;
    }

    createGuideButton(w, h) {
        const button = this.add.rectangle(
            170,
            295,
            230,
            52,
            0x182026,
            0.95
        ).setInteractive({ useHandCursor: true });

        button.setStrokeStyle(2, 0xf3a922);

        const text = this.add.text(
            170,
            295,
            "GAME GUIDE",
            {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        button.on("pointerover", () => {
            button.fillColor = 0xf3a922;
            text.setColor("#000000");
        });

        button.on("pointerout", () => {
            button.fillColor = 0x182026;
            text.setColor("#ffffff");
        });

        button.on("pointerdown", () => {
            this.openGuidePanel();
        });
    }

    openGuidePanel() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Container Utama (Koordinat pusat di tengah layar)
        const container = this.add.container(w / 2, h / 2);
        container.setDepth(9000);

        // 1. Overlay Background (Gelap & Transparan)
        const overlay = this.add.rectangle(0, 0, w, h, 0x000000, 0.75);

        // Panel Utama Elegan (Lebar: 880, Tinggi: 500)
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x0f141c, 0.98);
        panelBg.lineStyle(3, 0xf3a922, 1);
        panelBg.fillRoundedRect(-440, -250, 880, 500, 16);
        panelBg.strokeRoundedRect(-440, -250, 880, 500, 16);

        // Judul Utama Game Panduan
        const title = this.add.text(-410, -205, "PANDUAN GAME", {
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black"
        }).setOrigin(0, 0.5);
        title.setShadow(2, 2, "#000000", 4, true, true);

        // Box Kiri - Area Navigasi Tab (Lebar: 210, Tinggi: 360)
        const leftBox = this.add.graphics();
        leftBox.fillStyle(0x182026, 0.8);
        leftBox.lineStyle(1, 0xffffff, 0.1);
        leftBox.fillRoundedRect(-410, -150, 210, 360, 12);
        leftBox.strokeRoundedRect(-410, -150, 210, 360, 12);

        // Box Kanan - Area Konten Utama (Lebar: 580, Tinggi: 360)
        const contentBox = this.add.graphics();
        contentBox.fillStyle(0x101820, 0.85);
        contentBox.lineStyle(1, 0xffffff, 0.1);
        contentBox.fillRoundedRect(-170, -150, 580, 360, 12);
        contentBox.strokeRoundedRect(-170, -150, 580, 360, 12);

        // DATA KONTEN (Teks diringkas secara visual agar muat sempurna)
        const pages = [
            {
                name: "KONTROL",
                title: "⌨️ KONTROL PLAYER",
                text:
                    `• W A S D
  Bergerak mengendalikan Player.

• KLIK KIRI
  Menembak menggunakan senjata aktif.

• TOMBOL F
  Membuka peti inventory atau mengambil loot item.

• TOMBOL R
  Mengisi ulang (Reload) amunisi senjata.

• ANGKA 1 - 5
  Mengganti slot senjata yang digunakan.`
            },
            {
                name: "ALUR",
                title: "🎮 ALUR GAME",
                text:
                    `1. Jelajahi peta untuk mencari peti suplai.
2. Berdiri dekat peti dan tekan F untuk membukanya.
3. Ambil senjata kuat serta item pertahanan terbaik.
4. Cari musuh di sekitar area dan eliminasi mereka.
5. Perhatikan indikator peta, bergeraklah ke Zona Aman.
6. Bertahan hidup dan kalahkan musuh terakhir!`
            },
            {
                name: "ITEM",
                title: "🎒 DAFTAR ITEM",
                text:
                    `• MEDKIT
  Memulihkan HP Player secara instan saat terluka.

• HELMET
  Mengurangi fatalitas damage serangan di kepala.

• ROMPI / VEST
  Menyerap damage besar yang mengarah ke badan.

• BOM / GRANAT
  Senjata ledakan area (tidak memerlukan reload).`
            },
            {
                name: "TIPS",
                title: "💡 TIPS STRATEGI",
                text:
                    `• MANAJEMEN SLOT
  Jika slot penuh, mengambil senjata baru otomatis menukar senjata yang sedang aktif di tangan.

• SENJATA AWM
  Damage sangat mematikan, namun jeda tembakan lambat.

• SENJATA OTOMATIS (UZI / M4 / AK)
  Sangat efektif untuk pertempuran aktif jarak dekat.

• HEALING TIME
  Selalu gunakan Medkit saat bersembunyi di tempat aman.`
            }
        ];

        let currentPage = 0;
        const tabButtons = [];

        // Teks Judul Konten di dalam Box Kanan
        const contentTitle = this.add.text(-140, -115, "", {
            fontSize: "20px",
            color: "#f3a922",
            fontStyle: "bold",
            fontFamily: "Arial Black"
        }).setOrigin(0, 0.5);

        // UKURAN DISESUAIKAN: Dijamin aman dari kebocoran border bawah box
        const contentText = this.add.text(-140, -85, "", {
            fontSize: "15px",
            color: "#e2e8f0",
            fontFamily: "Segoe UI, Arial, sans-serif",
            lineSpacing: 5,
            align: "left",
            wordWrap: {
                width: 520,
                useAdvancedWrap: true
            }
        }).setOrigin(0, 0);

        // Fungsi Sinkronisasi Halaman & Tab Aktif
        const updatePage = () => {
            contentTitle.setText(pages[currentPage].title);
            contentText.setText(pages[currentPage].text);

            tabButtons.forEach((tab, i) => {
                if (i === currentPage) {
                    tab.bg.setFillStyle(0xf3a922, 1);
                    tab.text.setColor("#000000");
                    tab.indicator.setVisible(true);
                } else {
                    tab.bg.setFillStyle(0x0f141c, 0.6);
                    tab.text.setColor("#a0aec0");
                    tab.indicator.setVisible(false);
                }
            });
        };

        container.add([overlay, panelBg, title, leftBox, contentBox]);

        // Loop Pembuatan Tab Menu Kiri
        for (let i = 0; i < pages.length; i++) {
            const tabY = -115 + (i * 62);

            const tabBg = this.add.rectangle(-305, tabY, 180, 46, 0x0f141c, 1)
                .setInteractive({ useHandCursor: true });
            tabBg.setStrokeStyle(1, 0xffffff, 0.1);

            const activeIndicator = this.add.rectangle(-390, tabY, 5, 26, 0xffffff);

            const tabText = this.add.text(-305, tabY, pages[i].name, {
                fontSize: "14px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial"
            }).setOrigin(0.5);

            // Efek Interaktif Tab
            tabBg.on("pointerover", () => {
                if (currentPage !== i) tabBg.setFillStyle(0x242f3d, 1);
            });
            tabBg.on("pointerout", () => {
                if (currentPage !== i) tabBg.setFillStyle(0x0f141c, 0.6);
            });
            tabBg.on("pointerdown", () => {
                currentPage = i;
                updatePage();
            });

            tabButtons.push({ bg: tabBg, text: tabText, indicator: activeIndicator });
            container.add([tabBg, activeIndicator, tabText]);
        }

        // ==========================================
        // TOMBOL TUTUP MODERN (POJOK KANAN ATAS [X])
        // ==========================================
        const closeBtnBg = this.add.rectangle(395, -205, 44, 44, 0x1c2431)
            .setInteractive({ useHandCursor: true });
        closeBtnBg.setStrokeStyle(1, 0xffffff, 0.15);

        const closeText = this.add.text(395, -205, "✕", {
            fontSize: "18px",
            color: "#a0aec0",
            fontStyle: "bold",
            fontFamily: "Arial"
        }).setOrigin(0.5);

        // Animasi Hover Tombol Tutup [X]
        closeBtnBg.on("pointerover", () => {
            closeBtnBg.setFillStyle(0xe53e3e); // Berubah merah saat di-hover
            closeText.setColor("#ffffff");
            this.tweens.add({ targets: [closeBtnBg, closeText], scaleX: 1.08, scaleY: 1.08, duration: 80 });
        });
        closeBtnBg.on("pointerout", () => {
            closeBtnBg.setFillStyle(0x1c2431);
            closeText.setColor("#a0aec0");
            this.tweens.add({ targets: [closeBtnBg, closeText], scaleX: 1, scaleY: 1, duration: 80 });
        });
        closeBtnBg.on("pointerdown", () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.7,
                scaleY: 0.7,
                alpha: 0,
                duration: 120,
                onComplete: () => container.destroy()
            });
        });

        container.add([contentTitle, contentText, closeBtnBg, closeText]);

        // Jalankan inisialisasi awal
        updatePage();

        // Efek Animasi Masuk Pop-Up (Bouncy)
        container.alpha = 0;
        container.scaleX = 0.8;
        container.scaleY = 0.8;

        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 180,
            ease: 'Back.easeOut'
        });
    }

    createSettingsButton(w, h) {
        const button = this.add.rectangle(
            170,
            360,
            230,
            52,
            0x182026,
            0.95
        ).setInteractive({ useHandCursor: true });

        button.setStrokeStyle(2, 0xf3a922);

        const text = this.add.text(
            170,
            360,
            "SETTINGS",
            {
                fontSize: "18px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        button.on("pointerover", () => {
            button.fillColor = 0xf3a922;
            text.setColor("#000000");
        });

        button.on("pointerout", () => {
            button.fillColor = 0x182026;
            text.setColor("#ffffff");
        });

        button.on("pointerdown", () => {
            this.openSettingsPanel();
        });
    }

    openSettingsPanel() {

        const w = this.scale.width;
        const h = this.scale.height;

        const container = this.add.container(0, 0);
        container.setDepth(9000);

        let musicOn =
            localStorage.getItem("br_music_on");

        if (musicOn === null) {

            musicOn = "true";

            localStorage.setItem(
                "br_music_on",
                "true"
            );
        }

        const overlay = this.add.rectangle(
            w / 2,
            h / 2,
            w,
            h,
            0x000000,
            0.65
        );

        const panel = this.add.rectangle(
            w / 2,
            h / 2,
            520,
            320,
            0x0f141c,
            0.96
        );

        panel.setStrokeStyle(3, 0xf3a922);

        const title = this.add.text(
            w / 2,
            h / 2 - 115,
            "PENGATURAN",
            {
                fontSize: "34px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }
        ).setOrigin(0.5);

        const soundText = this.add.text(
            w / 2,
            h / 2 - 30,
            "",
            {
                fontSize: "24px",
                color: "#f3a922",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const toggleBtn = this.add.rectangle(
            w / 2,
            h / 2 + 35,
            240,
            50,
            0xf3a922
        ).setInteractive({ useHandCursor: true });

        const toggleText = this.add.text(
            w / 2,
            h / 2 + 35,
            "",
            {
                fontSize: "20px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const closeBtn = this.add.rectangle(
            w / 2,
            h / 2 + 115,
            170,
            42,
            0x182026
        ).setInteractive({ useHandCursor: true });

        closeBtn.setStrokeStyle(2, 0xffffff, 0.4);

        const closeText = this.add.text(
            w / 2,
            h / 2 + 115,
            "TUTUP",
            {
                fontSize: "20px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const updateSoundText = () => {

            const current =
                localStorage.getItem("br_music_on") !== "false";

            soundText.setText(
                "MUSIC: " + (current ? "ON" : "OFF")
            );

            toggleText.setText(
                current
                    ? "MATIKAN MUSIC"
                    : "NYALAKAN MUSIC"
            );
        };

        updateSoundText();

        toggleBtn.on("pointerover", () => {

            this.playHoverSound();

            toggleBtn.fillColor = 0xffffff;
            toggleText.setColor("#000000");

        });

        toggleBtn.on("pointerout", () => {

            toggleBtn.fillColor = 0xf3a922;
            toggleText.setColor("#000000");

        });

        toggleBtn.on("pointerdown", () => {

            const currentMusicOn =
                localStorage.getItem("br_music_on") !== "false";

            const newMusicOn = !currentMusicOn;

            localStorage.setItem(
                "br_music_on",
                newMusicOn ? "true" : "false"
            );

            const music = this.sound.get("menuMusic");

            if (newMusicOn) {

                if (music) {

                    if (!music.isPlaying) {
                        music.play();
                    }

                } else {

                    const newMusic =
                        this.sound.add("menuMusic", {
                            loop: true,
                            volume: 0.4
                        });

                    newMusic.play();
                }

            } else {

                if (music && music.isPlaying) {
                    music.stop();
                }

            }

            updateSoundText();

        });

        closeBtn.on("pointerover", () => {

            this.playHoverSound();

            closeBtn.fillColor = 0xf3a922;
            closeText.setColor("#000000");

        });

        closeBtn.on("pointerout", () => {

            closeBtn.fillColor = 0x182026;
            closeText.setColor("#ffffff");

        });

        closeBtn.on("pointerdown", () => {

            container.destroy();

        });

        container.add([
            overlay,
            panel,
            title,
            soundText,
            toggleBtn,
            toggleText,
            closeBtn,
            closeText
        ]);

    }
}