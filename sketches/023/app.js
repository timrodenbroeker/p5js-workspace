/*
 =========================================
 OTHER VARIABLES
   =========================================
   */
var inp,
    posterW = 586,
    posterH = 810;
var currentImage, newImage;
var imageOffsetX = 0,
    imageOffsetY = 0;
var started = false;
var imageIsLoaded = false;
var poster;
var imgCounter = 0;
var allImages = [];
var gotChanges = false; // The PGraphics-element i'll draw on the poster

var pg;
var mouseOffsetX = 0,
    mouseOffsetY = 0,
    dragging = false,
    rollover = false;
var grid = [];
var gridItemW; // Automated gridRows

var gridRows;
var img;
var imageFilenames = {};
var fontFilenames = {}; // The busy-boolean is used to show a loading message while loading and converting

var busy = true; // This variable holds the current image

var sourceImage; // The canvas (PGraphics-element) that holds the manipulated image

var manipulatedImage;
var font, metaFont;

function preload() {
  imageFilenames = loadJSON("../../data/images.json");
  fontFilenames = loadJSON("../../data/fonts.json");
  sourceImage = loadImage("../../images/30.jpg");
  font = loadFont("../../fonts/Cormorant-Regular.ttf");
  metaFont = loadFont("../../fonts/Poppins-Bold.ttf");
}
/*
 =========================================
 SETUP
   =========================================
   */


function setup() {
  imageMode(CENTER);
  rectMode(CENTER); // Create canvas

  var canvas = createCanvas(900, 900);
  canvas.parent("sketch"); // The poster is a PGraphics-element

  poster = createGraphics(586, 810);
  manipulateImage();
  busy = false; // gui.js

  buildUI(); // dust.js

  generateDust();
} // Function to assign all values from the file-arrays to the gui-select-elements
// function to(name, seedGroup, seed, number) {
// 	this.name = name;
// 	this.seedGroup = seedGroup;
// 	this.seed = seed;
// 	}
// 	var countries = [
// 	  new to("Austria", 3, 0),
// 	  new to("Belgium", 1, 1),
// 	  new to("Bosnia & Herzogovinia", 2, 2)
// 	];
// 	var options = '';
// 	for (var i = 0; i < countries.length; i++) {
// 	   options += '<option value="'+JSON.stringify(countries[i])+'">'+countries[i].name+'</option>';
// 	}
// 	$('select').html(options);

/*
 =========================================
 STATE

 This object stores the values that are 
 manipulated through the GUI

   =========================================
   */


var State = {
  // DATA
  selectedLayer: "I",
  text: "ART IN THE AGE OF AUTOMATION",
  // TYPOGRAPHY
  fontSize: 200,
  lineHeight: 0.9,
  textX: 0,
  textY: -20,
  font: "Cormorant-Italic.ttf",
  // META INFOS
  metaInfosX: 10,
  metaInfosY: 742,
  // IMAGE
  image: "9.jpg",
  imageX: 10,
  imageY: 10,
  width: 700,
  gridCols: 150,
  maxSize: 4,
  // The actual Colors
  Colors: {
    background: "#ffffff",
    text: "#f45642",
    image: "#2103A8"
  }
};
/*
 =========================================
 Keyboard
   =========================================
   */

var imgCounter = 0;

function exportImage() {
  save("out" + imgCounter + ".jpg");
  imgCounter += 1;
}

document.onkeyup = function (e) {
  // SAVE IMAGE WITH S
  if (e.keyCode == 192) {
    exportImage();
  }

  if (e.keyCode == 27) {
    document.getElementById("overlay").classList.remove("visible");
  }
};
/*
 =========================================
 Mouse
   =========================================
   */


function mousePressed() {
  // Did I click on the rectangle?
  if (rollover) {
    dragging = true; // If so, keep track of relative location of click to corner of rectangle

    mouseOffsetX = State.imageX - mouseX;
    mouseOffsetY = State.imageY - mouseY;
  }
}

function mouseReleased() {
  // Quit dragging
  dragging = false;
}

