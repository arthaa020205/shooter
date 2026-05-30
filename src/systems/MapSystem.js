export default class MapSystem {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];

        this.worldWidth = 6000;
        this.worldHeight = 4500;
    }

    createWorld() {
        this.scene.physics.world.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        this.scene.cameras.main.setBounds(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );

        // UBAH: Menggunakan warna rumput segar siang hari yang cerah (Vibrant Summer Grass)
        this.scene.cameras.main.setBackgroundColor("#458b37");
    }

    createGrid() {
        const graphics = this.scene.add.graphics();

        // UBAH: Garis grid menggunakan warna putih transparan tipis agar kontrasnya bersih dan cerah
        graphics.lineStyle(1, 0xffffff, 0.12);

        const gridSize = 200;

        for (let x = 0; x < this.worldWidth; x += gridSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.worldHeight);
        }

        for (let y = 0; y < this.worldHeight; y += gridSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.worldWidth, y);
        }

        graphics.strokePath();
    }

    // MEMPERBAGUS POHON (Warna Cerah, Daun Segar Berlapis)
    createTree(x, y) {
        // 1. Bayangan pohon (dibuat tipis samar agar tidak kotor)
        const shadow = this.scene.add.circle(x + 10, y + 10, 45, 0x000000, 0.15);

        // 2. Batang pohon tengah
        const trunk = this.scene.add.circle(x, y, 12, 0x5e3a1e);

        // 3. Daun Lapisan Luar (Hijau Rimba Segar)
        const leafBase = this.scene.add.circle(x, y, 45, 0x1e6f2d);
        leafBase.setStrokeStyle(2, 0x12471b, 0.6);

        // 4. Daun Lapisan Tengah (Hijau Cerah)
        const leafMid = this.scene.add.circle(x - 2, y - 2, 32, 0x2b993f);

        // 5. Daun Lapisan Atas (Hijau Muda/Lime - Pantulan Sinar Matahari)
        const leafTop = this.scene.add.circle(x - 5, y - 5, 18, 0x5cd673);

        // Daun luar dijadikan objek fisik collider
        this.scene.physics.add.existing(leafBase, true);
        this.obstacles.push(leafBase);

        const treeGroup = [shadow, trunk, leafMid, leafTop];
        treeGroup.forEach(el => el.setDepth(10));
        leafBase.setDepth(11);
    }

    // MEMPERBAGUS BANGUNAN (Warna Dinding Krem Cerah & Atap Merah Bata Taktis)
    createBuilding(x, y, width, height) {
        // 1. Bayangan Bangunan halus
        const shadow = this.scene.add.rectangle(x + 15, y + 15, width, height, 0x000000, 0.15);

        // 2. Tembok Luar Dasar (Krem Cerah Urban / Desert Sand)
        const building = this.scene.add.rectangle(x, y, width, height, 0xd6c2a1);
        building.setStrokeStyle(3, 0xa19075, 1);

        this.scene.physics.add.existing(building, true);
        this.obstacles.push(building);

        // 3. Desain Atap Internal (Warna Merah Bata / Terracotta khas kompleks militer cerah)
        const roofInner = this.scene.add.rectangle(x, y, width - 20, height - 20, 0xb84d37);
        roofInner.setStrokeStyle(2, 0x873220, 1);

        // 4. Struktur Ventilasi / Dak Beton Atas
        const vent = this.scene.add.rectangle(x - width / 4, y - height / 4, 35, 35, 0xd6c2a1);
        vent.setStrokeStyle(1, 0xa19075, 1);
        const ventInner = this.scene.add.rectangle(x - width / 4, y - height / 4, 25, 25, 0x3a3f45);

        const bldGroup = [shadow, roofInner, vent, ventInner];
        bldGroup.forEach(el => el.setDepth(20));
        building.setDepth(21);
    }

    // MEMPERBAGUS COVER / TEMBOK / PETI SUPPLY (Cokelat Oranye Terang)
    // MEMPERBAGUS COVER / TEMBOK / PETI SUPPLY (Cokelat Oranye Terang)
    createCover(x, y, width, height) {
        // 1. Bayangan objek cover halus di bawahnya
        const shadow = this.scene.add.rectangle(x + 5, y + 5, width, height, 0x000000, 0.15);

        // 2. Badan Peti Utama
        const cover = this.scene.add.rectangle(x, y, width, height, 0xb56934);
        this.scene.physics.add.existing(cover, true);
        this.obstacles.push(cover);
        cover.setStrokeStyle(2, 0x6e3916);

        // 3. PERBAIKAN: Membuat garis silang dekorasi yang presisi menggunakan Graphics
        // Cara ini dijamin mengunci garis tepat di dalam batas ukuran peti, tidak peduli ukuran panjang/lebarnya
        const crossGraphics = this.scene.add.graphics();
        crossGraphics.lineStyle(2, 0x6e3916, 0.4); // Ketebalan 2px, warna cokelat gelap transparan

        // Menghitung batas sudut-sudut peti berdasarkan posisi pusat (x, y)
        const left = x - width / 2;
        const right = x + width / 2;
        const top = y - height / 2;
        const bottom = y + height / 2;

        // Garis diagonal 1: Dari pojok kiri atas ke kanan bawah
        crossGraphics.moveTo(left, top);
        crossGraphics.lineTo(right, bottom);

        // Garis diagonal 2: Dari pojok kiri bawah ke kanan atas
        crossGraphics.moveTo(left, bottom);
        crossGraphics.lineTo(right, top);

        crossGraphics.strokePath();

        // Mengatur susunan kedalaman agar bayangan tetap di paling bawah
        shadow.setDepth(5);
        cover.setDepth(6);
        crossGraphics.setDepth(7);
    }

    // FITUR SEMAK (Warna Hijau Cerah Lembut)
    createBush(x, y) {
        const b1 = this.scene.add.circle(x, y, 28, 0x488226, 0.9);
        const b2 = this.scene.add.circle(x + 12, y + 4, 22, 0x3d701f, 0.9);
        const b3 = this.scene.add.circle(x - 8, y - 6, 20, 0x55962f, 0.9);

        b1.setDepth(15);
        b2.setDepth(15);
        b3.setDepth(15);
    }

    createObstacles() {
        const trees = [
            [300, 300], [700, 500], [1200, 350], [1800, 600],
            [2500, 400], [3300, 700], [3700, 1200], [3000, 1500],
            [2400, 1800], [1600, 1500], [900, 1800], [500, 2500],
            [1400, 2600], [2200, 2400], [3200, 2600], [3700, 2200],
            [500, 900], [950, 1200], [1350, 850], [2100, 950],
            [2700, 1150], [3450, 1650], [3100, 2050], [1900, 2250],
            [800, 2700], [2500, 2700]
        ];

        for (let i = 0; i < trees.length; i++) {
            this.createTree(trees[i][0], trees[i][1]);
        }

        this.createBuilding(900, 900, 260, 180);
        this.createBuilding(1800, 1100, 300, 220);
        this.createBuilding(2900, 900, 280, 200);
        this.createBuilding(1200, 2200, 320, 220);
        this.createBuilding(2800, 2300, 360, 240);

        this.createCover(650, 1450, 180, 35);
        this.createCover(1100, 1600, 35, 180);
        this.createCover(2100, 1450, 220, 35);
        this.createCover(2600, 1700, 35, 220);
        this.createCover(3400, 500, 200, 35);
        this.createCover(3600, 1900, 35, 200);
        this.createCover(450, 2100, 220, 35);
        this.createCover(1550, 2800, 250, 35);

        const bushes = [
            [450, 400], [1050, 700], [1600, 1200], [2000, 1000],
            [1300, 2400], [2600, 2100], [3000, 2500], [800, 1500]
        ];
        for (let i = 0; i < bushes.length; i++) {
            this.createBush(bushes[i][0], bushes[i][1]);
        }
    }
}