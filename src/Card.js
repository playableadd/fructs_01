import Utils from "../core/framework/Utils";

export default class Card extends Phaser.GameObjects.Container {
    constructor({ scene, cardType, itemIndex, container }) {
        super(scene, 0, 0);
        this.cardType = cardType;
        this.itemIndex = itemIndex;
        this.isFaceUp = false;
        this.isTopCard = false;
        this.originalPosition = { x: 0, y: 0 };
        this.create(container);
    }

    create(container) {
        this.background = this.scene.add.image(0, 0, "card-back-bg").setDepth(10).setOrigin(0.5, 0.5);
        this.add(this.background);
        
        this.itemSprite = null;
        
        this.addProperties(["pos", "scale"]);
        this.pScaleX = 0.5;
        this.pScaleY = 0.5;
        this.lScaleX = 0.4;
        this.lScaleY = 0.4;

        this.setCustomPosition(0, 0);
        container.add(this);
    }

    setFaceUp(cardType, itemIndex) {
        this.isFaceUp = true;
        this.cardType = cardType;
        this.itemIndex = itemIndex;

        const textureName = `${cardType}_${itemIndex}`;
        
        if (this.itemSprite) {
            this.itemSprite.destroy();
        }

        this.background.setTexture("card-front-bg");
        
        this.itemSprite = this.scene.add.image(0, 0, textureName).setDepth(11).setOrigin(0.5, 0.5);
        this.add(this.itemSprite);
    }

    setTopCard(isTop) {
        this.isTopCard = isTop;
    }

    getCardType() {
        return this.cardType;
    }

    getItemIndex() {
        return this.itemIndex;
    }

    isCardFaceUp() {
        return this.isFaceUp;
    }

    flipOpen() {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                scaleX: 0,
                duration: 150,
                ease: "Cubic",
                onComplete: () => {
                    this.setFaceUp(this.cardType, this.itemIndex);
                    this.scene.tweens.add({
                        targets: this,
                        scaleX: this.pScaleX,
                        duration: 150,
                        ease: "Cubic",
                        onComplete: resolve
                    });
                }
            });
        });
    }

    shake() {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x: "+20",
                duration: 50,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    this.x = this.originalPosition.x;
                    resolve();
                }
            });
        });
    }

    setOriginalPosition(x, y) {
        this.originalPosition = { x, y };
    }

    magnetizeTo(targetX, targetY) {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 300,
                ease: "Cubic",
                onComplete: resolve
            });
        });
    }

    enableDrag() {
        if (this.isTopCard && this.isFaceUp) {
            this.setInteractive();
            this.input.setDraggable();
        }
    }

    disableDrag() {
        this.disableInteractive();
    }
}