function mouseDragText() {
  // Is mouse over object
  if (mouseX > 0 && mouseX < 900 && mouseY > 0 && mouseY < 900) {
    rollover = true;
  } else {
    rollover = false;
  }

  if (dragging) {
    State.imageX = mouseX + mouseOffsetX;
    State.imageY = mouseY + mouseOffsetY;
  }
}

function mouseDragImage() {
  // Is mouse over object
  if (mouseX > 0 && mouseX < 900 && mouseY > 0 && mouseY < 900) {
    rollover = true;
  } else {
    rollover = false;
  }

  if (dragging) {
    State.imageX = mouseX + mouseOffsetX;
    State.imageY = mouseY + mouseOffsetY;
  }
}
/*
 =========================================
 Typography
   =========================================
   */


function type() {
  poster.textFont(font);
  poster.textAlign(RIGHT, TOP);
  poster.rectMode(CORNER);
  poster.textSize(State.fontSize);
  poster.fill(State.Colors.text);
  poster.push();
  poster.translate(State.textX, State.textY);
  var charPosX = 0;
  var charPosY = 0;

  for (var i = 0; i < State.text.length; i++) {
    var charW = poster.textWidth(State.text[i]);

    if (charPosX > posterW - 20) {
      charPosX = 0;
      charPosY += State.fontSize * State.lineHeight;
    }

    charPosX += charW;
    poster.text(State.text[i], charPosX, charPosY);
  }

  poster.pop();
}
/*
 =========================================
 MetaInfos
   =========================================
   */


function metaInfos() {
  poster.textFont(metaFont);
  poster.textAlign(CENTER, TOP);
  poster.fill(State.Colors.image);
  poster.textSize(11);
  poster.push();
  poster.translate(State.metaInfosX, State.metaInfosY); // poster.text('Programming Posters', 0, 0);
  // poster.text('April 17th - 21th 2019', 0, 0 + 16);

  poster.text("www.timrodenbroeker.de", posterW / 2, 0 + 32);
  poster.pop();
}
/*
 =========================================
Fetch image
   =========================================
   */
// Get a new source image


function getNewSourceImage(value) {
  busy = true;
  sourceImage = loadImage("../../images/" + value, function () {
    console.log(value + " loaded");
    manipulateImage();
  });
}
/*
 =========================================
Image manipulation algorithm
----------------------------

   =========================================
   */


function manipulateImage() {
  // 1.
  sourceImage.resize(200, 0); // 2.

  var srcImgW = sourceImage.width;
  var srcImgH = sourceImage.height; // 3.

  var ratio = srcImgH / srcImgW; // 4. Get width of the rasterized image from UI

  var mImgW = parseInt(State.width); // Calculate the height of it with the ratio

  var mImgH = parseInt(State.width * ratio);
  var scaling = mImgW / srcImgW; // Calculate the number of gridcolumns

  var gridItemW = mImgW / State.gridCols; // Calculate the number of gridrows

  var gridRows = State.gridCols * ratio; // Create PGraphics

  manipulatedImage = createGraphics(mImgW, mImgH); // Fill and stroke

  manipulatedImage.noStroke();
  manipulatedImage.fill(State.Colors.image); // BUG!
  // The loop draws only a grid of 60 tiles instead of 180

  var counter = 0; // Get the brightness-min- and max-values for contrast optimization

  var briMin = 0,
      briMax = 255;

  for (var x = 0; x < mImgW; x += gridItemW) {
    for (var y = 0; y < mImgH; y += gridItemW) {
      // get the right pixel
      var thisPixel = sourceImage.get(parseInt(x / scaling), parseInt(y / scaling));
      var brightn = brightness(thisPixel);
    }
  } // DRAW IT!!!


  for (var x = 0; x < mImgW; x += gridItemW) {
    counter++;

    for (var y = 0; y < mImgH; y += gridItemW) {
      // get the right pixel
      var thisPixel = sourceImage.get(parseInt(x / scaling), parseInt(y / scaling));
      var brightn = brightness(thisPixel); // calculate the size of the rectangle

      var size = map(brightn, 100, 0, 0, State.maxSize);
      manipulatedImage.push();
      manipulatedImage.translate(x, y);
      manipulatedImage.rect(0, 0, size, size);
      manipulatedImage.pop();
    }
  }

  busy = false;
}
/*
 =========================================
 DRAW
   =========================================
   */


