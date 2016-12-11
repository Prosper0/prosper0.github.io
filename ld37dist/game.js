
var game = new Phaser.Game(320, 480, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    
    game.input.maxPointers = 1;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // NO_SCALE
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.updateLayout(true);
    //game.scale.setScreenSize();
    game.scale.refresh();

    game.load.image('background', 'assets/misc/backgroundHudGlow.png');
    game.load.image('hud', 'assets/misc/hud.png');
    game.load.image('block', 'assets/blockgreen.png');
    game.load.image('arrow', 'assets/arrow.png');
    game.load.image('deadly', 'assets/blockdeadghost2.png');
    game.load.image('deadlyparticle', 'assets/ghostparticle.png');
    game.load.image('coin', 'assets/coin2.png');
    game.load.image('hero', 'assets/misc/hero.png');
    game.load.image('herotrail', 'assets/misc/hero.png');
    game.load.image('powerbar', 'assets/blockgreen.png');
    game.load.audio('backgroundmusic', ['assets/backgroundmusic.mp3']);
    game.load.audio('explosionsnd', 'assets/ghostxplosion.mp3');
    game.load.audio('coinsnd', 'assets/coin.mp3');

}

var ball;
var balltrail;
var bricks;
var arrow;
var levelGraphics;
var hud;
var powerbar;
var music;
var explosionsnd;
var coinsnd;

var emitter;

var hudHeight = 50;
var gamePlayWidth = 320;
var gamePlayHeigth = 480 - hudHeight;
var blockW = 16;
var spaceKey;

var levelDrawing = [
    // Wall1
    [0*blockW,  10*blockW],
    [4*blockW,  10*blockW],
    [5*blockW,  10*blockW],
    [6*blockW,  10*blockW],
    [7*blockW,  10*blockW],
    [7*blockW,  11*blockW],
    [7*blockW,  12*blockW],
    [7*blockW,  13*blockW],
    [7*blockW,  14*blockW],
    [7*blockW,  15*blockW],
    [7*blockW,  16*blockW],
    [7*blockW,  17*blockW],
    [7*blockW,  18*blockW],
    [7*blockW,  19*blockW],
    [8*blockW,  19*blockW],
    [9*blockW,  19*blockW],
    [10*blockW, 19*blockW],
    [10*blockW, 20*blockW],
    [10*blockW, 21*blockW],
    [10*blockW, 22*blockW],
    [10*blockW, 23*blockW],
    // Wall2
    [13*blockW, 4*blockW],
    [14*blockW, 4*blockW],
    [15*blockW, 4*blockW],
    [16*blockW, 4*blockW],
    [17*blockW, 4*blockW],
    [18*blockW, 4*blockW],
    [19*blockW, 4*blockW],
    [13*blockW, 5*blockW],
    [13*blockW, 9*blockW],
    [13*blockW, 10*blockW],
    [14*blockW, 10*blockW],
    [15*blockW, 10*blockW],
    [16*blockW, 10*blockW],
    [17*blockW, 10*blockW],
    [18*blockW, 10*blockW],
    [19*blockW, 10*blockW]
];

var filter;
var fragmentSrc = [
        "precision mediump float;",
        "uniform vec2      resolution;",
        "uniform float     time;",

        "void main( void )",
        "{",
            "vec2 p = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;",

            "vec3 c = vec3( 0.0 );",

            "float amplitude = 0.50;",
            "float glowT = sin(time) * 0.5 + 0.5;",
            "float glowFactor = mix( 0.15, 0.35, glowT );",

            "c += vec3(0.02, 0.03, 0.13) * ( glowFactor * abs( 1.0 / sin(p.x + sin( p.y + time ) * amplitude ) ));",
            "c += vec3(0.02, 0.10, 0.03) * ( glowFactor * abs( 1.0 / sin(p.x + cos( p.y + time+1.00 ) * amplitude+0.1 ) ));",
            "c += vec3(0.15, 0.05, 0.20) * ( glowFactor * abs( 1.0 / sin(p.y + sin( p.x + time+1.30 ) * amplitude+0.15 ) ));",
            "c += vec3(0.20, 0.05, 0.05) * ( glowFactor * abs( 1.0 / sin(p.y + cos( p.x + time+3.00 ) * amplitude+0.3 ) ));",
            "c += vec3(0.17, 0.17, 0.05) * ( glowFactor * abs( 1.0 / sin(p.y + cos( p.x + time+5.00 ) * amplitude+0.2 ) ));",

            "gl_FragColor = vec4( c, 1.0 );",
        "}"
    ];

