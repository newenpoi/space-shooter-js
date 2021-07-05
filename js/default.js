/*
	Newen
	2020-2021
*/

var running = true;
var music = true;

var plateau = $("#plateau");
var largeur = plateau.width();
var hauteur = plateau.height();	

var reso = 16;
var lastFrame = null; // Aliens.
var lastFrame2 = null; // Explosions et Bonus.
var pausing	= false;
var trigger	= false;

// Map.
var nbCol = largeur / (reso * 2);
var nbLig = 2;

// Assets.
var canvas = document.getElementById("plateau");
var ctx = canvas.getContext("2d");
var imgAlien = document.getElementById("imgAlien");
var imgShip	= document.getElementById("imgShip");
var imgExpl	= document.getElementById("imgExpl");
var bonusSpeed = document.getElementById("bonus1");
var bonusFireRate = document.getElementById("bonus2");

var ship = {
	img: imgShip,
	frame: 0,
	x: largeur / 2,
	y: (hauteur - reso) - 8,
	speed: 1.5,
	direction: {left: false, right: false},
	weapon: {type: 0, speed: 4, delay: 128},
	firing: false,
	shooting: false
}

// Precaching.
var sounds = {
	shoot: new Audio('snd/shoot.wav'),
	explode: new Audio('snd/explode.wav'),
	warning: new Audio('cue/alert.ogg'),
	palier: new Audio('cue/palier.ogg'),
	great: new Audio('cue/excellent.ogg')
};

var bgm = {
	intro: new Audio('bgm/intro.ogg'),
	action_mid: new Audio('bgm/action_mid.ogg'),
	action_mid_high: new Audio('bgm/action_mid_high.ogg'),
	action_high: new Audio('bgm/action_high.ogg')
};

// Volume.
$.each(sounds, function(key) {
	sounds[key].volume = 0.2;
});

$.each(bgm, function(key) {
	bgm[key].volume = 0.2;
});

$.each(bgm, function(key) {
	bgm[key].addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
});

var tirs = new Array();
// Zones de Dessins.
var drawers = new Array();
var aliens = new Array();
var explosions = new Array();
var bonuses = new Array();

var level = 1;
var lives = 3;
var score = 0;

function init()
{
	// Replacer les mobs.
	reset();
	
	// Lancement des fonctions de dessin.
	draw();
	drawShipShoot();
	draw_animation();
	draw_ui();
	
	// Gestion de la logique.
	update();
	
	// On bind les touches pour gérer les mouvements.
	$(window).unbind("keydown");
	$(window).unbind("keyup");
	
	$(window).keydown(function(event) {
		switch (event.which)
		{
			case 81:
				// Q
				ship.direction.left = true;
			break;
			case 68:
				// D
				ship.direction.right = true;
			break;
			case 32:
				// Espace
				ship.firing = true;
			break;
			case 80:
				// P
				pause();
			break;
			case 87:
				// W
				ship.weapon.type = (ship.weapon.type ? 0 : 1);
			break;
		}
	});
	
	$(window).keyup(function(event) {
		switch (event.which)
		{
			case 81:
				// Q
				ship.direction.left = false;
			break;
			case 68:
				// D
				ship.direction.right = false;
			break;
			case 32:
				// Espace
				ship.firing = false;
			break;
		}
	});
}

// Quand le dom est prêt on Initialise le tout.
$(document).ready(function() {
	init();
	
	// La musique démarrera avec la touche espace.
	$('#start').click(function() {
		$(this).prop('disabled', true);
		bgm.intro.play();
	});
});