import Card from "./Card";

export default class CardStack extends Phaser.GameObjects.Container {
    constructor({ scene, cards, container, px, py, stackPosition }) {
        super(scene, 0, 0);
        this.cards = cards;
        this.cardsData = [];
        this.stackPosition = stackPosition;
        this.create(container, px, py);
        this.initCards(cards);
    }

    create(container, px, py) {
        this.addProperties(["pos", "scale"]);
        this.px = px;
        this.py = py;
        this.lx = px;
        this.ly = py;
        this.pScaleX = 0.5;
        this.pScaleY = 0.5;
        this.lScaleX = 0.4;
        this.lScaleY = 0.4;

        this.setCustomPosition(px, py).setAlign("Center");
        container.add(this);
    }

    initCards(cards) {
        cards.forEach((cardData, index) => {
            const card = new Card({
                scene: this.scene,
                cardType: cardData.type,
                itemIndex: cardData.index,
                container: this
            });
            
            card.setScale(0.5);
            card.setPosition(0, -index * 15);
            card.setOriginalPosition(0, -index * 15);
            
            if (cardData.faceUp) {
                card.setFaceUp(cardData.type, cardData.index);
            }
            
            if (index === 0) {
                card.setTopCard(true);
            }
            
            this.cardsData.push(card);
        });
    }

    getTopCard() {
        return this.cardsData[0];
    }

    removeTopCard() {
        const removedCard = this.cardsData.shift();
        
        if (this.cardsData.length > 0) {
            const newTopCard = this.cardsData[0];
            newTopCard.setTopCard(true);
            
            if (!newTopCard.isCardFaceUp()) {
                return { card: removedCard, flipCard: newTopCard };
            }
        }
        
        return { card: removedCard, flipCard: null };
    }

    returnCard(card) {
        this.cardsData.unshift(card);
        
        this.cardsData.forEach((c, index) => {
            c.setTopCard(index === 0);
            c.scene.tweens.add({
                targets: c,
                y: -index * 15,
                duration: 300,
                ease: "Cubic"
            });
        });
    }

    getOriginalCardPosition(card) {
        const index = this.cardsData.indexOf(card);
        if (index >= 0) {
            return { x: 0, y: -index * 15 };
        }
        return { x: 0, y: 0 };
    }

    updatePositions() {
        this.cardsData.forEach((card, index) => {
            card.setPosition(0, -index * 15);
            card.setOriginalPosition(0, -index * 15);
        });
    }

    flipTopCard() {
        if (this.cardsData.length > 0) {
            const topCard = this.cardsData[0];
            if (!topCard.isCardFaceUp()) {
                topCard.flipOpen();
            }
        }
    }

    getStackPosition() {
        return this.stackPosition;
    }

    isEmpty() {
        return this.cardsData.length === 0;
    }

    getCardsCount() {
        return this.cardsData.length;
    }
}