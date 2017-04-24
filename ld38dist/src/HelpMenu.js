BasicGame.HelpMenu = function (game) {

	this.background = null;
    this.helpText = null;
    this.backMist = null;
    this.frontMist = null;
	this.backButton = null;

};

BasicGame.HelpMenu.prototype = {

	create: function () {


		this.background = this.add.sprite(0, 0, 'cleanBackground');
		this.background.x = 0;
        this.background.y = 0;
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;

        this.backMist = this.add.sprite(170 * 3, 465 * 3, 'gameMistOfWarBack');
        this.backMist.smoothed = false;
        this.frontMist = this.add.sprite(170 * 3, 465 * 3, 'gameMistOfWarFront');
        this.frontMist.smoothed = false;
        this.backMist.anchor.setTo(0.5, 0.5);
        this.frontMist.anchor.setTo(0.5, 0.5);
        this.backMist.scale.setTo(3, 3);
        this.frontMist.scale.setTo(3, 3);

        this.helpText = this.add.sprite(15, 21, 'helpText');
        this.helpText.scale.setTo(3, 3);
        this.helpText.smoothed = false;

		this.backButton = this.add.button(10, 673, 'backButton', this.toMainMenu, this, 1, 0, 1);
		this.backButton.smoothed = false;
		this.backButton.scale.setTo(3, 3);

	},

	update: function () {

		//	Do some nice funky main menu effect here
        this.frontMist.angle += 0.05;
        this.backMist.angle += 0.02;
	},

	toMainMenu: function (pointer) {

		this.state.start('MainMenu');

	}

};
