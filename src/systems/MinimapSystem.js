export default class MinimapSystem {
    constructor(scene) {
        this.scene = scene;

        this.mapWidth = 6000;
        this.mapHeight = 4500;

        // Pengaturan Ukuran Minimap
        this.size = 180;
        this.margin = 30;
        this.x = scene.scale.width - this.size - this.margin;
        this.y = this.margin;

        // Titik pusat radar
        this.centerX = this.x + this.size / 2;
        this.centerY = this.y + this.size / 2;
        this.radius = this.size / 2;

        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(2500);

        this.createCompassLabels(scene);
    }

    createCompassLabels(scene) {
        const textStyle = {
            fontSize: "11px",
            color: "#ffffff",
            fontStyle: "bold",
            fontFamily: "Arial Black, Arial, sans-serif"
        };

        this.lblN = scene.add.text(this.centerX, this.y - 12, "N", textStyle).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblS = scene.add.text(this.centerX, this.y + this.size + 12, "S", textStyle).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblW = scene.add.text(this.x - 12, this.centerY, "W", textStyle).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
        this.lblE = scene.add.text(this.x + this.size + 12, this.centerY, "E", textStyle).setOrigin(0.5).setScrollFactor(0).setDepth(2501);
    }

    update(player, enemies, zoneSystem) {
        this.graphics.clear();

        // ==========================================
        // 1. BASE RADAR & GRID
        // ==========================================
        this.graphics.fillStyle(0x0c1014, 0.75);
        this.graphics.fillCircle(this.centerX, this.centerY, this.radius);

        this.graphics.lineStyle(1, 0xffffff, 0.05);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius * 0.66);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius * 0.33);

        this.graphics.lineStyle(1, 0xffffff, 0.08);
        this.graphics.moveTo(this.x, this.centerY);
        this.graphics.lineTo(this.x + this.size, this.centerY);
        this.graphics.moveTo(this.centerX, this.y);
        this.graphics.lineTo(this.centerX, this.y + this.size);
        this.graphics.strokePath();

        // ==========================================
        // 2. RENDERING BATTLE ZONE
        // ==========================================
        if (zoneSystem.active) {
            const zoneX = this.x + (zoneSystem.centerX / this.mapWidth) * this.size;
            const zoneY = this.y + (zoneSystem.centerY / this.mapHeight) * this.size;
            const zoneRad = (zoneSystem.radius / this.mapWidth) * this.size;

            this.graphics.lineStyle(2.5, 0x00f0ff, 1);
            this.graphics.strokeCircle(zoneX, zoneY, zoneRad);
        }

        if (zoneSystem.state === "waiting" && zoneSystem.active && zoneSystem.phase < zoneSystem.zonePhases.length) {
            const nextZoneX = this.x + (zoneSystem.nextCenterX / this.mapWidth) * this.size;
            const nextZoneY = this.y + (zoneSystem.nextCenterY / this.mapHeight) * this.size;
            const nextZoneRad = (zoneSystem.zonePhases[zoneSystem.phase].endRadius / this.mapWidth) * this.size;

            this.graphics.lineStyle(1.5, 0xffffff, 0.85);
            this.graphics.strokeCircle(nextZoneX, nextZoneY, nextZoneRad);
        }

        // ==========================================
        // 3. RENDERING ENEMIES
        // ==========================================
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if (!enemy.sprite.active) continue;

            let enemyX = this.x + (enemy.sprite.x / this.mapWidth) * this.size;
            let enemyY = this.y + (enemy.sprite.y / this.mapHeight) * this.size;

            // Hitung jarak titik musuh dari pusat minimap
            const distance = Phaser.Math.Distance.Between(this.centerX, this.centerY, enemyX, enemyY);
            
            // Batas maksimal adalah radius minimap dikurangi ukuran dot musuh agar tidak menimpa border
            const maxRadius = this.radius - 4.5;

            // Jika posisi melebihi batas lingkaran
            if (distance > maxRadius) {
                // Opsi A: Tahan posisi musuh di tepi lingkaran
                const angle = Phaser.Math.Angle.Between(this.centerX, this.centerY, enemyX, enemyY);
                enemyX = this.centerX + Math.cos(angle) * maxRadius;
                enemyY = this.centerY + Math.sin(angle) * maxRadius;

                // Opsi B: Jika kamu lebih suka musuhnya HILANG saat di luar lingkaran, 
                // beri komentar (//) pada 3 baris Opsi A di atas, dan aktifkan baris di bawah ini:
                // continue;
            }

            this.graphics.fillStyle(0x000000, 0.6);
            this.graphics.fillCircle(enemyX, enemyY, 4.5);

            this.graphics.fillStyle(0xff3333, 1);
            this.graphics.fillCircle(enemyX, enemyY, 3);
        }

        // ==========================================
        // 4. RENDERING PLAYER + VIEW CONE (FOLLOW MOUSE)
        // ==========================================
        const playerX = this.x + (player.sprite.x / this.mapWidth) * this.size;
        const playerY = this.y + (player.sprite.y / this.mapHeight) * this.size;

        // Ambil pointer aktif (mouse) dari scene game
        const pointer = this.scene.input.activePointer;

        // HITUNG ROTASI MENUJU MOUSE: Menggunakan koordinat dunia (worldX, worldY) agar kalkulasi tetap akurat meskipun kamera bergerak
        const angleToMouse = Phaser.Math.Angle.Between(
            player.sprite.x, 
            player.sprite.y, 
            pointer.worldX, 
            pointer.worldY
        );

        // Gambar Segitiga Arah Pandang (View Cone) Kuning yang mengikuti mouse
        const coneLength = 18; // Panjang sorotan kursor kuning
        const coneAngle = 0.45; // Lebar sudut pandangan (dalam radian)
        
        this.graphics.fillStyle(0xf3a922, 0.4); // Warna kuning khas PUBG sedikit kontras
        this.graphics.beginPath();
        this.graphics.moveTo(playerX, playerY);
        this.graphics.lineTo(
            playerX + Math.cos(angleToMouse - coneAngle) * coneLength,
            playerY + Math.sin(angleToMouse - coneAngle) * coneLength
        );
        this.graphics.lineTo(
            playerX + Math.cos(angleToMouse + coneAngle) * coneLength,
            playerY + Math.sin(angleToMouse + coneAngle) * coneLength
        );
        this.graphics.closePath();
        this.graphics.fill();

        // Icon Titik Player Pusat
        this.graphics.fillStyle(0x000000, 0.8);
        this.graphics.fillCircle(playerX, playerY, 5.5); // Border hitam

        this.graphics.fillStyle(0xf3a922, 1); // Titik tengah kuning
        this.graphics.fillCircle(playerX, playerY, 3.5);

        // ==========================================
        // 5. RADAR BORDER
        // ==========================================
        this.graphics.lineStyle(2, 0x1f262e, 1);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius);

        this.graphics.lineStyle(1, 0xf3a922, 0.4);
        this.graphics.strokeCircle(this.centerX, this.centerY, this.radius + 2);
    }
}