export default class VirtualJoystick {
    constructor(scene, x, y, radius, isRightStick = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.isRightStick = isRightStick;

        // Nilai output untuk dibaca oleh GameScene (-1 sampai 1)
        this.outputX = 0;
        this.outputY = 0;
        this.isDown = false;

        // Visual: Lingkaran Background/Batas Analog
        this.bg = scene.add.circle(x, y, radius, 0xffffff, 0.1);
        this.bg.setStrokeStyle(2, 0xffffff, 0.3);
        this.bg.setScrollFactor(0);
        this.bg.setDepth(5000); // Di atas HUD

        // Visual: Tombol Analog Tengah (Knob)
        this.knob = scene.add.circle(x, y, radius * 0.4, 0xf3a922, 0.7);
        this.knob.setScrollFactor(0);
        this.knob.setDepth(5001);

        this.setupInput();
    }

    setupInput() {
        // Buat area sensor sentuh transparan yang sedikit lebih besar dari analog
        this.hitArea = this.scene.add.circle(this.x, this.y, this.radius * 1.5, 0xffffff, 0);
        this.hitArea.setScrollFactor(0);
        this.hitArea.setDepth(5002);
        this.hitArea.setInteractive();

        // Event saat layar disentuh di area analog
        this.hitArea.on('pointerdown', (pointer) => {
            this.pointer = pointer;
            this.isDown = true;
        });

        // Event saat jari bergerak di layar
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDown && this.pointer && this.pointer.id === pointer.id) {
                this.updateJoystick(pointer);
            }
        });

        // Event saat jari diangkat
        this.scene.input.on('pointerup', (pointer) => {
            if (this.pointer && this.pointer.id === pointer.id) {
                this.resetJoystick();
            }
        });
    }

    updateJoystick(pointer) {
        // Hitung jarak antara titik pusat dengan posisi jari saat ini
        const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);

        // Batasi gerakan knob agar tidak keluar dari lingkaran background (Clamping)
        const maxDist = Math.min(distance, this.radius);
        
        this.knob.x = this.x + Math.cos(angle) * maxDist;
        this.knob.y = this.y + Math.sin(angle) * maxDist;

        // Konversi nilai menjadi rasio -1 sampai 1 untuk pergerakan game
        this.outputX = (this.knob.x - this.x) / this.radius;
        this.outputY = (this.knob.y - this.y) / this.radius;
    }

    resetJoystick() {
        this.isDown = false;
        this.pointer = null;
        this.outputX = 0;
        this.outputY = 0;

        // Kembalikan posisi knob ke tengah secara halus
        this.scene.tweens.add({
            targets: this.knob,
            x: this.x,
            y: this.y,
            duration: 100,
            ease: 'Back.easeOut'
        });
    }
}