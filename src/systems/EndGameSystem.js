import SaveSystem from "./SaveSystem.js";

export default class EndGameSystem {
    constructor(scene) {
        this.scene = scene;
        this.isShowing = false;
    }

    getCoinReward(placement) {
        if (placement === 1) {
            return 10;
        }

        if (placement === 2) {
            return 5;
        }

        if (placement === 3) {
            return 3;
        }

        return 0;
    }

    showResult(status, placement, kills, damage) {
        if (this.isShowing) return;

        this.isShowing = true;

        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        const rewardCoin = this.getCoinReward(placement);

        if (rewardCoin > 0) {
            SaveSystem.addCoins(rewardCoin);
        }

        this.scene.physics.pause();

        const overlay = this.scene.add.rectangle(
            w / 2,
            h / 2,
            w,
            h,
            0x000000,
            0.72
        );

        const panel = this.scene.add.rectangle(
            w / 2,
            h / 2,
            520,
            460,
            0x101820,
            0.96
        );

        panel.setStrokeStyle(3, 0xf3a922);

        const titleColor =
            status === "YOU WIN"
                ? "#00ff66"
                : "#ff4444";

        const title = this.scene.add.text(
            w / 2,
            h / 2 - 175,
            status,
            {
                fontSize: "46px",
                color: titleColor,
                fontStyle: "bold",
                fontFamily: "Arial Black, Impact, sans-serif"
            }
        ).setOrigin(0.5);

        const placementText = this.scene.add.text(
            w / 2,
            h / 2 - 105,
            "PLACEMENT #" + placement,
            {
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const statBox = this.scene.add.rectangle(
            w / 2,
            h / 2 - 15,
            380,
            105,
            0x000000,
            0.35
        );

        statBox.setStrokeStyle(1, 0xffffff, 0.2);

        const killText = this.scene.add.text(
            w / 2 - 90,
            h / 2 - 35,
            "KILLS\n" + kills,
            {
                fontSize: "22px",
                color: "#ffffff",
                fontStyle: "bold",
                align: "center"
            }
        ).setOrigin(0.5);

        const damageText = this.scene.add.text(
            w / 2 + 90,
            h / 2 - 35,
            "DAMAGE\n" + damage,
            {
                fontSize: "22px",
                color: "#ffffff",
                fontStyle: "bold",
                align: "center"
            }
        ).setOrigin(0.5);

        const rewardText = this.scene.add.text(
            w / 2,
            h / 2 + 65,
            "+ " + rewardCoin + " COIN",
            {
                fontSize: "32px",
                color: "#ffd700",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const totalCoinText = this.scene.add.text(
            w / 2,
            h / 2 + 105,
            "TOTAL COIN: " + SaveSystem.getCoins(),
            {
                fontSize: "20px",
                color: "#f3a922",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        const button = this.scene.add.rectangle(
            w / 2,
            h / 2 + 170,
            250,
            58,
            0xf3a922,
            1
        ).setInteractive({ useHandCursor: true });

        button.setStrokeStyle(2, 0xffffff);

        const buttonText = this.scene.add.text(
            w / 2,
            h / 2 + 170,
            "BACK TO MENU",
            {
                fontSize: "22px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        button.on("pointerover", () => {
            button.fillColor = 0xffc24a;
            buttonText.setScale(1.05);
        });

        button.on("pointerout", () => {
            button.fillColor = 0xf3a922;
            buttonText.setScale(1);
        });

        button.on("pointerdown", () => {
            this.scene.scene.start("MenuScene");
        });

        const elements = [
            overlay,
            panel,
            title,
            placementText,
            statBox,
            killText,
            damageText,
            rewardText,
            totalCoinText,
            button,
            buttonText
        ];

        for (let i = 0; i < elements.length; i++) {
            elements[i].setScrollFactor(0);
            elements[i].setDepth(6000);
        }
    }
}