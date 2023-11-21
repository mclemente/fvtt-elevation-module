Hooks.once("i18nInit", () => {
	game.settings.register("elevation-module", "fontSize", {
		name: `DRAWING.FontSize`,
		hint: "ELEVATION_MODULE.fontSize.hint",
		scope: "world",
		config: true,
		default: 24,
		type: Number,
		onChange: (n) => {
			canvas.tokens?.placeables.forEach((token) => {
				if (canvas.dimensions.size >= 200) n *= 7 / 6;
				else if (canvas.dimensions.size < 50) n *= 5 / 6;
				token.tooltip.style.fontSize = n;
			});
		},
	});

	game.settings.register("elevation-module", "hover", {
		name: "ELEVATION_MODULE.hover.name",
		hint: "ELEVATION_MODULE.hover.hint",
		scope: "world",
		config: true,
		default: 0.25,
		type: Number,
		choices: {
			1: "1",
			0.75: "0.75",
			0.5: "0.50",
			0.25: "0.25",
			0: "0",
		},
		onChange: (v) => {
			canvas.tokens?.placeables.forEach((token) => {
				token.tooltip.alpha = v;
			});
		},
	});
});

Hooks.on("canvasReady", () => {
	const fontSize = game.settings.get("elevation-module", "fontSize");
	const hover = game.settings.get("elevation-module", "hover");

	canvas.tokens?.placeables.forEach((token) => {
		if (canvas.dimensions.size >= 200) {
			token.tooltip.style.fontSize = fontSize * (7 / 6);
		} else if (canvas.dimensions.size < 50) {
			token.tooltip.style.fontSize = fontSize * (5 / 6);
		} else {
			token.tooltip.style.fontSize = fontSize;
		}
		token.tooltip.alpha = hover;
	});
});

Hooks.on("drawToken", (token) => {
	const fontSize = game.settings.get("elevation-module", "fontSize");
	const hover = game.settings.get("elevation-module", "hover");

	if (canvas.dimensions.size >= 200) {
		token.tooltip.style.fontSize = fontSize * (7 / 6);
	} else if (canvas.dimensions.size < 50) {
		token.tooltip.style.fontSize = fontSize * (5 / 6);
	} else {
		token.tooltip.style.fontSize = fontSize;
	}
	token.tooltip.alpha = hover;
});

Hooks.on("hoverToken", (token, hovered) => {
	const hover = game.settings.get("elevation-module", "hover");
	token.tooltip.alpha = hovered ? 1 : hover;
});

Hooks.on("highlightObjects", (highlight) => {
	const hover = game.settings.get("elevation-module", "hover");
	canvas.tokens?.placeables.forEach((token) => {
		token.tooltip.alpha = highlight ? 1 : hover;
	});
});
