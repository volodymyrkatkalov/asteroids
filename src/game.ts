import Phaser from 'phaser';

class Player {
    sprite: Phaser.GameObjects.Triangle;
    body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene) {
        console.log('Creating player');
        this.sprite = scene.add.triangle(400, 300, 15, 0, -10, 12, -10, -12)
            .setStrokeStyle(2, 0xffffff, 1)
            .setFillStyle(0, 0)
            .setOrigin(0, 0);
        
        scene.physics.add.existing(this.sprite);
        this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
        this.body.setSize(25, 25)
            .setOffset(-12.5, -12.5)
            .setMaxVelocity(300)
            .setCollideWorldBounds(true)
            .setDrag(100);
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.body.angularVelocity = 0;
        this.body.setAcceleration(0);

        if (cursors.left.isDown) this.body.angularVelocity = -200;
        else if (cursors.right.isDown) this.body.angularVelocity = 200;

        if (cursors.up.isDown) {
            this.sprite.scene.physics.velocityFromRotation(
                this.sprite.rotation,
                300,
                this.body.acceleration
            );
        }
    }
}

class Bullets {
    group: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene) {
        console.log('Creating bullets group');
        this.group = scene.physics.add.group({ maxSize: 20 });
    }

    fire(player: Player, scene: Phaser.Scene, isMultiShot: boolean = false) {
        console.log('Firing bullet');
        if (isMultiShot) {
            [-0.2, 0, 0.2].forEach(offset => {
                this.createBullet(player, scene, offset);
            });
        } else {
            this.createBullet(player, scene, 0);
        }
    }

    private createBullet(player: Player, scene: Phaser.Scene, angleOffset: number) {
        const bullet = scene.add.rectangle(0, 0, 4, 8, 0xffffff)
            .setStrokeStyle(1, 0xffffff, 1);
        
        scene.physics.add.existing(bullet);
        this.group.add(bullet);

        const angle = player.sprite.rotation + angleOffset;
        const noseOffsetX = 13;
        const noseOffsetY = 1;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const noseX = player.sprite.x + (noseOffsetX * cosAngle - noseOffsetY * sinAngle);
        const noseY = player.sprite.y + (noseOffsetX * sinAngle + noseOffsetY * cosAngle);
        
        bullet.setPosition(noseX, noseY);
        const body = bullet.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
        scene.physics.velocityFromRotation(angle, 400, body.velocity);
        body.setCollideWorldBounds(false);

        scene.time.delayedCall(2000, () => bullet.destroy());
    }
}

class PowerUps {
    group: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene) {
        this.group = scene.physics.add.group();
    }

    spawn(scene: Phaser.Scene, x: number, y: number) {
        const type = Phaser.Math.Between(0, 1) === 0 ? 'multi' : 'nuke';
        const powerUp = scene.add.circle(x, y, 10, type === 'multi' ? 0x00ff00 : 0xff0000)
            .setStrokeStyle(1, 0xffffff);
        
        scene.physics.add.existing(powerUp);
        this.group.add(powerUp);
        
        const body = powerUp.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(
            Phaser.Math.Between(-50, 50),
            Phaser.Math.Between(-50, 50)
        );
        body.setCollideWorldBounds(true);
        body.setBounce(1, 1);

        powerUp.setData('type', type);
        scene.time.delayedCall(10000, () => powerUp.destroy());
    }
}

export class Asteroids {
    public group: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene) {
        console.log('Initializing asteroids');
        this.group = scene.physics.add.group({
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });
    }

    spawn(scene: Phaser.Scene, count: number, difficultyMultiplier: number) {
        console.log('Spawning', count, 'asteroids');
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(0, 800);
            let y = Phaser.Math.Between(0, 600);

            if (Math.abs(x - 400) < 100 && Math.abs(y - 300) < 100) {
                x += 200;
                y += 200;
            }

            const points = this.generatePoints();
            const asteroid = scene.add.polygon(x, y, points)
                .setStrokeStyle(2, 0xffffff, 1)
                .setFillStyle(0, 0);

            scene.physics.add.existing(asteroid);
            this.group.add(asteroid, true);

            const body = asteroid.body as Phaser.Physics.Arcade.Body;
            const radius = Phaser.Math.Between(20, 40);
            body.setSize(radius * 0.8, radius * 0.8);
            body.setOffset(-radius * 0.4, -radius * 0.4);

            const baseSpeed = 100;
            const speed = baseSpeed * difficultyMultiplier;
            body.setVelocity(
                Phaser.Math.Between(-speed, speed),
                Phaser.Math.Between(-speed, speed)
            );
        }
    }

    private generatePoints(): { x: number; y: number }[] {
        const sides = Phaser.Math.Between(8, 12);
        const radius = Phaser.Math.Between(20, 40);
        return Array.from({ length: sides }, (_, i) => {
            const angle = (i / sides) * Math.PI * 2;
            const r = radius * Phaser.Math.FloatBetween(0.7, 1.0);
            return {
                x: Math.cos(angle) * r,
                y: Math.sin(angle) * r
            };
        });
    }
}