var posterSizeAdjust = false;
var posterSizeAdjustWidth = State.width;

function draw() {
  background("#000000");
  poster.background(State.Colors.background);
  poster.rectMode(CORNER);
  poster.noStroke();

  if (busy) {
    textAlign(CENTER, CENTER);
    fill("#ffffff");
    push();
    translate(width / 2, height / 2);
    textSize(33);
    text("loading image...", 0, 0);
    pop();
  } else {
    // Display the manipulated image
    poster.push();
    poster.translate(State.imageX, State.imageY);
    poster.image(manipulatedImage, 0, 0);
    poster.pop(); // If imagesize is adjusted

    if (posterSizeAdjust) {
      poster.push();
      poster.translate(State.imageX, State.imageY);
      poster.noFill();
      poster.strokeWeight(6);
      poster.stroke("#E25B46");
      poster.rectMode(CORNER);
      poster.rect(0, 0, posterSizeAdjustWidth, posterSizeAdjustWidth);
      poster.pop();
    } // Display the sourceImage image
    // poster.image(sourceImage, 250, 0);


    type(); // metaInfos();

    mouseDragImage(State.imageX, State.imageY);
    dust(); // Draw the poster on the square

    push();
    translate(width / 2, height / 2);
    image(poster, 0, 0);
    pop();
  }
}
/*
 =========================================
 Generate Dust
   =========================================
   */


var rects = [];

function generateDust() {
  for (var i = 0; i < 100; i++) {
    rects.push({
      x: random(posterW),
      y: random(posterH),
      w: random(2),
      h: random(5)
    });
  }
}
/*
 =========================================
 Display Dust
   =========================================
   */


function dust() {
  poster.fill(State.Colors.background);
  poster.noStroke();

  for (var i = 0; i < rects.length; i++) {
    poster.rect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
  }
}

function buildUI() {
  //////////////
  // CREATE TEMPLATE WITH FONT-OPTIONS
  //////////////
  var arrayOfFonts = [];

  for (var property in fontFilenames) {
    if (fontFilenames.hasOwnProperty(property)) {
      arrayOfFonts.push("<option>" + property + "</option>");
    }
  }

  var fontOptionsHtml = arrayOfFonts.join("");
  var markup = `
  <div id="gui">
  <div class="gui-group">
  <h1 style="color: red;">POSTERTOY</h1>
  <p>By <a target="_blank" href="https://www.timrodenbroeker.de">Tim Rodenbröker</a><br>
  Version 0.1
  </p>
  </div>
		<div class="gui-group">
			<h2>Typography</h2>
			${buildTextInput("text", "Text", "Hi IN THE AGE OF AUTOMATION")}
			${buildSelect("fonts", "Font", fontOptionsHtml)}
			${buildUISlider("fontsize", "font-Size", 0, 300, 1, State.fontSize)}
			${buildUISlider("lineheight", "line-height", 0, 2, 0.001, State.lineHeight)}
			${buildUISlider("textPosition", "text-position", -100, 900, 1, State.textY)}
		</div>

    <div class="gui-group">
    <h2>Colors</h2>
    <div class="gui-wrapper">
      <div class="gui-label">Background</div>
        <div class="gui-input">
          <div class="bgPickr"></div>
        </div>
        <div class="gui-val"></div>
      </div>
      
      <div class="gui-wrapper">
      <div class="gui-label">Text</div>
        <div class="gui-input">
          <div class="txtPickr"></div>
        </div>
        <div class="gui-val"></div>
        </div>
      <div class="gui-wrapper">
      <div class="gui-label">Image</div>
        <div class="gui-input">
          <div class="imgPickr"></div>
        </div>
        <div class="gui-val"></div>
      </div>



		</div>

		<div class="gui-group">
		<h2>Image</h2>
			${buildImageSelectButton()}
			${buildUISlider("imgW", "width", 0, 1400, 1, State.width)}
			${buildUISlider("gridCols", "tiles", 20, 200, 1, State.gridCols)}
      ${buildUISlider("imgMaxS", "tilesize", 0.1, 12, 0.01, State.maxSize)}

		</div>

    <div class="gui-group">
    <h2>Save</h2>

    <div class="gui-wrapper">
      <div class="gui-label">Export</div>
        <div class="gui-input">
         <button onclick="exportImage()">Save JPG</button>
        </div>
        <div class="gui-val"></div>
      </div>


      <div class="gui-wrapper">
      <div class="gui-label">Save</div>
        <div class="gui-input">
         <button onclick="exportImage()">Save Configuration</button>
        </div>
        <div class="gui-val"></div>
      </div>


    </div>
	</div>
	`;
  $("#guiWrapper").html(markup);
  buildImagesOverlay();
  databinding();
  createPickrs();
}

