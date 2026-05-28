export default class TutorialSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentStep = 0;
        this.container = null;
        this.pointerHandler = null;

        this.steps = [
            {
                title: "MOVEMENT",
                desc: "Tekan W A S D untuk bergerak."
            },
            {
                title: "SHOOT",
                desc: "Klik kiri mouse untuk menembak."
            },
            {
                title: "LOOT",
                desc: "Tekan F untuk membuka chest dan mengambil item."
            },
            {
                title: "WEAPON",
                desc: "Tekan 1 - 5 untuk mengganti senjata."
            },
            {
                title: "RELOAD",
                desc: "Tekan R untuk reload senjata."
            },
            {
                title: "OBJECTIVE",
                desc: "Bertahan hidup dan kalahkan semua enemy."
            }
        ];
    }

    shouldShowTutorial() {
        return localStorage.getItem("br_tutorial_done") !== "true";
    }

    create() {
        const w = this.scene.scale.width;
        const h = this.scene.scale.height;

        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(99999);

        this.overlay = this.scene.add.rectangle(
            w / 2,
            h / 2,
            w,
            h,
            0x000000,
            0.72
        );

        this.panel = this.scene.add.rectangle(
            w / 2,
            h / 2,
            560,
            330,
            0x0f141c,
            0.96
        );

        this.panel.setStrokeStyle(3, 0xf3a922);

        this.titleText = this.scene.add.text(
            w / 2,
            h / 2 - 95,
            "",
            {
                fontSize: "34px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial Black"
            }
        ).setOrigin(0.5);

        this.descText = this.scene.add.text(
            w / 2,
            h / 2 - 20,
            "",
            {
                fontSize: "22px",
                color: "#f3a922",
                fontStyle: "bold",
                align: "center",
                fontFamily: "Arial"
            }
        ).setOrigin(0.5);

        this.stepText = this.scene.add.text(
            w / 2,
            h / 2 + 55,
            "",
            {
                fontSize: "15px",
                color: "#8a96a0",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.skipButton = this.scene.add.rectangle(
            w / 2 - 90,
            h / 2 + 115,
            150,
            45,
            0x182026
        );

        this.skipButton.setStrokeStyle(2, 0xffffff, 0.4);

        this.skipText = this.scene.add.text(
            w / 2 - 90,
            h / 2 + 115,
            "SKIP",
            {
                fontSize: "20px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.nextButton = this.scene.add.rectangle(
            w / 2 + 90,
            h / 2 + 115,
            150,
            45,
            0xf3a922
        );

        this.nextText = this.scene.add.text(
            w / 2 + 90,
            h / 2 + 115,
            "NEXT",
            {
                fontSize: "20px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        this.container.add([
            this.overlay,
            this.panel,
            this.titleText,
            this.descText,
            this.stepText,
            this.skipButton,
            this.skipText,
            this.nextButton,
            this.nextText
        ]);

        this.setupClickHandler();

        this.updateStep();
    }

    setupClickHandler() {
        this.pointerHandler = (pointer) => {
            if (!this.container) return;

            const px = pointer.x;
            const py = pointer.y;

            const nextHit =
                px >= this.nextButton.x - 75 &&
                px <= this.nextButton.x + 75 &&
                py >= this.nextButton.y - 22.5 &&
                py <= this.nextButton.y + 22.5;

            const skipHit =
                px >= this.skipButton.x - 75 &&
                px <= this.skipButton.x + 75 &&
                py >= this.skipButton.y - 22.5 &&
                py <= this.skipButton.y + 22.5;

            if (nextHit) {
                this.nextStep();
                return;
            }

            if (skipHit) {
                this.finish();
            }
        };

        this.scene.input.on("pointerdown", this.pointerHandler);
    }

    updateStep() {
        const step = this.steps[this.currentStep];

        this.titleText.setText(step.title);
        this.descText.setText(step.desc);

        this.stepText.setText(
            "Step " + (this.currentStep + 1) + " / " + this.steps.length
        );

        if (this.currentStep === this.steps.length - 1) {
            this.nextText.setText("START");
        } else {
            this.nextText.setText("NEXT");
        }
    }

    nextStep() {
        this.currentStep++;

        if (this.currentStep >= this.steps.length) {
            this.finish();
            return;
        }

        this.updateStep();
    }

    finish() {
        localStorage.setItem("br_tutorial_done", "true");

        if (this.pointerHandler) {
            this.scene.input.off("pointerdown", this.pointerHandler);
            this.pointerHandler = null;
        }

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}