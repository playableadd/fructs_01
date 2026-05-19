import Utils from "../core/framework/Utils";
import Button from "./Button";

export default class WinLoseScreen extends Phaser.GameObjects.Container {
    constructor({ scene, container }) {
        super(scene, 0, 0);
        this.isShown = false;
        this.create(container);
    }

    create(container) {
        this.overlay = this.scene.add.graphics();
        this.overlay.fillStyle(0x000000, 0.7);
        this.overlay.fillRect(-1000, -1000, 2000, 2000);
        this.overlay.setDepth(50);
        this.add(this.overlay);
        this.overlay.setAlpha(0);

        this.messageText = this.scene.add.text(0, -50, "", {
            fontFamily: 'Varela',
            fontSize: 72,
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setDepth(51).setOrigin(0.5, 0.5);
        this.add(this.messageText);
        this.messageText.setAlpha(0);

        this.ctaButton = new Button({
            scene: this.scene,
            texture: "btnFin",
            px: 0, py: 80,
            lx: 0, ly: 60,
            pScaleX: 0.6, pScaleY: 0.6,
            lScaleX: 0.6, lScaleY: 0.6,
            align: "Center",
            container: this,
            callback: () => this.onCtaClick()
        });
        this.ctaButton.setAlpha(0);

        this.addProperties(["pos", "scale"]);
        this.px = 0;
        this.py = 0;
        this.lx = 0;
        this.ly = 0;
        this.pScaleX = 1;
        this.pScaleY = 1;
        this.lScaleX = 1;
        this.lScaleY = 1;

        this.setCustomPosition(0, 0).setAlign("Center");
        container.add(this);
    }

    showWin() {
        this.isShown = true;
        this.messageText.setText("You Win!");
        
        Utils.addAudio(this.scene, 'win', 0.5);
        
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 300
        });
        
        this.scene.tweens.add({
            targets: this.messageText,
            alpha: 1,
            duration: 300,
            delay: 200
        });
        
        this.scene.tweens.add({
            targets: this.ctaButton,
            alpha: 1,
            duration: 300,
            delay: 400,
            onComplete: () => {
                this.ctaButton.animate({
                    pScaleX: "+0.05",
                    pScaleY: "+0.05",
                    lScaleX: "+0.05",
                    lScaleY: "+0.05",
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
    }

    showLose() {
        this.isShown = true;
        this.messageText.setText("Game Over");
        
        Utils.addAudio(this.scene, 'fail', 0.5);
        
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 300
        });
        
        this.scene.tweens.add({
            targets: this.messageText,
            alpha: 1,
            duration: 300,
            delay: 200
        });
        
        this.scene.tweens.add({
            targets: this.ctaButton,
            alpha: 1,
            duration: 300,
            delay: 400
        });
    }

    onCtaClick() {
        window.App.network.ctaClick();
    }

    isActive() {
        return this.isShown;
    }
}