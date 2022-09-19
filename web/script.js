"use strict";

const [canvas, colorBoxes, redo, undo] = getElm(["canvas", "colorBoxes", "redo", "undo"]);
const ctx = canvas.getContext("2d");

const env = {
	color: null,
	bold: 10,
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
}


canvas.addEventListener("", function() {


	
	c.arc(75, 75, env.size, 0, 2 * Math.PI, false);
});