function databinding() {
  /*
  =========================================
  IMAGE SELECTOR
   =========================================
   */
  document.getElementById("imageSelectButton").querySelector("button").onclick = function () {
    ImagesOverlayDataBinding();
    document.getElementById("overlay").classList.add("visible");
  };
  /*
  =========================================
  LAYER SELECTOR
   =========================================
   */
  // Layer
  // document.getElementById('layerRadio').querySelector('fieldset').onchange = function() {
  // 	State.selectedLayer = document.querySelector('input[name="Layer"]:checked').value;
  // };

  /*
  =========================================
  TYPOGRAPHY
   =========================================
   */
  // Font-size


  document.getElementById("text").querySelector("input").oninput = function () {
    State.text = this.value.toUpperCase();
  }; // Font


  document.getElementById("fonts").querySelector("select").onchange = function () {
    var newFont = this.options[this.selectedIndex].value;
    font = loadFont("../../fonts/" + newFont);
    console.log(newFont);
  }; // Font-size


  document.getElementById("fontsize").querySelector("input").oninput = function () {
    State.fontSize = parseFloat(this.value);
    document.getElementById("fontsize").querySelector(".gui-val").innerHTML = State.fontSize;
  }; // line-height


  document.getElementById("lineheight").querySelector("input").oninput = function () {
    State.lineHeight = parseFloat(this.value);
    document.getElementById("lineheight").querySelector(".gui-val").innerHTML = State.lineHeight;
  }; // line-height


  document.getElementById("textPosition").querySelector("input").oninput = function () {
    State.textY = parseFloat(this.value);
    document.getElementById("textPosition").querySelector(".gui-val").innerHTML = State.textY;
  };
  /*
  =========================================
  IMAGES
   =========================================
   */
  // document.getElementById('images').querySelector('select').onchange = function() {
  // 	var newImage = this.options[this.selectedIndex].value;
  // 	getNewSourceImage(newImage);
  // 	console.log(newImage);
  // };
  // Image width


  document.getElementById("imgW").querySelector("input").oninput = function () {
    posterSizeAdjustWidth = this.value;
    posterSizeAdjust = true;
  };

  document.getElementById("imgW").querySelector("input").onchange = function () {
    State.width = parseInt(this.value);
    document.getElementById("imgW").querySelector(".gui-val").innerHTML = State.width;
    posterSizeAdjust = false;
    manipulateImage();
  };

  document.getElementById("imgMaxS").querySelector("input").onchange = function () {
    State.maxSize = parseFloat(this.value);
    document.getElementById("imgMaxS").querySelector(".gui-val").innerHTML = State.maxSize;
    manipulateImage();
  };

  document.getElementById("gridCols").querySelector("input").onchange = function () {
    State.gridCols = parseFloat(this.value);
    document.getElementById("gridCols").querySelector(".gui-val").innerHTML = State.gridCols;
    manipulateImage();
  }; //A
  // document.getElementById("color-type").onclick = function() {
  //   this.classList.toggle("active");
  //   if (this.classList.contains("active")) {
  //     State.Colors.text = "#2103A8";
  //   } else {
  //     State.Colors.text = "#f1f1f1";
  //   }
  // };
  // document.getElementById("color-background").onclick = function() {
  //   this.classList.toggle("active");
  //   if (this.classList.contains("active")) {
  //     State.Colors.background = "#2103A8";
  //   } else {
  //     State.Colors.background = "#f1f1f1";
  //   }
  // };
  // document.getElementById("color-image").onclick = function() {
  //   this.classList.toggle("active");
  //   if (this.classList.contains("active")) {
  //     State.Colors.image = "#2103A8";
  //   } else {
  //     State.Colors.image = "#f1f1f1";
  //   }
  //   manipulateImage();
  // };

}

