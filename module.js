Hooks.once("i18nInit", () => {
	game.settings.register("elevation-module", "fontSize", {
		name: `DRAWING.FontSize`,
		hint: "ELEVATION_MODULE.fontSize.hint",
		scope: "world",
		config: true,
		type: new foundry.data.fields.NumberField({
			required: true,
			initial: 24,
			nullable: false,
			min: 0,
			max: 72,
			step: 1
		}),
		onChange: resizeTooltips,
	});

	game.settings.register("elevation-module", "hover", {
		name: "ELEVATION_MODULE.hover.name",
		hint: "ELEVATION_MODULE.hover.hint",
		scope: "world",
		config: true,
		type: new foundry.data.fields.NumberField({
			required: true,
			initial: 0.25,
			nullable: false,
			min: 0,
			max: 1,
			step: 0.25
		}),
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

	game.settings.register("elevation-module", "positionX", {
		name: "ELEVATION_MODULE.positionX.name",
		hint: "ELEVATION_MODULE.positionX.hint",
		scope: "world",
		config: true,
		default: "default",
		choices: {
			left: "ELEVATION_MODULE.positionX.options.left",
			default: "ELEVATION_MODULE.positionX.options.default",
			right: "ELEVATION_MODULE.positionX.options.right",
		},
		onChange: (value) => {
			canvas.tokens?.placeables.forEach((token) => repositionTooltip(token, value));
		},
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

export function repositionTooltip(token, tooltipPosition) {
	tooltipPosition ??= game.settings.get("elevation-module", "positionX");
	const docWidth = token.document.width;
	const { width } = token.getSize();
	const offset = 0.35 / Math.max(1, docWidth);
	if (tooltipPosition === "left") token.tooltip.x = width * (-offset);
	else if (tooltipPosition === "default") token.tooltip.x = width / 2;
	else if (tooltipPosition === "right") token.tooltip.x = width * (1 + offset);
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

Hooks.on("refreshToken", (token, flags) => {
	if (flags.refreshSize) repositionTooltip(token);
});

Hooks.on("highlightObjects", (highlight) => {
	const hover = game.settings.get("elevation-module", "hover");
	canvas.tokens?.placeables.forEach((token) => {
		token.tooltip.alpha = highlight ? 1 : hover;
	});
});
