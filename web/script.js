"use strict";

const [canvas, colorBoxes, redo, undo, eraseAll, boldChanger, boldSample] = getElm(["canvas", "colorBoxes", "redo", "undo", "eraseAll", "boldChanger", "boldSample"]);
const ctx = canvas.getContext("2d");


const log = {
	currentPosition: 0,
	images: [],
};

const env = {
	color: "red",
	bold: 5,
	isClicking: false,
	pointsTracer: [],
};


// 既定の色と太さです。
// 同時にHSLのHループでは到達できない黒と白も作っちゃいます。
const defaultBold = 10;
const defaultColor = (() => {
	const [onBlack, onWhite] = mkElm(["div", "div"]);
	onBlack.style.backgroundColor = "black";
	onWhite.style.backgroundColor = "white";
	const elms = [onBlack, onWhite];
	looper(elms, elm => elm.addEventListener("click", setColor));
	append(elms, colorBoxes);
	return onBlack;
})();

// HSL色空間のHを変化させた選択用オブジェクトを作成します。
looper(fromAtoB(0, 340, 15, false), (i, _) => {
	const [colorElm] = mkElm(["div"]);
	colorElm.style.backgroundColor = `hsla(${i}, 100%, 50%, 1)`;
	colorElm.addEventListener("click", setColor);
	colorBoxes.appendChild(colorElm);
});


// 色ボタンがクリックされた際の処理を記述します。
function setColor() {
	removeClassifiedItems("selected");
	this.classList.add("selected");
	env.color = this.style.backgroundColor;
}

// なぞり終わった際の処理です。
function moveStart() {
	env.isClicking = true;
	ctx.fillStyle = env.color;
}

// なぞり動作が完了した際の処理です。
function moveEnd() {
	if (!env.isClicking) return;
	log.images.splice(log.currentPosition);
	drawLine();
	env.isClicking = false;
}


// なぞり終わった時にパスを描写します。
// なぞった点の描写だけでは見た目がアレなので、、、笑
function drawLine() {
	ctx.beginPath();
	ctx.lineWidth = env.bold;
	ctx.strokeStyle = env.color;
	looper(env.pointsTracer, (points, _) => {
		ctx.lineTo(points[0], points[1]);
	});
	env.pointsTracer.splice(0);
	ctx.stroke();
	canvas.toBlob(blob => {
		log.images.push(blob);
		log.currentPosition++;
		undo.classList.remove("disabled");
	});
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

	env.pointsTracer.push([x, y]);
    drawPoint(x, y);
});

// なぞられた部分に点を描写します。
function drawPoint(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, env.bold / 2, 0, 2 * Math.PI, false);
	ctx.fill();
}


// ペンの太さをctxオブジェクトに反映させます。
function boldChanged() {
	boldSample.style.width = `${this.value}px`;
	boldSample.style.height = `${this.value}px`;
	env.bold = this.value;
}

boldChanger.addEventListener("change", boldChanged);
boldChanger.addEventListener("input", boldChanged);

eraseAll.addEventListener("click", function() {
	if (!window.confirm("削除しますか???")) return;
	log.currentPosition = 0;
	log.images.splice(0);
	looper([undo, redo], item => item.classList.add("disabled"));
	eraser();
});

// canvasを初期状態に戻します。
function eraser() {
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "white";
	ctx.fill();
}

undo.addEventListener("click", function() {
	if (log.currentPosition < 1) {
		undo.classList.add("disabled");
		return;
	}
	if (this.classList.contains("disabled")) return;
	redo.classList.remove("disabled");
	eraser();
	log.currentPosition--;
	const prevBlob = log.images[log.currentPosition - 1];
	blobOnCanvas(prevBlob);
});

redo.addEventListener("click", function() {
	if (this.classList.contains("disabled")) return;
	if (log.images.length - 1 < log.currentPosition) {
		redo.classList.add("disabled");
		return;
	}
	eraser();
	log.currentPosition++;
	const nextBlob = log.images[log.currentPosition - 1];
	blobOnCanvas(nextBlob);
});


// blobオブジェクトをcanvasに反映させます。
async function blobOnCanvas(blob) {
	if (blob === undefined) return;
	const bitmap = await createImageBitmap(blob);
	ctx.drawImage(bitmap, 0, 0);
}

// 初期作業を行います。
(() => { // init
	defaultColor.click();
	boldChanger.value = defaultBold;
	boldChanger.dispatchEvent(new Event("input"));
})();

