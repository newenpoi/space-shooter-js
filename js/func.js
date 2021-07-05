function draw_rectangle(ctx, x, y, width, height, color)
{
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
	ctx.stroke();
}

function draw_arc(ctx, x, y, radius, start, end, color)
{
	ctx.beginPath();
	ctx.fillStyle= color;
	ctx.arc(x, y, radius, start, end);
	ctx.fill();
}

function draw_line(ctx, x, y, dest_x, dest_y, width, color)
{
	ctx.beginPath();
	ctx.strokeStyle  = color;
	ctx.lineWidth = width;
	ctx.moveTo(x, y);
	ctx.lineTo(dest_x, dest_y);
	ctx.stroke();
}

function draw_text(ctx, content, x, y, font, style, align)
{
	ctx.font = font;
	ctx.fillStyle = style;
	ctx.textAlign = align;
	ctx.fillText(content, x, y);
}

/*
	Gestion des sons.
*/

function play_sound(sound)
{
	sound.play();
	sound.currentTime = 0;
}

function stop_sound(sound)
{
	sound.pause();
	sound.currentTime = 0;
}

// Cette fonction gère les frames de chaque éléments graphiques.
function draw_animation(timestamp)
{
	drawers[2] = window.requestAnimationFrame(draw_animation);
	
	var frameMove = true;
	
	if (!lastFrame2)
		lastFrame2 = timestamp;
	else if (timestamp - lastFrame2 < 64)
		return;
	else
		lastFrame2 = timestamp;
	
	for (var i = 0; i < explosions.length; i++)
	{
		explosions[i].frame = (explosions[i].frame + 1);
		
		// Supprime l'explosion du tableau une fois l'animation terminée.
		if (explosions[i].frame >= 8)
			explosions.splice(i, 1);
	}
	
	for (var i = 0; i < bonuses.length; i++)
	{
		bonuses[i].frame = (bonuses[i].frame + 1) % 2;
	}
}

// Fonction d'afficahge des aliens.
function draw(timestamp)
{
	drawers[0] = window.requestAnimationFrame(draw);
	
	// Gestion du framerate.
	var frameMove = true;
	
	if (!lastFrame)
		lastFrame = timestamp;
	else if (timestamp - lastFrame < 60)
		frameMove = false;
	else
		lastFrame = timestamp;
	
	// Nettoyage du tableau hors lignes vaisseaux.
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	// On dessine tous les aliens et on les faits bouger.
	for (i = 0; i < aliens.length; i++)
	{
		ctx.drawImage(aliens[i].img, ((aliens[i].frame) * reso), 0, reso, reso, aliens[i].x, aliens[i].y, reso, reso);
		
		if (frameMove)
		{
			// Changement aléatoire de frames.
			aliens[i].frame = (aliens[i].frame + 1) % 2;

			// On peut également spécifier la vitesse en fonction du niveau.
			aliens[i].y += 1 + (level / 4);
			
			if (aliens[i].x <= 0)
			{
				aliens[i].x = 0;
			}
			
			if (aliens[i].x >= largeur - reso)
			{
				aliens[i].x = largeur - reso;
			}
			
			// Flûte, les envahisseurs passent la frontière !
			if (aliens[i].y + reso >= hauteur)
			{
				reposition();
			}
		}
	}
	
	for (var i = 0; i < explosions.length; i++)
	{
		ctx.drawImage(imgExpl, explosions[i].frame * reso, 0, reso, reso, explosions[i].x, explosions[i].y, reso, reso);
	}
	
	for (var i = 0; i < bonuses.length; i++)
	{
		ctx.drawImage(bonuses[i].image, bonuses[i].frame * reso, 0, reso, reso, bonuses[i].x, bonuses[i].y, reso, reso);
		
		bonuses[i].y += 2;
		
		if (bonuses[i].y >= hauteur)
			bonuses.splice(i, 1);
	}
}