var deadlyGroup;

var deadlyArrayKeepTrack = [];
var wallArrayKeepTrack = [];
var coinArrayKeepTrack = [];

var lives               = 3;
var score               = 0;
var rotateSpeed         = 3; // arrow rotation speed
var rotateDirection     = 1; // rotate direction: 1-clockwise, 2-counterclockwise
var velocityFriction    = 0.99;
var degToRad            = 0.0174532925;
var power               = 0;
var minPower            = 50;
var maxPower            = 400;
var charging            = false;
var numCoins            = 5;
var onLevel             = 0;
var highscore           = 0;

var scoreText;
var livesText;
var introText;
var highScoreText;

var s;

function create() {
    
    deadlyArrayKeepTrack = [];
    wallArrayKeepTrack = [];
    coinArrayKeepTrack = [];

    game.physics.startSystem(Phaser.Physics.ARCADE);

    s = game.add.tileSprite(0, 0, 320, 480, 'background');
    
    filter = new Phaser.Filter(game, null, fragmentSrc);
    filter.setResolution(320, 480);
    
    music = game.add.audio('backgroundmusic');
    music.volume = 0.4;
    music.play('', 0, 1, true);
    music.onLoop.add(playLevelMusic, this);
    
    explosionsnd = game.add.audio('explosionsnd');
    coinsnd = game.add.audio('coinsnd');
    
    //game.sound.setDecodedCallback([ music, explosionsnd, coinsnd ], start, this);
    
    drawLevel();
    drawCoins();

    ball = game.add.sprite(game.world.centerX,game.world.centerY, 'hero');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    
    //  Add an emitter for the ship's trail
    balltrail = game.add.emitter(ball.x, ball.y, 1300);
    balltrail.gravity = 0;
    balltrail.maxParticleSpeed = 0;
    balltrail.minRotation = 0;
    balltrail.maxRotation = 0;
	//emitter.autoScale = false;
    balltrail.setAlpha(0.5, 0, 3000);
	balltrail.setScale(1,0,1,0,3500,Phaser.Easing.Linear.None);
    balltrail.makeParticles('herotrail');
    balltrail.start(false,3000,0);
    balltrail.on = true;

    drawDeadly();
    
    // the rotating arrow, look at its x registration point
    arrow = game.add.sprite(game.world.centerX,game.world.centerY,"arrow");
    arrow.anchor.x = -1;
    arrow.anchor.y = 0.5;
    
    hud = game.add.sprite(game.world.centerX,480, 'hud');
    hud.anchor.set(0.5);
    hud.checkWorldBounds = true;

    game.physics.enable(hud, Phaser.Physics.ARCADE);

    hud.body.collideWorldBounds = true;
    hud.body.bounce.set(1);
    hud.body.immovable = true;
    
    powerbar = game.add.sprite(155, 444, 'powerbar');
    powerbar.anchor.setTo(0.0, 0.5);
    powerbar.scale.setTo(1, 0.5);
    setPowerbar(0);
    
    var myhigh = getHighscoreFromCookie();
    scoreText = game.add.text(5, 435, 'score: 0', { font: "16px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(5, 455, 'lives: 3', { font: "16px Arial", fill: "#ffffff", align: "left" });
    highScoreText = game.add.text(155, 455, 'Highscore: ' + myhigh, { font: "16px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 240, 'click or spacebar to start and fire ball. take yellow circle watch out for red ghosts', { font: "40px Arial", fill: "#ffff88", align: "center" });
    introText.anchor.setTo(0.5, 0.5);
    introText.wordWrap = true;
    introText.wordWrapWidth = gamePlayWidth - 50;

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
    spaceKey.onDown.add(releaseBall, this);
    game.input.onDown.add(releaseBall, this);
}

function update () {
    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        game.physics.arcade.collide(ball, hud, ballHitHud, null, this);
        game.physics.arcade.collide(ball, levelGraphics, ballHitKnocker, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
        game.physics.arcade.collide(ball, deadlyGroup, ballHitDeadly, null, this);
        game.physics.arcade.collide(levelGraphics, emitter, null, null, this);

        if(charging) {
            power = power + 10;
            power = Math.min(power, maxPower);
            // then game text is updated
        } else {
            arrow.angle+=rotateSpeed*rotateDirection;
        }
        
        setPowerbar(power);
        scoreText.text = 'score: ' + score;

        // update arrow position
        arrow.x=ball.x;
        arrow.y=ball.y;
        
        balltrail.x = ball.x;
        balltrail.y = ball.y;
        
        filter.update();

        deaccelareta();
    }
}

function releaseBall () {
    power = minPower;
    game.input.onDown.remove(releaseBall, this);
    spaceKey.onDown.remove(releaseBall, this);
    game.input.onUp.add(fire, this);  
    spaceKey.onUp.add(fire, this);
    charging = true;
    introText.visible = false;
}

function fire() {
    game.input.onUp.remove(fire, this); 
    game.input.onDown.add(releaseBall, this);
    spaceKey.onUp.remove(fire, this);
    spaceKey.onDown.add(releaseBall, this);
    
    ball.body.velocity.y += Math.sin(arrow.angle*degToRad)*power/2;
    ball.body.velocity.x += Math.cos(arrow.angle*degToRad)*power/2;
    
    power = 0;
    charging=false;

    rotateDirection*=-1;
}

function deaccelareta() {
        ball.body.velocity.y*=velocityFriction;
        ball.body.velocity.x*=velocityFriction;
}

function playLevelMusic() {
    music.play('', 0, 1, true);
}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    introText.text = 'Game Over! Click to restart.';
    introText.wordWrap = true;
    introText.wordWrapWidth = gamePlayWidth - 50;
    introText.visible = true;
    
    if(score > getHighscoreFromCookie()) {
        setHighscoreToCookie(score);
        highscore = score;
        highScoreText.text = 'Highscore: ' + highscore;
    }
    
    game.input.onDown.add(reloadGame, this);
    spaceKey.onDown.add(reloadGame, this);

}

function ballHitBrick (_ball, _brick) {

    /*var s = game.add.tween(_brick.scale);
    var s2 = game.add.tween(_brick).to( { alpha: 0 }, 500, "Linear", true);
    s.to({x: 20, y:20}, 500, Phaser.Easing.Linear.None);
    s.onComplete.addOnce(function(){checkLiving(_brick);}, this);
    s.start();
    s2.start();*/

    score += 10;
    coinsnd.play();

    scoreText.text = 'score: ' + score;
    
    _brick.kill();

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = 'score: ' + score;
        onLevel += 1;

        //  Let's move the ball
        ball.body.velocity.set(0);
        ball.x = 100 + 16;
        ball.y = 100 - 16;
        
        music.volume = 1;
        
        levelGraphics.forEach(function(item){
            item.filters = [ filter ];
        });

        game.input.onDown.add(revive, this);
        spaceKey.onDown.add(revive, this);
    }

}

function ballHitKnocker (_ball, _knocker) {

}

function ballHitHud(_ball, _hud) {
    
}

function ballHitDeadly(_ball, _deadly) {
    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('deadlyparticle', 0, 250, true, true);
    emitter.gravity = 200;
    emitter.bounce.setTo(0.5, 0.5);
    
    explosionsnd.play();
    
    particleBurst(_deadly.x, _deadly.y);
    _deadly.kill();
    lives = lives - 1;
    livesText.text = 'lives: ' + lives;
    spawnNewDeadly();
}

function particleBurst(pointerx, pointery) {

    emitter.x = pointerx;
    emitter.y = pointery;

    emitter.start(true, 4000, null, 10);

    game.time.events.add(2000, destroyEmitter, this);

}

function destroyEmitter() {

    //emitter.destroy();

}

function spawnNewDeadly() {
    var deadly;
    do {
        //var rndX = Math.random()*gamePlayWidth + 16;
        //var rndY = Math.random()*gamePlayHeigth - 32;
        var rndX = game.rnd.integerInRange(32, gamePlayWidth-33);
        var rndY = game.rnd.integerInRange(32, gamePlayHeigth-33);
        deadly = deadlyGroup.create(rndX, rndY, 'deadly');
        var isoverlapping = isOverlapping(deadly, wallArrayKeepTrack);
        var isoverlapping2 = isOverlapping(deadly, deadlyArrayKeepTrack);
        var isoverlapping3 = isOverlapping(deadly, coinArrayKeepTrack);
        var isoverlapping4 = isOverlappingObj(deadly, ball);
        
        if(isoverlapping || isoverlapping2 || isoverlapping3 || isoverlapping4)
            deadly.kill();
    } while (isoverlapping || isoverlapping2 || isoverlapping3 || isoverlapping4);
        
    deadlyArrayKeepTrack.push(deadly);

    deadly.body.bounce.set(0);
    deadly.body.immovable = true;
}

function drawLevel() {
    levelGraphics = game.add.group();
    levelGraphics.enableBody = true;
    levelGraphics.physicsBodyType = Phaser.Physics.ARCADE;

    for(i = 0; i < levelDrawing.length; i++) {
        createLevelGraphics(levelDrawing[i][0],levelDrawing[i][1]);
    }
}

function drawCoins() {
    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var coin;

    for (var x = 0; x < numCoins; x++)
    {
        do {
            var rndX = game.rnd.integerInRange(32, gamePlayWidth-32);
            var rndY = game.rnd.integerInRange(32, gamePlayHeigth-32);
            coin = bricks.create(rndX, rndY, 'coin');
            coin.anchor.setTo(0.5, 0.5);
            var isoverlapping = isOverlapping(coin, wallArrayKeepTrack);
            var isoverlapping3 = isOverlapping(coin, coinArrayKeepTrack);
            var isoverlapping4 = isOverlappingObj(coin, ball);
            if(isoverlapping || isoverlapping3 || isoverlapping4)
                coin.kill();
        } while (isoverlapping || isoverlapping3 || isoverlapping4);

        coinArrayKeepTrack.push(coin);

        coin.body.bounce.set(1);
        coin.body.immovable = true;
    }
}

function drawDeadly() {
    deadlyGroup = game.add.group();
    deadlyGroup.enableBody = true;
    deadlyGroup.physicsBodyType = Phaser.Physics.ARCADE;
    //var deadly;
    
    for(ii = 0; ii < 4; ii++) {
        spawnNewDeadly();
    }
}

function setPowerbar(_val) {
    var widthToUse = _val / maxPower;
    game.add.tween(powerbar).to( { width: widthToUse * 100 }, 100, Phaser.Easing.Linear.None, true);
}

function createLevelGraphics(_x, _y) {
    var knocker;
    knocker = levelGraphics.create(_x,_y, 'block');
    
    wallArrayKeepTrack.push(knocker);
    
    knocker.body.bounce.set(1);
    knocker.body.immovable = true;
    knocker.scale.setTo(0.5, 0.5);
}

function isOverlapping(_sprite, _list) {
    var isAnyOverlapping = false;
    
    for(i = 0; i < _list.length; i++) {
        if(!isAnyOverlapping) {
            isAnyOverlapping = game.physics.arcade.overlap(_sprite, _list[i]);
            //isAnyOverlapping = _sprite.overlap(_list[i]);
            
            if(isAnyOverlapping)
                break;
        }
    }
    
    return isAnyOverlapping;
}

function isOverlappingObj(_spriteA, _spriteB) {
    var isAnyOverlapping = false;
    isAnyOverlapping = game.physics.arcade.overlap(_spriteA, _spriteB);
    return isAnyOverlapping;
}

function revive() {
    rotateSpeed = rotateSpeed + 1;
    velocityFriction = velocityFriction * 1.001;
    levelGraphics.forEach(function(item){
            item.filters = null;
        });
    game.input.onDown.remove(revive, this);
    spaceKey.onDown.remove(revive, this);
    
    music.volume = 0.4;
    
    deadlyArrayKeepTrack = [];
    coinArrayKeepTrack = [];
    
    deadlyGroup.removeAll(true);
    bricks.removeAll(true);
    
    drawCoins();
    drawDeadly();
}

function reloadGame() {
    location.reload();
}

function getHighscoreFromCookie() {
    return getCookie('ld37hs');
}

function setHighscoreToCookie(_hval) {
    setCookie('ld37hs', _hval, 30);
}

function getCookie(c_name)
{
    if (document.cookie.length>0)
      {
      c_start=document.cookie.indexOf(c_name + "=");
      if (c_start!=-1)
        { 
        c_start=c_start + c_name.length+1 ;
        c_end=document.cookie.indexOf(";",c_start);
        if (c_end==-1) c_end=document.cookie.length
        return unescape(document.cookie.substring(c_start,c_end));
        } 
      }
    return "0";
}


function setCookie(c_name, value, expiredays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name+ "=" +escape(value) + ((expiredays==null) ? "" : "; expires=" + exdate.toUTCString());
}

