Hooks.once("i18nInit", () => {
	game.settings.register("elevation-module", "fontSize", {
		name: `DRAWING.FontSize`,
		hint: "ELEVATION_MODULE.fontSize.hint",
		scope: "world",
		config: true,
		default: 24,
		type: Number,
		onChange: resizeTooltips,
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

	game.settings.register("elevation-module", "scaleToGridSize", {
		name: "ELEVATION_MODULE.scaleToGridSize.name",
		hint: "ELEVATION_MODULE.scaleToGridSize.hint",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		onChange: resizeTooltips,
	});
});

function resizeTooltips() {
	const fontSize = game.settings.get("elevation-module", "fontSize");
	const hover = game.settings.get("elevation-module", "hover");
	const scaleToGridSize = game.settings.get("elevation-module", "scaleToGridSize");
	const size = scaleToGridSize ? canvas.dimensions.size / 100 * fontSize : fontSize;
	canvas.tokens?.placeables.forEach((token) => resizeToken(token, size, hover));
}

function resizeToken(token, size, hover) {
	if (canvas.dimensions.size >= 200) {
		token.tooltip.style.fontSize = size * (7 / 6);
	} else if (canvas.dimensions.size < 50) {
		token.tooltip.style.fontSize = size * (5 / 6);
	} else {
		token.tooltip.style.fontSize = size;
	}
	token.tooltip.alpha = hover;
}

Hooks.on("canvasReady", resizeTooltips);

Hooks.on("drawToken", (token) => {
	const fontSize = game.settings.get("elevation-module", "fontSize");
	const hover = game.settings.get("elevation-module", "hover");
	const scaleToGridSize = game.settings.get("elevation-module", "scaleToGridSize");
	const size = scaleToGridSize ? canvas.dimensions.size / 100 * fontSize : fontSize;
	resizeToken(token, size, hover);
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
