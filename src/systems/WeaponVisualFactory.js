export default class WeaponVisualFactory {
    static create(scene, type, x = 0, y = 0, scale = 1) {
        const container = scene.add.container(x, y);
        container.setScale(scale);

        const color = this.getColor(type);

        if (type === "bomb") {
            const body = scene.add.circle(0, 0, 10, 0xcc0000);
            const pin = scene.add.rectangle(5, -9, 8, 3, 0xdddddd);

            container.add([body, pin]);
            return container;
        }

        const body = scene.add.rectangle(18, 0, 34, 8, color);
        const barrel = scene.add.rectangle(38, 0, 18, 4, 0x111111);
        const handle = scene.add.rectangle(12, 8, 6, 14, 0x333333);
        const stock = scene.add.rectangle(0, 0, 12, 8, 0x222222);

        if (type === "pistol") {
            body.width = 20;
            barrel.width = 10;
            barrel.x = 28;
            handle.x = 10;
            stock.width = 0;
        }

        if (type === "uzi" || type === "smg") {
            body.width = 25;
            barrel.width = 12;
            barrel.x = 31;
            handle.x = 13;
            stock.width = 8;
        }

        if (type === "ak" || type === "m4" || type === "scar") {
            body.width = 40;
            barrel.width = 24;
            barrel.x = 44;
            handle.x = 15;
            stock.width = 14;
            stock.x = -4;
        }

        if (type === "sniper") {
            body.width = 50;
            barrel.width = 38;
            barrel.height = 3;
            barrel.x = 60;
            handle.x = 18;

            const scope = scene.add.rectangle(25, -8, 24, 5, 0x111111);
            container.add(scope);
        }


        if (type === "rpg") {
            body.width = 52;
            body.height = 14;
            barrel.width = 30;
            barrel.height = 10;
            barrel.x = 56;
            handle.width = 9;
            handle.height = 18;
            handle.x = 18;
            handle.y = 13;
        }

        container.add([
            stock,
            body,
            barrel,
            handle
        ]);

        return container;
    }

    static getColor(type) {
        const colors = {
            pistol: 0x444444,
            uzi: 0x00ccff,
            smg: 0x00ff99,
            ak: 0xff6600,
            m4: 0x0066ff,
            scar: 0xffff00,
            sniper: 0xaa00ff,
            rpg: 0xff0000,
            bomb: 0xcc0000
        };

        return colors[type] || 0x222222;
    }
}