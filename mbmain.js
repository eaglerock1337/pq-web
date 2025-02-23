//Made number of changes to have mandelbulb be transparent, and removed the background.
let colorRef, powerRef, eyeRef, lookDirRef, program;

// Get the WebGL rendering context 
const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
gl._setAttribute = (program, type, vname, ...value) => {
  const attribute = gl.getAttribLocation(program, vname)
  gl['vertexAttrib'+type](attribute, ...value);
  return attribute;
}
gl._setUniform = (program, type, vname, ...value) => {
  const uniform = gl.getUniformLocation(program, vname)
  gl['uniform'+type](uniform, ...value);
  return uniform;
}

init(gl);

async function getFetchText(url) {
  const response = await fetch(url);
  return await response.text();
}

async function init() {
  //Load shaders
  const vshader = await getFetchText("vshader.glsl");
  const fshader = await getFetchText("fshader.glsl");
  
  //Initialize Web GL
  program = compile(gl, vshader, fshader);
  
    // Set uniform locations
    powerRef = gl.getUniformLocation(program, 'power');
    eyeRef = gl.getUniformLocation(program, 'eye');
    lookDirRef = gl.getUniformLocation(program, 'lookDir');
    colorRef = gl.getUniformLocation(program, 'color');

  render(program);
}

function render(program) {
  const position = gl.getAttribLocation(program, "aPos");

  gl._setUniform(program, '1f', 'MIN_DIST', 0.0);
  gl._setUniform(program, '1f', 'MAX_DIST', 2000.0);
  gl._setUniform(program, '2f', 'iResolution', canvas.width, canvas.height);
  let eye = [0, 0, -50];
  let phi = Math.PI/2;
  let theta = Math.PI/2;
  let power = 2.0
  const powerRef = gl._setUniform(program, '1f', 'power', 2.0);
  const eyeRef = gl._setUniform(program, '3f', 'eye', ...eye);
  const lookDirRef = gl._setUniform(program, '3f', 'lookDir', 0, 0, 1);
  const inputs = setupInputs();

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0,  1.0, 0, // Bottom Left Triangle
     1.0,  1.0, 0,
    -1.0, -1.0, 0,
     1.0,  1.0, 0, // Top Right Triangle
     1.0, -1.0, 0, 
    -1.0, -1.0, 0
  ]), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(position);
  
  gl.vertexAttribPointer(
    position,
    3,          // 3 components per iteration
    gl.FLOAT,   // the data is 32bit floats
    false,      // don't normalize the data
    0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
    0,          // start at the beginning of the buffer
  );

  //Enable blending and set the blend function
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  // Disable depth testing
  //gl.disable(gl.DEPTH_TEST);

  // Set the clear color
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  let oldTime = Date.now();
  let newTime = oldTime;
  let totalFrameCount = 0;
  let fps = 100;
  function draw() {

	// Interpolate colors
    for (let i = 0; i < 3; i++) {
        currentColor[i] += (targetColor[i] - currentColor[i]) * colorTransitionSpeed;
    }
    gl.uniform3f(colorRef, ...currentColor);
	
    //FPS Calculation
    totalFrameCount++;
    if(totalFrameCount%100 == 0) {
      newTime = Date.now();
      fps = Math.round(100000/(newTime - oldTime)); //100 * 1000
      oldTime = newTime;
    }
    
    let lookDir = [Math.sin(theta)*Math.cos(phi), Math.cos(theta), Math.sin(theta)*Math.sin(phi)];
    const orthogonalDir = [Math.sin(phi), 0, -Math.cos(phi)]

    //Mandelbulb Animation
    power = (Math.sin(totalFrameCount/1000)*4) + 6;  // adjust numbers for Faster/Slower oscillation
    gl.uniform1f(powerRef, power);
    gl.uniform3f(eyeRef, ...eye);
	gl.uniform3f(lookDirRef, ...lookDir);
    
    gl.drawArrays(
      gl.TRIANGLES,
      0,     // offset
      6,     // num vertices to process
    );

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

let currentColor = [1, 0.5, 0]; // Initial HSL color
let targetColor = [1, 0, 0]; // Target HSL color
let colorTransitionSpeed = 0.005; // Adjust this value for faster/slower transitions

function updateMandelbulb(hash) {
    const colorRef = gl.getUniformLocation(program, 'color');
    const hashValue1 = parseInt(hash.slice(0, 8), 16);
    const hashValue2 = parseInt(hash.slice(8, 16), 16);
    const newPower = ((hashValue1 % 10) + (hashValue2 % 10)) / 2;
    gl.uniform1f(powerRef, newPower);

    const eyePosition = [
        (hashValue1 % 100) - 50,
        ((hashValue1 >> 8) % 100) - 50,
        ((hashValue2 >> 16) % 100) - 50
    ];
    gl.uniform3f(eyeRef, ...eyePosition);

	targetColor[0] = (hashValue1 % 360) / 360.0; // Hue between 0 and 1
    targetColor[1] = 1.0; // Full saturation
    targetColor[2] = 0.5; // Mid lightness

}
