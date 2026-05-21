export default class KillFeedSystem {
    constructor(scene) {
        this.scene = scene;
        this.messages = [];

        this.x = 20;
        this.y = 180;
    }

    addMessage(text) {
        const message = this.scene.add.text(
            this.x,
            this.y + this.messages.length * 24,
            text,
            {
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#000000"
            }
        );

        message.setScrollFactor(0);

        this.messages.push(message);

        if (this.messages.length > 5) {
            const oldMessage = this.messages.shift();
            oldMessage.destroy();
        }

        this.repositionMessages();

        this.scene.time.delayedCall(4000, () => {
            if (message.active) {
                message.destroy();

                this.messages = this.messages.filter(
                    item => item !== message
                );

                this.repositionMessages();
            }
        });
    }

    repositionMessages() {
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].setPosition(
                this.x,
                this.y + i * 24
            );
        }
    }
}