class MainScene extends Phaser.Scene {
    player!: Player;
    bullets!: Bullets;
    asteroids!: Asteroids;
    powerUps!: PowerUps;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    spaceKey!: Phaser.Input.Keyboard.Key;
    rKey!: Phaser.Input.Keyboard.Key;
    nukeKey!: Phaser.Input.Keyboard.Key;
    scoreText!: Phaser.GameObjects.Text;
    livesText!: Phaser.GameObjects.Text;
    powerUpText!: Phaser.GameObjects.Text;
    score: number = 0;
    lives: number = 3;
    bulletTime: number = 0;
    isGameOver: boolean = false;
    multiShotActive: boolean = false;
    multiShotTimer: number = 0;
    hasNuke: boolean = false;
    difficultyMultiplier: number = 1;
    lastLifeScore: number = 0; // Track last score milestone for life gain

    constructor() {
        super('MainScene');
    }

    create() {
        console.log('Scene create started');
        this.player = new Player(this);
        this.bullets = new Bullets(this);
        this.asteroids = new Asteroids(this);
        this.powerUps = new PowerUps(this);
        this.asteroids.spawn(this, 5, this.difficultyMultiplier);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.nukeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.N);

        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(2);

        this.livesText = this.add.text(10, 30, 'Lives: 3', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(2);

        this.powerUpText = this.add.text(10, 50, 'Power: None', {
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(2);

        this.physics.add.collider(
            this.bullets.group,
            this.asteroids.group,
            (bullet: Phaser.GameObjects.GameObject, asteroid: Phaser.GameObjects.GameObject) => {
                console.log('Bullet hit asteroid');
                bullet.destroy();
                asteroid.destroy();
                this.score += 10;
                this.checkLifeGain();
                this.updateDifficulty();
                this.asteroids.spawn(this, 1, this.difficultyMultiplier);
                if (Phaser.Math.Between(0, 100) < 20) {
                    this.powerUps.spawn(this, asteroid.x, asteroid.y);
                }
            }
        );

        this.physics.add.collider(
            this.player.sprite,
            this.asteroids.group,
            () => {
                console.log('Player hit asteroid');
                this.lives--;
                this.livesText.setText(`Lives: ${this.lives}`);
                this.player.sprite.setStrokeStyle(2, 0xff0000, 1);
                this.time.delayedCall(1000, () => {
                    if (this.lives > 0) {
                        this.player.sprite.setStrokeStyle(2, 0xffffff, 1);
                        this.player.sprite.setPosition(400, 300);
                        this.player.body.setVelocity(0, 0);
                    }
                });

                if (this.lives <= 0) {
                    this.isGameOver = true;
                    this.physics.pause();
                    this.add.text(400, 300, 'GAME OVER', {
                        fontSize: '40px',
                        color: '#ffffff'
                    }).setOrigin(0.5).setDepth(2);
                }
            }
        );

        this.physics.add.collider(
            this.player.sprite,
            this.powerUps.group,
            (player: Phaser.GameObjects.GameObject, powerUp: Phaser.GameObjects.GameObject) => {
                const type = powerUp.getData('type') as string;
                powerUp.destroy();
                
                if (type === 'multi') {
                    this.multiShotActive = true;
                    this.multiShotTimer = this.time.now + 10000;
                    this.powerUpText.setText('Power: Multi-Shot');
                } else if (type === 'nuke') {
                    this.hasNuke = true;
                    this.powerUpText.setText('Power: Nuke Ready (Press N)');
                }
            }
        );

        console.log('Scene create finished');
    }

    updateDifficulty() {
        this.difficultyMultiplier = Math.min(1 + Math.floor(this.score / 100) * 0.2, 3);
    }

    checkLifeGain() {
        const currentMilestone = Math.floor(this.score / 1000);
        if (currentMilestone > Math.floor(this.lastLifeScore / 1000)) {
            this.lives++;
            this.livesText.setText(`Lives: ${this.lives}`);
            this.lastLifeScore = this.score;
            // Show a brief notification
            const bonusText = this.add.text(400, 350, '+1 Life!', {
                fontSize: '32px',
                color: '#00ff00'
            }).setOrigin(0.5).setDepth(2);
            this.time.delayedCall(2000, () => bonusText.destroy());
        }
    }

    update(time: number) {
        if (!this.isGameOver) {
            this.player.update(this.cursors);

            if (this.spaceKey.isDown && time > this.bulletTime) {
                console.log('Space pressed');
                this.bullets.fire(this.player, this, this.multiShotActive);
                this.bulletTime = time + 200;
            }

            if (this.nukeKey.isDown && this.hasNuke) {
                console.log('Nuke activated');
                this.asteroids.group.clear(true, true);
                this.hasNuke = false;
                this.powerUpText.setText('Power: None');
                this.score += 50;
                const spawnCount = Math.min(3 + Math.floor(this.score / 200), 8);
                this.asteroids.spawn(this, spawnCount, this.difficultyMultiplier);
                this.checkLifeGain(); // Check if nuke points grant a life
            }

            if (this.multiShotActive && time > this.multiShotTimer) {
                this.multiShotActive = false;
                this.powerUpText.setText('Power: None');
            }

            this.physics.world.wrap(this.player.sprite, 32);
            this.physics.world.wrap(this.bullets.group, 16);
            this.physics.world.wrap(this.asteroids.group, 64);
        }

        if (this.rKey.isDown) {
            console.log('Restarting');
            this.scene.restart();
            this.score = 0;
            this.lives = 3;
            this.isGameOver = false;
            this.multiShotActive = false;
            this.hasNuke = false;
            this.difficultyMultiplier = 1;
            this.lastLifeScore = 0;
        }

        this.scoreText.setText(`Score: ${this.score}`);
        this.livesText.setText(`Lives: ${this.lives}`);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: MainScene
};

new Phaser.Game(config);