function createPickrs() {
  const bgPickr = new Pickr({
    // Selector or element which will be replaced with the actual color-picker.
    // Can be a HTMLElement.
    el: ".bgPickr",
    // Using the 'el' Element as button, won't replace it with the pickr-button.
    // If true, appendToBody will also be automatically true.
    useAsButton: false,
    // Start state. If true 'disabled' will be added to the button's classlist.
    disabled: false,
    // If set to false it would directly apply the selected color on the button and preview.
    comparison: true,
    // Default color
    default: State.Colors.background,
    // Default color representation.
    // Valid options are `HEX`, `RGBA`, `HSVA`, `HSLA` and `CMYK`.
    defaultRepresentation: "HEX",
    // Option to keep the color picker always visible. You can still hide / show it via
    // 'pickr.hide()' and 'pickr.show()'. The save button keeps his functionality, so if
    // you click it, it will fire the onSave event.
    showAlways: false,
    // If the color picker should have the body element as it's parent.
    appendToBody: false,
    // Close pickr with this specific key.
    // Default is 'Escape'. Can be the event key or code.
    closeWithKey: "Escape",
    // Defines the position of the color-picker. Available options are
    // top, left and middle relativ to the picker button.
    // If clipping occurs, the color picker will automatically choose his position.
    position: "middle",
    // Enables the ability to change numbers in an input field with the scroll-wheel.
    // To use it set the cursor on a position where a number is and scroll, use ctrl to make steps of five
    adjustableNumbers: true,
    // Show or hide specific components.
    // By default only the palette (and the save button) is visible.
    components: {
      preview: false,
      // Left side color comparison
      opacity: false,
      // Opacity slider
      hue: true,
      // Hue slider
      // Bottom interaction bar, theoretically you could use 'true' as propery.
      // But this would also hide the save-button.
      interaction: {
        hex: true,
        // hex option  (hexadecimal representation of the rgba value)
        rgba: false,
        // rgba option (red green blue and alpha)
        hsla: false,
        // hsla option (hue saturation lightness and alpha)
        hsva: false,
        // hsva option (hue saturation value and alpha)
        cmyk: false,
        // cmyk option (cyan mangenta yellow key )
        input: true,
        // input / output element
        clear: false,
        // Button which provides the ability to select no color,
        save: true // Save button

      }
    },
    // Button strings, brings the possibility to use a language other than English.
    strings: {
      save: "Apply",
      // Default for save button
      clear: "Clear" // Default for clear button

    },

    // User has changed the color
    onChange(hsva, instance) {
      hsva; // HSVa color object, if cleared null

      instance; // Current Pickr instance
    },

    // User has clicked the save button
    onSave(hsva, instance) {
      var hex = hsva.toHEX().toString();
      State.Colors.background = hex;
      manipulateImage();
    }

  });
  const txtPickr = new Pickr({
    // Selector or element which will be replaced with the actual color-picker.
    // Can be a HTMLElement.
    el: ".txtPickr",
    // Using the 'el' Element as button, won't replace it with the pickr-button.
    // If true, appendToBody will also be automatically true.
    useAsButton: false,
    // Start state. If true 'disabled' will be added to the button's classlist.
    disabled: false,
    // If set to false it would directly apply the selected color on the button and preview.
    comparison: true,
    // Default color
    default: State.Colors.text,
    // Default color representation.
    // Valid options are `HEX`, `RGBA`, `HSVA`, `HSLA` and `CMYK`.
    defaultRepresentation: "HEX",
    // Option to keep the color picker always visible. You can still hide / show it via
    // 'pickr.hide()' and 'pickr.show()'. The save button keeps his functionality, so if
    // you click it, it will fire the onSave event.
    showAlways: false,
    // If the color picker should have the body element as it's parent.
    appendToBody: false,
    // Close pickr with this specific key.
    // Default is 'Escape'. Can be the event key or code.
    closeWithKey: "Escape",
    // Defines the position of the color-picker. Available options are
    // top, left and middle relativ to the picker button.
    // If clipping occurs, the color picker will automatically choose his position.
    position: "middle",
    // Enables the ability to change numbers in an input field with the scroll-wheel.
    // To use it set the cursor on a position where a number is and scroll, use ctrl to make steps of five
    adjustableNumbers: true,
    // Show or hide specific components.
    // By default only the palette (and the save button) is visible.
    components: {
      preview: false,
      // Left side color comparison
      opacity: false,
      // Opacity slider
      hue: true,
      // Hue slider
      // Bottom interaction bar, theoretically you could use 'true' as propery.
      // But this would also hide the save-button.
      interaction: {
        hex: true,
        // hex option  (hexadecimal representation of the rgba value)
        rgba: false,
        // rgba option (red green blue and alpha)
        hsla: false,
        // hsla option (hue saturation lightness and alpha)
        hsva: false,
        // hsva option (hue saturation value and alpha)
        cmyk: false,
        // cmyk option (cyan mangenta yellow key )
        input: true,
        // input / output element
        clear: false,
        // Button which provides the ability to select no color,
        save: true // Save button

      }
    },
    // Button strings, brings the possibility to use a language other than English.
    strings: {
      save: "Apply",
      // Default for save button
      clear: "Clear" // Default for clear button

    },

    // User has changed the color
    onChange(hsva, instance) {
      var hex = hsva.toHEX().toString();
      State.Colors.text = hex;
    },

    // User has clicked the save button
    onSave(hsva, instance) {
      var hex = hsva.toHEX().toString();
      State.Colors.text = hex;
    }

  });
  const imgPickr = new Pickr({
    // Selector or element which will be replaced with the actual color-picker.
    // Can be a HTMLElement.
    el: ".imgPickr",
    // Using the 'el' Element as button, won't replace it with the pickr-button.
    // If true, appendToBody will also be automatically true.
    useAsButton: false,
    // Start state. If true 'disabled' will be added to the button's classlist.
    disabled: false,
    // If set to false it would directly apply the selected color on the button and preview.
    comparison: true,
    // Default color
    default: State.Colors.image,
    // Default color representation.
    // Valid options are `HEX`, `RGBA`, `HSVA`, `HSLA` and `CMYK`.
    defaultRepresentation: "HEX",
    // Option to keep the color picker always visible. You can still hide / show it via
    // 'pickr.hide()' and 'pickr.show()'. The save button keeps his functionality, so if
    // you click it, it will fire the onSave event.
    showAlways: false,
    // If the color picker should have the body element as it's parent.
    appendToBody: false,
    // Close pickr with this specific key.
    // Default is 'Escape'. Can be the event key or code.
    closeWithKey: "Escape",
    // Defines the position of the color-picker. Available options are
    // top, left and middle relativ to the picker button.
    // If clipping occurs, the color picker will automatically choose his position.
    position: "middle",
    // Enables the ability to change numbers in an input field with the scroll-wheel.
    // To use it set the cursor on a position where a number is and scroll, use ctrl to make steps of five
    adjustableNumbers: true,
    // Show or hide specific components.
    // By default only the palette (and the save button) is visible.
    components: {
      preview: false,
      // Left side color comparison
      opacity: false,
      // Opacity slider
      hue: true,
      // Hue slider
      // Bottom interaction bar, theoretically you could use 'true' as propery.
      // But this would also hide the save-button.
      interaction: {
        hex: true,
        // hex option  (hexadecimal representation of the rgba value)
        rgba: false,
        // rgba option (red green blue and alpha)
        hsla: false,
        // hsla option (hue saturation lightness and alpha)
        hsva: false,
        // hsva option (hue saturation value and alpha)
        cmyk: false,
        // cmyk option (cyan mangenta yellow key )
        input: true,
        // input / output element
        clear: false,
        // Button which provides the ability to select no color,
        save: true // Save button

      }
    },
    // Button strings, brings the possibility to use a language other than English.
    strings: {
      save: "Apply",
      // Default for save button
      clear: "Clear" // Default for clear button

    },

    // User has changed the color
    onChange(hsva, instance) {},

    // User has clicked the save button
    onSave(hsva, instance) {
      var hex = hsva.toHEX().toString();
      State.Colors.image = hex;
      manipulateImage();
    }

  });
}

