
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');
		this.background.x = 0;
        this.background.y = 0;
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;

		this.preloadBar = this.add.sprite(400, 630, 'preloaderBar');
		this.preloadBar.scale.setTo(3, 3);

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		this.load.image('titlepage', 'assets/image/menu-screen.png');
		this.load.image('playButton', 'assets/image/play_button.png');
		this.load.spritesheet('startButton', 'assets/image/start.png', 75, 26);
		this.load.spritesheet('helpButton', 'assets/image/help.png', 62, 29);
		this.load.spritesheet('backButton', 'assets/image/back.png', 39, 9);
		this.load.spritesheet('soundButton', 'assets/image/audio.png', 26, 26);
		this.load.image('helppage', 'assets/image/help-screen.png');
		//this.load.image('startButtonInactive', 'assets/image/start-inactive.png');
		//this.load.image('startButtonActive', 'assets/image/start-active.png');
		//this.load.atlas('playButton', 'assets/image/play_button.png', 'assets/images/play_button.json');
		this.load.audio('titleMusic', ['assets/audio/Attack-of-the-Planetary-Vampires.mp3']);
		this.load.audio('gameMusic', ['assets/audio/Planetary-Invation-Initiated.mp3']);
		this.game.load.audio('alien01snd', 'assets/audio/alien01.wav');
		this.game.load.audio('explosion01snd', 'assets/audio/explosion01.wav');
		this.game.load.audio('explosion02snd', 'assets/audio/explosion02.wav');
		this.game.load.audio('hit01snd', 'assets/audio/hit01.wav');
		this.game.load.audio('shoot01snd', 'assets/audio/shoot01.wav');
		this.game.load.audio('gameOver1snd', 'assets/audio/gameover-man.wav');
		//this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//this.load.image('gameBackground', 'assets/image/background01.png');
		this.load.image('gameBackgroundSky', 'assets/image/background-sky.png');
		this.load.image('gameBackgroundGround', 'assets/image/background-ground.png');
		this.load.image('gameBackgroundGameOver', 'assets/image/gameover-screen.png');
		this.load.image('gameMistOfWarBack', 'assets/image/back-mist.png');
		this.load.image('gameMistOfWarFront', 'assets/image/front-mist.png');

		this.load.image('heroWeaponCannon', 'assets/image/cannon-tower.png');
		this.load.spritesheet('heroWeaponCannonAnim', "assets/image/cannon-fire.png", 32, 128);
		this.load.image('bullet', 'assets/image/bullet.png');

		this.load.image('enemy1', 'assets/image/enemy01.png');
        this.load.spritesheet('enemySkull', 'assets/image/screming-skull.png', 32, 32);
		this.load.spritesheet('enemyUfo', "assets/image/flying-saucer.png", 64, 64);
		this.load.image('deadlyparticle', 'assets/image/ghostparticle.png');

		this.load.image('heroHud', 'assets/image/hud.png');
		this.load.spritesheet('heroHudHealth', "assets/image/health-bar.png", 64, 9, 7);
		this.load.image('heroHudMoab', 'assets/image/bomb.png');
		this.load.spritesheet('heroHudNumbers', "assets/image/score-numbers.png", 4, 8);

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.

		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.

		if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
