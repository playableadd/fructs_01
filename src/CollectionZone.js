import Utils from "../core/framework/Utils";

export default class CollectionZone extends Phaser.GameObjects.Container {
    constructor({ scene, zoneType, container, px, py }) {
        super(scene, 0, 0);
        this.zoneType = zoneType;
        this.count = 0;
        this.maxCount = 4;
        this.create(container, px, py);
    }

    create(container, px, py) {
        this.background = this.scene.add.image(0, 0, "merge_bg").setDepth(5).setOrigin(0.5, 0.5);
        this.add(this.background);

        this.header = this.scene.add.image(0, -50, "merge_head").setDepth(6).setOrigin(0.5, 0.5);
        this.add(this.header);

        const labelText = this.zoneType === "edible" ? "Edible" : "Non Edible";
        this.label = this.scene.add.text(0, -50, labelText, {
            fontFamily: 'Varela',
            fontSize: 28,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(7).setOrigin(0.5, 0.5);

        this.add(this.label);

        this.counterText = this.scene.add.text(0, 20, `${this.count}/${this.maxCount}`, {
            fontFamily: 'Varela',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(7).setOrigin(0.5, 0.5);

        this.add(this.counterText);

        this.errorCross = this.scene.add.text(0, 0, "✕", {
            fontFamily: 'Arial',
            fontSize: 80,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(8).setOrigin(0.5, 0.5).setAlpha(0);
        this.add(this.errorCross);

        this.cardsContainer = this.scene.add.container(0, 0);
        this.add(this.cardsContainer);

        this.addProperties(["pos", "scale"]);
        this.px = px;
        this.py = py;
        this.lx = px;
        this.ly = py;
        this.pScaleX = 0.65;
        this.pScaleY = 0.65;
        this.lScaleX = 0.5;
        this.lScaleY = 0.5;

        this.setCustomPosition(px, py).setAlign("Center");
        container.add(this);
    }

    getZoneType() {
        return this.zoneType;
    }

    canAcceptCard(cardType) {
        return (this.zoneType === "edible" && cardType === "edible") ||
               (this.zoneType === "not_edible" && cardType === "not_edible");
    }

    addCard(cardSprite) {
        this.count++;
        this.cardsContainer.add(cardSprite);
        
        cardSprite.setPosition(0, 0);
        cardSprite.setScale(0.5);
        
        this.counterText.setText(`${this.count}/${this.maxCount}`);
        return this.count;
    }

    showError() {
        this.errorCross.setAlpha(1);
        this.scene.tweens.add({
            targets: this.errorCross,
            alpha: 0,
            duration: 500,
            ease: "Cubic"
        });
    }

    isFull() {
        return this.count >= this.maxCount;
    }

    getCount() {
        return this.count;
    }
}