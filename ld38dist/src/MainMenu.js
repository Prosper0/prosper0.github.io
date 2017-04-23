
BasicGame.MainMenu = function (game) {

	this.background = null;
	this.music = null;
	this.playButton = null;
	this.startButton = null;
	this.helpButton = null;
	this.soundButton = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		if(this.music === null) {
			this.music = this.add.audio('titleMusic');
			this.music.loop = true;
		}

		if(this.music !== null && !this.music.isPlaying)
		{
			this.music.play();
		}

		this.background = this.add.sprite(0, 0, 'titlepage');
		this.background.x = 0;
        this.background.y = 0;
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;

		this.startButton = this.add.button(600, 450, 'startButton', this.startGame, this, 1, 0, 1);
		this.startButton.smoothed = false;
		this.startButton.scale.setTo(3, 3);
		this.startButton.angle = -10;
		//this.playButton = this.add.button(600, 400, 'playButton', this.startGame, this);

		this.helpButton = this.add.button(600, 550, 'helpButton', this.helpMenu, this, 1, 0, 1);
		this.helpButton.smoothed = false;
		this.helpButton.scale.setTo(3, 3);
		this.helpButton.angle = -10;

		this.soundButton = this.add.button(870, 630, 'soundButton', this.toggleMute, this, 1, 0, 2);
		this.soundButton.smoothed = false;
		this.soundButton.scale.setTo(3, 3);

		if (allMusicIsMuted) {
			this.soundButton.tint = 16711680;
		} else {
			this.soundButton.tint = 16777215;
		}

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	},

	helpMenu: function (pointer) {

		this.state.start('HelpMenu');

	},

	toggleMute: function() {

		if (!this.music.mute) {
			this.music.mute = true;
			this.soundButton.tint = 16711680;
		} else {
			this.music.mute = false;
			this.soundButton.tint = 16777215;
		}

		allMusicIsMuted = this.music.mute;

	}

};