// Fonction d'afficahge du vaisseau et des tirs.
function drawShipShoot(timestamp)
{
	drawers[1] = window.requestAnimationFrame(drawShipShoot);
	
	// Nettoyage de la ligne du vaisseau.
	ctx.clearRect(0, canvas.height, canvas.width, canvas.height);
	
	// On dessine le ship.
	ctx.drawImage(ship.img, (ship.frame) * reso, 0, reso, reso, ship.x, ship.y, reso, reso);
	
	for (i = 0; i < tirs.length; i++)
	{
		// Photons.
		if (tirs[i].ammo == 0)
		{
			draw_rectangle(ctx, tirs[i].x - 1, tirs[i].y - ship.weapon.speed, 2, 4, '#FFFFFF');
			
			tirs[i].y -= ship.weapon.speed;
			
			// Si le projectile est hors de portée ou qu'il est entré en collision.
			if (tirs[i].y <= 0 || tirs[i].collision)
			{
				tirs.splice(i, 1);
			}
		}
		else if (tirs[i].ammo == 1)
		{
			draw_rectangle(ctx, ship.x + 8, tirs[i].y, 2, hauteur, 'cyan');

			draw_arc(ctx, ship.x + 8, ship.y - 6, 4, 0, 2 * Math.PI, 'cyan');
			
			tirs[i].y -= hauteur;
			
			setTimeout(function(i) {
				tirs.splice(i, 1);
			}, 32, i);
		}
	}
}

// Affichage de l'interface utilisateur.
function draw_ui(timestamp)
{
	drawers[3] = window.requestAnimationFrame(draw_ui);
	
	// Nettoyage du tableau.
	ctx.clearRect(0, 0, largeur, 16);
	
	// Game Over.
	if (lives == 0 || running == false)
	{
		draw_rectangle(ctx, 0, 0, largeur, hauteur, 'black');
		
		window.cancelAnimationFrame(drawers[0]);
		window.cancelAnimationFrame(drawers[1]);
		window.cancelAnimationFrame(drawers[2]);
		window.cancelAnimationFrame(drawers[3]);
		window.cancelAnimationFrame(drawers[4]);
	}
	
	// Rectangle de l'UI.
	draw_rectangle(ctx, 0, 0, largeur, 32, '#18226a');
	
	// Séparation de l'UI.
	draw_line(ctx, 0, 32, largeur, 32, 1, '#FF0000');
	
	// Éléments de l'UI Gauche.
	var ligne = 'Level ' + level + ' | Ennemis sur ce Terrain [' + aliens.length + ']';
	draw_text(ctx, ligne, 8, 20, "15px Consolas", 'orange', 'left');
	
	// Éléments de l'UI Droite.
	var coeurs = '';
	
	if (lives > 0 && running)
	{
		for (var i = 0; i < lives; i++)
		{
			coeurs += ' ♥ ';
		}
	}
	else
	{
		coeurs = 'Game Over';
	}
	
	var ligne = 'Score [' + score + '] | Vies [' + coeurs + ']';
	draw_text(ctx, ligne, largeur - 8, 20, "15px Verdana", 'orange', 'right');
}

// Gestion de la logique.
function update(timestamp)
{
	drawers[4] = window.requestAnimationFrame(update);

	handle_inputs();
	handle_collision();
	
	if (!aliens.length)
	{
		trigger = true;
		level += 1;
		reset();
	}
	
	if (!lives)
	{
		$.each(bgm, function(key) {
			stop_sound(bgm[key]);
		});
	}
	
	if (!trigger) return;
	
	// Gestion des différentes actions selon les niveaux.
	
	if (level % 4 == 0)
	{
		stop_sound(bgm.intro);
		
		if (level == 4)
		{
			play_sound(bgm.action_mid);
		}
		
		if (level == 8)
		{
			stop_sound(bgm.action_mid);
			play_sound(bgm.action_mid_high);
		}
		
		if (level == 12)
		{
			stop_sound(bgm.action_mid_high);
			play_sound(bgm.action_high);
		}
		
		play_sound(sounds.palier);
	}
	
	if (level % 10 == 0)
		play_sound(sounds.great);
	
	trigger = false;
}

// Déplacement.
function handle_inputs()
{
	if (ship.direction.left)
		moveShip(-1);
	if (ship.direction.right)
		moveShip(+1);
	if (ship.firing)
		shoot();
}

