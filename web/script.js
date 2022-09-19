"use strict";

const [canvas, colorBoxes, redo, undo] = getElm(["canvas", "colorBoxes", "redo", "undo"]);
const ctx = canvas.getContext("2d");

const env = {
	color: "red",
	bold: 5,
	isClicking: false,
};


(() => {
	const [onBlack, onWhite] = mkElm(["div", "div"]);
	onBlack.style.backgroundColor = "black";
	onWhite.style.backgroundColor = "white";
	const elms = [onBlack, onWhite];
	looper(elms, elm => elm.addEventListener("click", setColor));
	append(elms, colorBoxes);
})();
looper(fromAtoB(0, 340, 15, false), (i, _) => {
	const [colorElm] = mkElm(["div"]);
	colorElm.style.backgroundColor = `hsla(${i}, 100%, 50%, 1)`;
	colorElm.addEventListener("click", setColor);
	colorBoxes.appendChild(colorElm);
});

function setColor() {
	removeClassifiedItems("selected");
	this.classList.add("selected");
	ctx.fillStyle = this.style.backgroundColor;
}


function moveStart() {
	env.isClicking = true;
}
function moveEnd() {
	env.isClicking = false;
}

canvas.addEventListener("mousedown", moveStart);
canvas.addEventListener("mouseup", moveEnd);
canvas.addEventListener("mouseleave", moveEnd);

canvas.addEventListener("mousemove", function(event) {
	if (!env.isClicking) return;

	const clickX = event.pageX;
	const clickY = event.pageY;

	const clientRect = this.getBoundingClientRect();
	const positionX = clientRect.left + window.pageXOffset;
	const positionY = clientRect.top + window.pageYOffset;

	const x = clickX - positionX;
	const y = clickY - positionY;
	draw(x, y);
});


function draw(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, env.bold, 0, 2 * Math.PI, false);
	ctx.fill();
}

