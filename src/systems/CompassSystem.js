export default class CompassSystem {
    constructor(scene) {
        this.scene = scene;

        this.width = 600; // Dipersempit sedikit agar lebih fokus seperti PUBG asli
        this.centerX = scene.scale.width / 2;
        this.y = 35; // Jarak vertikal yang ideal dari atas layar

        this.container = scene.add.container(
            this.centerX,
            this.y
        );

        this.container.setScrollFactor(0);
        this.container.setDepth(4500); // Pastikan berada di atas segalanya

        // ==========================================
        // BACKGROUND COMPASS (PUBG RADAR STYLE)
        // ==========================================
        // Menggunakan warna abu-abu gelap transparan tipis khas PUBG
        this.background = scene.add.rectangle(
            0,
            0,
            this.width,
            38,
            0x0f141c,
            0.6
        );

        // Border tipis transparan di sekeliling kompas
        this.background.setStrokeStyle(
            1,
            0xffffff,
            0.1
        );

        this.container.add(this.background);

        this.labels = [];
        this.ticks = [];

        this.directions = [
            { label: "N", angle: 0 },
            { label: "NE", angle: 45 },
            { label: "E", angle: 90 },
            { label: "SE", angle: 135 },
            { label: "S", angle: 180 },
            { label: "SW", angle: 225 },
            { label: "W", angle: 270 },
            { label: "NW", angle: 315 }
        ];

        const fontMain = "Arial, Helvetica, sans-serif";
        const fontMono = "Courier New, monospace";

        // Generate Huruf Arah Mata Angin
        for (let i = 0; i < this.directions.length; i++) {
            const isNorth = this.directions[i].label === "N";
            const text = scene.add.text(
                0,
                -6,
                this.directions[i].label,
                {
                    fontSize: isNorth ? "16px" : "14px",
                    color: isNorth ? "#f3a922" : "#ffffff", // N berwarna kuning khas PUBG
                    fontStyle: "bold",
                    fontFamily: fontMain
                }
            ).setOrigin(0.5);

            this.labels.push({
                object: text,
                angle: this.directions[i].angle
            });

            this.container.add(text);
        }

        // Generate Garis Detak Kompas (Ticks)
        for (let a = 0; a < 360; a += 5) { // Dibuat per 5 derajat agar lebih rapat & detail
            let tickHeight = 6;
            let tickAlpha = 0.3;

            if (a % 45 === 0) {
                tickHeight = 12; // Garis panjang untuk mata angin utama
                tickAlpha = 0.8;
            } else if (a % 15 === 0) {
                tickHeight = 9;  // Garis sedang
                tickAlpha = 0.5;
            }

            const tick = scene.add.rectangle(
                0,
                11,
                1.5, // Garis lebih tipis agar taktis
                tickHeight,
                0xffffff,
                tickAlpha
            );

            this.ticks.push({
                object: tick,
                angle: a
            });

            this.container.add(tick);
        }

        // ==========================================
        // CENTER VALUE INDICATOR (ANGKA DERAJAT TENGAH)
        // ==========================================
        // Penunjuk angka derajat pas di tengah bawah kompas (Warna kuning emas PUBG)
        this.centerValue = scene.add.text(
            0,
            28,
            "0",
            {
                fontSize: "15px",
                color: "#f3a922", 
                fontStyle: "bold",
                fontFamily: fontMono
            }
        ).setOrigin(0.5);

        // Garis segitiga kecil penanda tengah (Center Notch)
        this.centerNotch = scene.add.triangle(
            0, -18,
            0, 0, 
            -5, -6, 
            5, -6, 
            0xf3a922, 1
        );

        this.container.add([this.centerValue, this.centerNotch]);
    }

    update(player) {
        const pointer = this.scene.input.activePointer;

        const angleRad = Phaser.Math.Angle.Between(
            player.sprite.x,
            player.sprite.y,
            pointer.worldX,
            pointer.worldY
        );

        let heading = Phaser.Math.RadToDeg(angleRad) + 90;

        if (heading < 0) {
            heading += 360;
        }

        heading = Math.floor(heading % 360);

        this.centerValue.setText(heading);

        this.updateObjects(this.labels, heading, true);
        this.updateObjects(this.ticks, heading, false);
    }

    updateObjects(items, heading, isLabel) {
        // Skala kerapatan pergeseran kompas
        const pixelsPerDegree = 3.2; 
        const halfWidth = this.width / 2;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            let diff = item.angle - heading;

            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            const x = diff * pixelsPerDegree;
            item.object.x = x;

            // Batas maksimal komponen terlihat di dalam box
            const absX = Math.abs(x);
            const isInside = absX < halfWidth - 10;

            item.object.setVisible(isInside);

            if (isInside) {
                // ==========================================
                // EFREK FADE OUT MARGIN (PUBG HUD METHOD)
                // ==========================================
                // Semakin mendekati ujung kiri/kanan panel, item akan memudar secara halus
                const fadeZone = halfWidth * 0.4; // Mulai memudar di 40% area terluar
                if (absX > halfWidth - fadeZone) {
                    const factor = (halfWidth - absX) / fadeZone;
                    item.object.setAlpha(factor);
                } else {
                    item.object.setAlpha(1);
                }
            } else {
                item.object.setAlpha(0);
            }
        }
    }
}