// Fonction de gestion des collisions.
function handle_collision()
{
	// Pour chaque tirs...
	for (var i = 0; i < tirs.length; i++)
	{
		var tir_x = tirs[i].x;
		var tir_y = tirs[i].y;
		
		// On vérifie si l'un des vaisseaux est entré en collision.
		for (var j = 0; j < aliens.length; j++)
		{
			var alien_x = aliens[j].x;
			var alien_y = aliens[j].y;
			
			var collision = false;
			
			// Percuté par un photon.
			if (tirs[i].ammo == 0)
			{
				// Si l'alien entre en collision avec le tir.
				if (tir_x >= alien_x && tir_x <= alien_x + 16 && tir_y >= alien_y - 16 && tir_y <= alien_y + 16)
				{
					tirs[i].collision = true;
					collision = true;
				}
			}
			
			// Pulvérisé par le laser.
			if (tirs[i].ammo == 1)
			{
				if (tir_x >= alien_x && tir_x <= alien_x + 16)
				{
					collision = true;
				}
			}
			
			if (collision)
			{
				// Ajout d'une explosion avec frame 0.
				explosions.push({x: alien_x, y: alien_y, frame: 0});
				
				// Probabilité de bonus (1/6).
				if (Math.random() <= 0.4)
				{
					// Différents bonus.
					if (Math.random() <= 0.5)
						bonuses.push({image: bonusSpeed, type: 'speed', frame: 0, x: alien_x, y: alien_y});
					else
						bonuses.push({image: bonusFireRate, type: 'rate', frame: 0, x: alien_x, y: alien_y});
				}
				
				play_sound(sounds.explode);
				score += level;
				aliens.splice(j, 1);
			}
		}
	}
	
	// Pour chaque bonus sur la carte.
	for (var i = 0; i < bonuses.length; i++)
	{	
		// Si le vaisseau entre en collision avec le bonus.
		if ((bonuses[i].x >= ship.x && bonuses[i].x <= ship.x + reso) || ((bonuses[i].x + reso) >= ship.x && (bonuses[i].x + reso) <= ship.x + reso))
		{
			// Speed Rate Upgraded.
			if (bonuses[i].type == 'speed')
			{
				ship.speed = 2;
				
				setTimeout(function() {
					ship.speed = 1.5;
				}, 4096);
			}
			
			// Fire Rate Upgraded (Only for Projectiles).
			if (bonuses[i].type == 'rate')
			{
				ship.weapon.delay = 48;
				
				setTimeout(function() {
					ship.weapon.delay = 128;
				}, 4096);
			}
		}
	}
}

function reset()
{
	k = 0;
	
	// Remplissage du tableau des aliens.
	for (i = 0; i < nbLig + (Math.floor(level / 4)) ; i++)
	{
		for (j = 0; j < nbCol; j++)
		{
			new_x = (reso * 2 * j) + 8;
			new_y = (reso + reso * 2 * i);
			
			aliens[k++] = {
				img: imgAlien,
				frame: Math.round(Math.random(), 0),
				origin_x: new_x,
				origin_y: new_y,
				x: new_x,
				y: new_y
			};
		}
	}
}

// Modification des coordonnés du vaisseau.
function moveShip(sens)
{		
	if (pausing) return;
	
	// Reset Position left :
	if (ship.x + (sens * reso / 2) <= 0)
	{
		sens = 0;
	}
	
	// right
	if (ship.x + (sens * reso / 2) + reso >= largeur)
	{
		sens = 0;
	}
	
	ship.x += sens * ship.speed;
}

function reposition()
{
	lives -= 1;
	play_sound(sounds.warning);
	
	aliens.forEach(function(element) {
		element.x = element.origin_x;
		element.y = element.origin_y;
	});
}

// Effectuer un tir.
function shoot()
{
	if (pausing) return;
	if (ship.shooting) return;
	
	play_sound(sounds.shoot);
	
	ship.shooting = true;
	
	tirs.push({
		x: (ship.x + reso / 2),
		y: ship.y,
		ammo: ship.weapon.type,
		collision: false
	});
	
	if (ship.weapon.type == 0)
		shootingTimer = setTimeout(function() {ship.shooting = false;}, ship.weapon.delay);
	else
		shootingTimer = setTimeout(function() {ship.shooting = false;}, 64);
}

// Mettre le jeu en pause.
function pause()
{
	if (pausing)
	{
		// Regénération des timers qui gèrent les boucles d'affichage.
		drawers[0] = window.requestAnimationFrame(draw);
		drawers[1] = window.requestAnimationFrame(drawShipShoot);
		drawers[2] = window.requestAnimationFrame(draw_animation);
		drawers[3] = window.requestAnimationFrame(draw_ui);
		drawers[4] = window.requestAnimationFrame(update);
		pausing = false;
	}
	else
	{
		// Suppression des timers qui gèrent les boucles d'affichage.
		window.cancelAnimationFrame(drawers[0]);
		window.cancelAnimationFrame(drawers[1]);
		window.cancelAnimationFrame(drawers[2]);
		window.cancelAnimationFrame(drawers[3]);
		window.cancelAnimationFrame(drawers[4]);
		pausing = true;
	}
}