function buildExportTool() {
  var tmplt = `	
   
      <button>Save as JPG</button>

      <button>Save Configuration</button>
   `;
  return tmplt;
}

function buildImageSelectButton() {
  var tmplt = `
		<div class="gui-wrapper" id="imageSelectButton">
			<div class="gui-label">File</div>
			<div class="gui-input">
				<button>Select image</button>
			</div>
			<div class="gui-val"></div>
		</div>
	`;
  return tmplt;
} // This function builds the Modal


function buildImagesOverlay() {
  var markupArray = []; // Fetch JSON-file which contains all the filenames of the images

  fetch("../../data/images.json").then(response => response.json()) // Loop through the array
  // and push markup to the markup-array
  .then(json => {
    for (var i = 0; i < json.length; i++) {
      var filename = json[i];
      markupArray.push(`
				<button data-image="${filename}"><img src="../../images/${filename}"></button>
			`);
    } // Convert thte markup-array to a string


    var imageOptionsHtml = markupArray.join(""); // And then put the Markup into the #overlay

    $("#overlay").html(imageOptionsHtml);
  }).then(ImagesOverlayDataBinding());
} // ImagesOverlayDataBinding puts the functionality to the buttons


function ImagesOverlayDataBinding() {
  var list = document.getElementById("overlay");
  console.log(list.children.length);

  for (var i = 0; i < list.children.length; i++) {
    list.getElementsByTagName("button")[i].onclick = function () {
      var newImage = this.dataset.image;
      console.log(newImage);
      getNewSourceImage(newImage);
      document.getElementById("overlay").classList.remove("visible");
      document.getElementById("imageSelectButton").querySelector("button").innerHTML = newImage;
    };
  }
}

