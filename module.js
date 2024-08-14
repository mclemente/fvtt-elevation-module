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
		onChange: () => {
			game["elevation-module"].fontSize = value;
			resizeTooltips();
		},
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
			game["elevation-module"].hover = value;
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
		onChange: (value) => {
			game["elevation-module"].scaleToGridSize = value;
			resizeTooltips();
		},
	});

	game.settings.register("elevation-module", "scaleToZoom", {
		name: "ELEVATION_MODULE.scaleToZoom.name",
		hint: "ELEVATION_MODULE.scaleToZoom.hint",
		config: true,
		default: false,
		type: Boolean,
		onChange: (value) => {
			game["elevation-module"].scaleToZoom = value;
			if (value) Hooks.on("canvasPan", scaleToZoom);
			else Hooks.off("canvasPan", scaleToZoom);
		},
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
			game["elevation-module"].positionX = value;
			canvas.tokens?.placeables.forEach((token) => repositionTooltip(token, value));
		},
	});

	game["elevation-module"] = {
		fontSize: game.settings.get("elevation-module", "fontSize"),
		hover: game.settings.get("elevation-module", "hover"),
		scaleToGridSize: game.settings.get("elevation-module", "scaleToGridSize"),
		scaleToZoom: game.settings.get("elevation-module", "scaleToZoom"),
		positionX: game.settings.get("elevation-module", "positionX"),
	}
});

Hooks.on("setup", () => {
	if (game.settings.get("elevation-module", "scaleToZoom")) {
		Hooks.on("canvasPan", scaleToZoom)
	}
});

function resizeTooltips() {
	canvas.tokens?.placeables.forEach((token) => resizeToken(token));
}

function getFontSize() {
	const size = game["elevation-module"].scaleToGridSize
		? canvas.dimensions.size / 100 * game["elevation-module"].fontSize
		: game["elevation-module"].fontSize;
	const zoomLevel = game["elevation-module"].scaleToZoom
		? Math.min(1, canvas.stage.scale.x)
		: 1;
	return size / zoomLevel;
}

function resizeToken(token) {
	if (!token.visible) return;
	const size = getFontSize();
	if (canvas.dimensions.size >= 200) {
		token.tooltip.style.fontSize = size * (7 / 6);
	} else if (canvas.dimensions.size < 50) {
		token.tooltip.style.fontSize = size * (5 / 6);
	} else {
		token.tooltip.style.fontSize = size;
	}
	token.tooltip.alpha = game["elevation-module"].hover;
}

function scaleToZoom(canvas) {
	const scale = () => {
		const zoomLevel = Math.min(1, canvas.stage.scale.x);
		if (game["elevation-module"].lastZoom !== zoomLevel) {
			canvas.tokens?.placeables.filter((t) => t.tooltip?.visible).forEach(resizeToken);
		}
		game["elevation-module"].lastZoom = zoomLevel;
	};
	if (game["elevation-module"].timeout) clearTimeout(game["elevation-module"].timeout);
	game["elevation-module"].timeout = setTimeout(scale, 100);
}

export function repositionTooltip(token, tooltipPosition) {
	tooltipPosition ??= game["elevation-module"].positionX;
	const docWidth = token.document.width;
	const { width } = token.getSize();
	const offset = 0.35 / Math.max(1, docWidth);
	if (tooltipPosition === "left") token.tooltip.x = width * (-offset);
	else if (tooltipPosition === "default") token.tooltip.x = width / 2;
	else if (tooltipPosition === "right") token.tooltip.x = width * (1 + offset);
}

Hooks.on("canvasReady", resizeTooltips);

Hooks.on("hoverToken", (token, hovered) => {
	token.tooltip.alpha = hovered ? 1 : game["elevation-module"].hover;
});

Hooks.on("refreshToken", (token, flags) => {
	if (flags.refreshElevation) resizeToken(token);
	if (flags.refreshSize) repositionTooltip(token);
});

Hooks.on("highlightObjects", (highlight) => {
	canvas.tokens?.placeables.forEach((token) => {
		token.tooltip.alpha = highlight ? 1 : game["elevation-module"].hover;
	});
});
