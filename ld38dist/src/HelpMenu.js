BasicGame.HelpMenu = function (game) {

	this.background = null;
	this.backButton = null;

};

BasicGame.HelpMenu.prototype = {

	create: function () {


		this.background = this.add.sprite(0, 0, 'helppage');
		this.background.x = 0;
        this.background.y = 0;
        this.background.height = this.game.height;
        this.background.width = this.game.width;
        this.background.smoothed = false;

		this.backButton = this.add.button(10, 673, 'backButton', this.toMainMenu, this, 1, 0, 1);
		this.backButton.smoothed = false;
		this.backButton.scale.setTo(3, 3);

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	toMainMenu: function (pointer) {

		this.state.start('MainMenu');

	}

};
