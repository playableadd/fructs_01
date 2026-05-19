import ParentScene from "../core/framework/components/Scene";
import Background from "./Background";
import MoveCounter from "./MoveCounter";
import CollectionZone from "./CollectionZone";
import CardStack from "./CardStack";
import WinLoseScreen from "./WinLoseScreen";

export default class Game extends ParentScene {
    create() {
        this.initScene();
    }

    initScene() {
        this.gameOver = false;
        this.movesLeft = 161;
        this.totalCards = 8;
        this.collectedCards = 0;
        this.draggingCard = null;
        this.dragOffset = { x: 0, y: 0 };

        this.bg = new Background({
            scene: this,
            pImage: "main_bg", lImage: "main_bg",
            pScaleX: 1.05, pScaleY: 1.05,
            lScaleX: 2.1,  lScaleY: 2.1,
            container: this.mainContainer
        });

        this.moveCounter = new MoveCounter({
            scene: this,
            container: this.mainContainer
        });

        this.edibleZone = new CollectionZone({
            scene: this,
            zoneType: "edible",
            container: this.mainContainer,
            px: 0, py: -80
        });

        this.notEdibleZone = new CollectionZone({
            scene: this,
            zoneType: "not_edible",
            container: this.mainContainer,
            px: 0, py: 80
        });

        this.leftStack = new CardStack({
            scene: this,
            cards: [
                { type: "not_edible", index: 1, faceUp: false },
                { type: "edible", index: 1, faceUp: true },
                { type: "not_edible", index: 2, faceUp: false },
                { type: "edible", index: 2, faceUp: true }
            ],
            container: this.mainContainer,
            px: -160, py: 0,
            stackPosition: "left"
        });

        this.rightStack = new CardStack({
            scene: this,
            cards: [
                { type: "edible", index: 3, faceUp: false },
                { type: "not_edible", index: 3, faceUp: true },
                { type: "edible", index: 4, faceUp: false },
                { type: "not_edible", index: 4, faceUp: true }
            ],
            container: this.mainContainer,
            px: 160, py: 0,
            stackPosition: "right"
        });

        this.winLoseScreen = new WinLoseScreen({
            scene: this,
            container: this.mainContainer
        });

        this.setupInput();
        
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.resizeSquare(this.scale.height / this.scale.width);
                this.scale.on("resize", () => {
                    setTimeout(() => {
                        this.resizeSquare(this.scale.height / this.scale.width);
                    }, 11);
                });
                this.makeTopCardsInteractive();
            }
        });
    }

    setupInput() {
        this.input.on("dragstart", (pointer, gameObject) => {
            if (this.gameOver) return;
            
            const topCard = this.getStackTopCard(gameObject);
            if (!topCard || topCard !== gameObject) return;
            
            this.draggingCard = gameObject;
            gameObject.setDepth(20);
            
            gameObject.animate({
                pScaleX: 0.6,
                pScaleY: 0.6,
                duration: 100,
                ease: "Cubic"
            });
        });

        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (!this.draggingCard) return;
            
            const offsetX = (pointer.x - pointer.downX) * 0.3;
            const offsetY = (pointer.y - pointer.downY) * 0.3;
            
            gameObject.x = dragX + offsetX;
            gameObject.y = dragY + offsetY;
        });

        this.input.on("dragend", (pointer, gameObject) => {
            if (!this.draggingCard || this.gameOver) return;
            
            const dropResult = this.checkDropZone(gameObject);
            
            if (dropResult.dropped) {
                this.handleCorrectDrop(gameObject, dropResult.zone);
            } else if (dropResult.nearZone) {
                this.handleWrongDrop(gameObject, dropResult.zone);
            }
            
            this.draggingCard = null;
        });
    }

    getStackTopCard(card) {
        const leftTop = this.leftStack.getTopCard();
        const rightTop = this.rightStack.getTopCard();
        
        if (leftTop === card) return leftTop;
        if (rightTop === card) return rightTop;
        
        return null;
    }

    checkDropZone(card) {
        const cardWorldPos = { x: card.x, y: card.y };
        
        const edibleZonePos = this.getWorldPosition(this.edibleZone);
        const notEdibleZonePos = this.getWorldPosition(this.notEdibleZone);
        
        const zoneRadius = 80;
        
        const distToEdible = Phaser.Math.Distance.Between(
            cardWorldPos.x, cardWorldPos.y,
            edibleZonePos.x, edibleZonePos.y
        );
        
        const distToNotEdible = Phaser.Math.Distance.Between(
            cardWorldPos.x, cardWorldPos.y,
            notEdibleZonePos.x, notEdibleZonePos.y
        );
        
        if (distToEdible < zoneRadius) {
            return {
                dropped: true,
                zone: this.edibleZone,
                zonePos: edibleZonePos
            };
        } else if (distToNotEdible < zoneRadius) {
            return {
                dropped: true,
                zone: this.notEdibleZone,
                zonePos: notEdibleZonePos
            };
        } else if (distToEdible < zoneRadius * 2 || distToNotEdible < zoneRadius * 2) {
            const nearestZone = distToEdible < distToNotEdible ? this.edibleZone : this.notEdibleZone;
            const nearestPos = distToEdible < distToNotEdible ? edibleZonePos : notEdibleZonePos;
            return {
                dropped: false,
                nearZone: true,
                zone: nearestZone,
                zonePos: nearestPos
            };
        }
        
        return { dropped: false, nearZone: false };
    }

    getWorldPosition(container) {
        const pos = container.getByName("__position");
        if (pos) {
            return { x: pos.x, y: pos.y };
        }
        return { x: container.x, y: container.y };
    }

    async handleCorrectDrop(card, zone) {
        const cardType = card.getCardType();
        const zoneType = zone.getZoneType();
        
        if (zone.canAcceptCard(cardType)) {
            const zonePos = this.getWorldPosition(zone);
            
            await card.magnetizeTo(zonePos.x, zonePos.y);
            
            this.mainContainer.remove(card);
            zone.addCard(card);
            
            this.collectedCards++;
            this.movesLeft = this.moveCounter.decreaseMoves();
            
            const stack = card.parentContainer === this.leftStack ? this.leftStack : this.rightStack;
            const result = stack.removeTopCard();
            
            if (result.flipCard) {
                await result.flipCard.flipOpen();
            }
            
            this.checkWinCondition();
        } else {
            await this.handleWrongDrop(card, zone);
        }
    }

    async handleWrongDrop(card, zone) {
        zone.showError();
        
        this.sound.play("fail");
        
        card.setDepth(10);
        
        const stack = card.parentContainer === this.leftStack ? this.leftStack : this.rightStack;
        const originalPos = stack.getOriginalCardPosition(card);
        
        await card.shake();
        
        card.scene.tweens.add({
            targets: card,
            x: originalPos.x,
            y: originalPos.y,
            duration: 300,
            ease: "Cubic"
        });
        
        this.movesLeft = this.moveCounter.decreaseMoves();
        
        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.collectedCards >= this.totalCards) {
            this.gameOver = true;
            this.winLoseScreen.showWin();
        } else if (this.movesLeft <= 0) {
            this.gameOver = true;
            this.winLoseScreen.showLose();
        } else {
            this.makeTopCardsInteractive();
        }
    }

    makeTopCardsInteractive() {
        const leftTop = this.leftStack.getTopCard();
        const rightTop = this.rightStack.getTopCard();

        if (leftTop && leftTop.isCardFaceUp()) {
            leftTop.setInteractive();
            leftTop.input.setDraggable();
        }

        if (rightTop && rightTop.isCardFaceUp()) {
            rightTop.setInteractive();
            rightTop.input.setDraggable();
        }
    }

    resizeSquare(ratio) {
        const isPortrait = this.scale.height > this.scale.width;
        this.game.size.isPortrait = isPortrait;
        this.game.size.resize();
    }
}
