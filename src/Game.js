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

        // Background - fills viewport
        this.bg = new Background({
            scene: this,
            pImage: "main_bg", lImage: "main_bg",
            pScaleX: 1.1, pScaleY: 1.1,
            lScaleX: 2.2,  lScaleY: 2.2,
            container: this.mainContainer
        });

        // Move counter at top center
        this.moveCounter = new MoveCounter({
            scene: this,
            container: this.mainContainer
        });

        // Collection zones in center vertically
        this.edibleZone = new CollectionZone({
            scene: this,
            zoneType: "edible",
            container: this.mainContainer,
            px: 0, py: -50
        });

        this.notEdibleZone = new CollectionZone({
            scene: this,
            zoneType: "not_edible",
            container: this.mainContainer,
            px: 0, py: 100
        });

        // Left stack - left side column
        this.leftStack = new CardStack({
            scene: this,
            cards: [
                { type: "not_edible", index: 1, faceUp: false },
                { type: "edible", index: 1, faceUp: true },
                { type: "not_edible", index: 2, faceUp: false },
                { type: "edible", index: 2, faceUp: true }
            ],
            container: this.mainContainer,
            px: -200, py: 0,
            stackPosition: "left"
        });

        // Right stack - right side column
        this.rightStack = new CardStack({
            scene: this,
            cards: [
                { type: "edible", index: 3, faceUp: false },
                { type: "not_edible", index: 3, faceUp: true },
                { type: "edible", index: 4, faceUp: false },
                { type: "not_edible", index: 4, faceUp: true }
            ],
            container: this.mainContainer,
            px: 200, py: 0,
            stackPosition: "right"
        });

        this.winLoseScreen = new WinLoseScreen({
            scene: this,
            container: this.mainContainer
        });

        // Setup input handlers
        this.setupInput();
        
        // Delay for sizing
        this.time.addEvent({
            delay: 100,
            callback: () => {
                this.resizeSquare(this.scale.height / this.scale.width);
                this.scale.on("resize", () => {
                    setTimeout(() => {
                        this.resizeSquare(this.scale.height / this.scale.width);
                    }, 11);
                });
            }
        });
        
        this.time.addEvent({
            delay: 600,
            callback: () => {
                this.makeTopCardsInteractive();
            }
        });
    }

    setupInput() {
        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            if (!this.draggingCard) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on("dragend", (pointer, gameObject) => {
            if (!this.draggingCard || this.gameOver) {
                this.draggingCard = null;
                return;
            }
            
            const dropResult = this.checkDropZone(gameObject);
            
            if (dropResult.dropped) {
                this.handleCorrectDrop(gameObject, dropResult.zone);
            } else if (dropResult.nearZone) {
                this.handleWrongDrop(gameObject, dropResult.zone);
            } else {
                const stack = this.getCardStack(gameObject);
                if (stack) {
                    const origPos = stack.getOriginalCardPosition(gameObject);
                    this.tweens.add({
                        targets: gameObject,
                        x: origPos.x,
                        y: origPos.y,
                        duration: 200,
                        ease: "Cubic"
                    });
                }
            }
            
            this.draggingCard = null;
        });
    }

    getCardStack(card) {
        if (this.leftStack && this.leftStack.cardsData && this.leftStack.cardsData.indexOf(card) >= 0) {
            return this.leftStack;
        }
        if (this.rightStack && this.rightStack.cardsData && this.rightStack.cardsData.indexOf(card) >= 0) {
            return this.rightStack;
        }
        return null;
    }

    checkDropZone(card) {
        const cardCenterX = card.x;
        const cardCenterY = card.y;
        
        const distToEdible = Phaser.Math.Distance.Between(cardCenterX, cardCenterY, 
            this.edibleZone.x, this.edibleZone.y);
        const distToNotEdible = Phaser.Math.Distance.Between(cardCenterX, cardCenterY, 
            this.notEdibleZone.x, this.notEdibleZone.y);
        
        const dropRadius = 100;
        
        if (distToEdible < dropRadius) {
            return { dropped: true, zone: this.edibleZone };
        } else if (distToNotEdible < dropRadius) {
            return { dropped: true, zone: this.notEdibleZone };
        }
        
        const nearRadius = 180;
        if (distToEdible < nearRadius) return { nearZone: true, zone: this.edibleZone };
        if (distToNotEdible < nearRadius) return { nearZone: true, zone: this.notEdibleZone };
        
        return { dropped: false, nearZone: false };
    }

    async handleCorrectDrop(card, zone) {
        const cardType = card.getCardType();
        
        if (zone.canAcceptCard(cardType)) {
            card.setDepth(30);
            
            await new Promise(resolve => {
                this.tweens.add({
                    targets: card,
                    x: zone.x,
                    y: zone.y,
                    scaleX: 0.3,
                    scaleY: 0.3,
                    duration: 250,
                    ease: "Cubic",
                    onComplete: resolve
                });
            });
            
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
        
        await new Promise(resolve => {
            this.tweens.add({
                targets: card,
                x: "+15",
                duration: 50,
                yoyo: true,
                repeat: 4,
                onComplete: resolve
            });
        });
        
        const stack = card.parentContainer === this.leftStack ? this.leftStack : this.rightStack;
        const origPos = stack.getOriginalCardPosition(card);
        
        this.tweens.add({
            targets: card,
            x: origPos.x,
            y: origPos.y,
            duration: 200,
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

        if (leftTop) {
            leftTop.disableInteractive();
            leftTop.removeAllListeners("pointerdown");
        }
        if (rightTop) {
            rightTop.disableInteractive();
            rightTop.removeAllListeners("pointerdown");
        }

        if (leftTop && leftTop.isCardFaceUp()) {
            leftTop.setInteractive();
            leftTop.on("pointerdown", () => {
                if (this.gameOver) return;
                this.draggingCard = leftTop;
                leftTop.setDepth(20);
            });
        }

        if (rightTop && rightTop.isCardFaceUp()) {
            rightTop.setInteractive();
            rightTop.on("pointerdown", () => {
                if (this.gameOver) return;
                this.draggingCard = rightTop;
                rightTop.setDepth(20);
            });
        }
    }

    resizeSquare(ratio) {
        const isPortrait = this.scale.height > this.scale.width;
        this.game.size.isPortrait = isPortrait;
        this.game.size.resize();
    }
}