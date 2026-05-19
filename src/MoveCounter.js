import Utils from "../core/framework/Utils";

export default class MoveCounter extends Phaser.GameObjects.Container {
    constructor({ scene, container }) {
        super(scene, 0, 0);
        this.moveCount = 161;
        this.create(container);
    }

    create(container) {
        this.background = this.scene.add.image(0, 0, "moves_bg").setDepth(5).setOrigin(0.5, 0.5);
        this.add(this.background);

        this.label = this.scene.add.text(0, 5, `Moves: ${this.moveCount}`, {
            fontFamily: 'Varela',
            fontSize: 36,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(6).setOrigin(0.5, 0.5);

        this.add(this.label);
        this.addProperties(["pos", "scale"]);
        this.px = 0;
        this.py = -280;
        this.lx = 0;
        this.ly = -200;
        this.pScaleX = 0.8;
        this.pScaleY = 0.8;
        this.lScaleX = 0.6;
        this.lScaleY = 0.6;

        this.setCustomPosition(0, 0).setAlign("Top");
        container.add(this);
    }

    setMoves(count) {
        this.moveCount = count;
        this.label.setText(`Moves: ${this.moveCount}`);
    }

    decreaseMoves() {
        this.moveCount--;
        this.label.setText(`Moves: ${this.moveCount}`);
        return this.moveCount;
    }

    getMoves() {
        return this.moveCount;
    }
}