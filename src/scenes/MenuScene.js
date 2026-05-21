export default class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    create() {
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
            "BATTLE ROYALE",
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
            "BATTLE ROYALE",
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

        });

        card.on("pointerout", () => {

            this.tweens.add({
                targets: card,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });

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
        });

        bg.on("pointerdown", () => {
            bg.fillColor = 0xffffff;

            this.cameras.main.fadeOut(300, 0, 0, 0);

            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("GameScene", {
                    enemyCount: enemyCount
                });
            });
        });
    }

    createShopButton(w, h) {
    const button = this.add.rectangle(
        w / 2 - 170,
        h - 120,
        230,
        52,
        0x182026,
        0.95
    ).setInteractive({ useHandCursor: true });

    button.setStrokeStyle(2, 0xf3a922);

    const text = this.add.text(
        w / 2 - 170,
        h - 120,
        "CHARACTER SHOP",
        {
            fontSize: "20px",
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
        this.openCharacterShop();
    });
}

openCharacterShop() {
    const w = this.scale.width;
    const h = this.scale.height;

    if (this.shopContainer) {
        this.shopContainer.destroy();
    }

    this.shopContainer = this.add.container(0, 0);
    this.shopContainer.setDepth(5000);

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
        760,
        430,
        0x090d10,
        0.96
    );

    panel.setStrokeStyle(3, 0xf3a922);

    const title = this.add.text(
        w / 2,
        h / 2 - 175,
        "CHARACTER SHOP",
        {
            fontSize: "34px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);

    const coinText = this.add.text(
        w / 2,
        h / 2 - 135,
        "COIN: " + this.getCoins(),
        {
            fontSize: "22px",
            color: "#ffd700",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);

    this.shopContainer.add([
        overlay,
        panel,
        title,
        coinText
    ]);

    const characters = [
        { id: "default", name: "DEFAULT", price: 0, color: 0xffffff, helmet: 0x2f6b2f },
        { id: "red", name: "RED", price: 10, color: 0xff4444, helmet: 0x992222 },
        { id: "blue", name: "BLUE", price: 20, color: 0x4488ff, helmet: 0x003399 },
        { id: "gold", name: "GOLD", price: 35, color: 0xffcc00, helmet: 0xaa7700 }
    ];

    const unlocked = this.getUnlockedCharacters();
    const selected = this.getSelectedCharacter();

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];

        const x = w / 2 - 255 + i * 170;
        const y = h / 2 + 15;

        const isUnlocked = unlocked.includes(char.id);
        const isSelected = selected === char.id;

        const card = this.add.rectangle(
            x,
            y,
            145,
            190,
            isSelected ? 0x234423 : 0x1a2229,
            1
        ).setInteractive({ useHandCursor: true });

        card.setStrokeStyle(
            isSelected ? 3 : 2,
            isSelected ? 0x77ff77 : 0x777777
        );

        const icon = this.add.circle(
            x,
            y - 55,
            34,
            char.color
        );

        icon.setStrokeStyle(4, char.helmet);

        const visor = this.add.rectangle(
            x,
            y - 68,
            45,
            10,
            0x111111
        );

        const name = this.add.text(
            x,
            y,
            char.name,
            {
                fontSize: "17px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        let label = "";

        if (isSelected) {
            label = "USED";
        } else if (isUnlocked) {
            label = "USE";
        } else {
            label = char.price + " COIN";
        }

        const btn = this.add.rectangle(
            x,
            y + 55,
            105,
            34,
            isSelected ? 0x2f6b2f : 0xf3a922,
            1
        );

        btn.setStrokeStyle(1, 0xffffff);

        const btnText = this.add.text(
            x,
            y + 55,
            label,
            {
                fontSize: "14px",
                color: isSelected ? "#ffffff" : "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        card.on("pointerdown", () => {
            this.handleCharacterClick(char);
        });

        this.shopContainer.add([
            card,
            icon,
            visor,
            name,
            btn,
            btnText
        ]);
    }

    const backButton = this.add.rectangle(
        w / 2,
        h / 2 + 175,
        180,
        44,
        0x182026,
        1
    ).setInteractive({ useHandCursor: true });

    backButton.setStrokeStyle(2, 0xffffff);

    const backText = this.add.text(
        w / 2,
        h / 2 + 175,
        "BACK",
        {
            fontSize: "20px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);

    backButton.on("pointerdown", () => {
        this.shopContainer.destroy();
        this.shopContainer = null;
    });

    this.shopContainer.add([
        backButton,
        backText
    ]);
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
            }
        };

        return skins[id] || skins.default;
    }
}