function buildLayerRadio() {
  var tmplt = `
		<div class="gui-wrapper" id="layerRadio">
			<div class="gui-input">
				<fieldset>
					<input type="radio" id="mc" name="Layer" value="Image" checked>
					<label for="mc"> Image</label> 
					<input type="radio" id="vi" name="Layer" value="Typography">
					<label for="vi"> Typography</label>
				</fieldset>
			</div>
		</div>
	`;
  return tmplt;
}

function buildSelect(id, label, data) {
  var tmplt = `
	<div class="gui-wrapper" id="${id}">
		<div class="gui-label">${label}</div>
		<div class="gui-input">

			<select>

				${data}

			</select>

		</div>
		<div class="gui-val"></div>
	</div>
	`;
  return tmplt;
}

function buildUISlider(id, label, min, max, step, initialVal) {
  var tmplt = `
  <div class="gui-wrapper" id="${id}">
    <div class="gui-label">${label}</div>
    <div class="gui-input">
      <input min="${min}" max="${max}" step="${step}" type="range" value="${initialVal}"/>
    </div>
    <div class="gui-val"></div>
  </div>
  `;
  return tmplt;
}

function buildTextInput(id, label, val) {
  var tmplt = `
	<div class="gui-wrapper" id="${id}">
		<div class="gui-label">${label}</div>
		<div class="gui-input">
			<input onkeyup="this.value = this.value.toUpperCase();" value="${val}" type="text"/>
		</div>
		<div class="gui-val"></div>
	</div>
	`;
  return tmplt;
}