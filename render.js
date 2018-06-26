var gl;
var v =[];
var vertices = [];
var vertexBuff, colorBuff;
var depth = 3;
var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var u_Translation, u_Color;
var lastUpdate;
var R = 0.0, G = 0.0, B = 0.0;
var randomColor;
var animEnabled;
var pval = 1.0;
var increment;

function main() {
    let canvas = document.getElementById('my-canvas');
    setupHandlers();

    //setupWebGL id defined in webgl-utils.js
    gl = WebGLUtils.setupWebGL(canvas);


    // Load the shader pair. 2nd arg is vertex shader, 3rd arg is fragment shader
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then((prog) => {

            gl.useProgram(prog);

            //Use black RGB=(0,0,0) for the clear color
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            gl.viewport(0, 0, canvas.width, canvas.height);

            //clear the color buffer
            gl.clear(gl.COLOR_BUFFER_BIT);

            //locate the attributes vertexPos and vertexCol in the shader and enable them
            let posAttr = gl.getAttribLocation(prog, "vertexPos");
            gl.enableVertexAttribArray(posAttr);

            //create buffer for vertex and color
            vertexBuff = gl.createBuffer();

            //select the buffer as the current array buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
            //specify the memory layout of our vertex buffer
            gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);


            //link translation variable and color variable
            u_Translation = gl.getUniformLocation(prog, 'u_Translation');
            u_Color = gl.getUniformLocation(prog, 'u_Color');

            lastUpdate = 0;

            R = 0;
            G = 0;
            B = 123;
            gl.uniform3f(u_Color, R, G, B);

            randomColor = true;
        });

}

function setupHandlers() {
    //click control  for first 3 points
    const el = document.getElementById('my-canvas');
    el.addEventListener('click', event => {

        //get mouse click location
        let x = 2 * event.offsetX / el.width - 1;
        let y = -1 + 2 * (el.height - event.offsetY) / el.height;

        //only push location to array if another point is needed
        if(vertices.length < 6) {
            vertices.push(x);
            vertices.push(y);
            console.log('pushed point', event.offsetX, event.offsetY, 'array length = ', vertices.length);

            //bind buffer and provide data
            console.log('draw point');
            //select the buffer as the current array buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
            //copy data from array to the buffer
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
            window.requestAnimFrame(drawPoints);

            //create the triangle when there are 3 points
            if(vertices.length === 6) {
                animEnabled = true;
                v = [];
                console.log('make call to SierTri')
                SierTri(v, vertices[0], vertices[1], vertices[2], vertices[3], vertices[4], vertices[5], depth);
                //select the buffer as the current array buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
                //copy data from array to the buffer
                gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(v), gl.STATIC_DRAW);
                console.log('make call to updateme');
                //window.requestAnimFrame(updateMe);
                animEnabled = true;
                window.requestAnimFrame(animRedraw);
            }
        }

    });

    //slider control
    const slider = document.getElementById("slider");
    slider.addEventListener('change', event => {
        console.log("new depth is", slider.value);
        depth = slider.value;
        document.getElementById("depthSpan").textContent=slider.value.toString();
        v = [];
        SierTri(v, vertices[0],vertices[1],vertices[2],vertices[3],vertices[4], vertices[5], depth);
        //select the buffer as the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff);
        //copy data from array to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(v), gl.STATIC_DRAW);
        window.requestAnimFrame(updateMe);
    });

    //clear button
    const clearBtn = document.getElementById("clearBtn");
    clearBtn.addEventListener('click', event => {
        animEnabled = false;
        vertices = [];
        v = [];
        Tx = 0.0;
        Ty = 0.0;
        gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        console.log('clear');
    });

    //key control
    window.addEventListener('keydown', event => {
        var key = String.fromCharCode(event.keyCode);
        if(animEnabled) {
            switch (key) {
                case 'W':
                    //some code
                    console.log('move up');
                    Ty += 0.1;
                    break;
                case 'A':
                    //some code
                    console.log('move left');
                    Tx += -0.1;

                    break;
                case 'S':
                    //some code
                    console.log('move down');
                    Ty += -0.1;

                    break;
                case 'D':
                    //some code
                    console.log('move right');
                    Tx += 0.1;
                    break;
            }
            // Pass the translation distance to the vertex shader
            gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);
            window.requestAnimFrame(updateMe);
        }
    });

        //menu control for color
        const menu = document.getElementById("menu");
        menu.addEventListener('change', event => {
            if(randomColor){
                randomColor = false;
                pval = 0;
                increment = true;
            }  else {
                randomColor = true;
            }
            console.log('randomColor: ', randomColor);
            if(animEnabled) {
                lastUpdate = 0;
                window.requestAnimFrame(animRedraw)
            }

        });
}

//update the canvas with Triangles
function updateMe(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, v.length / 2);
}

//update the canvas with Points
function drawPoints(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, vertices.length/2);
}

//update the color of triangle
function animRedraw(time){

    gl.clear(gl.COLOR_BUFFER_BIT);

    if(randomColor === true) {
        if (Date.now() - lastUpdate > 500) {
            // your code here
            R = getRandNum();
            G = getRandNum();
            B = getRandNum();
            gl.uniform3f(u_Color, R, G, B);

            lastUpdate = Date.now();
        }
    } else {

        if(pval > 1 || pval < 0){
            increment = !increment;
        }

        if(increment){
            pval += 0.005;
        }else{
            pval -= 0.005;
        }

        R = pval * .99 + (1-pval) * 0.1;
        G = pval * 0.1 + (1-pval) * 0.01;
        B = pval * 0.1 + (1-pval) * .99;

        gl.uniform3f(u_Color, R, G, B);

        lastUpdate = Date.now();

    }
    if(animEnabled) {
        gl.drawArrays(gl.TRIANGLES, 0, v.length / 2);
        window.requestAnimFrame(animRedraw); // schedule next "redraw"
    }
}


//recursive function to get all needed points
function SierTri(v, ax, ay, bx, by, cx, cy, depth){
    //console.log('entered SierTri', ax, ay, bx, by, cx, cy);
    if(depth == 0) {
        v.push(ax);
        v.push(ay);
        v.push(bx);
        v.push(by);
        v.push(cx);
        v.push(cy);
    } else {
        SierTri(v, ax, ay, findMid(ax,bx), findMid(ay,by), findMid(ax,cx), findMid(ay,cy), depth - 1);
        SierTri(v, bx, by, findMid(ax,bx), findMid(ay,by), findMid(bx,cx), findMid(by,cy), depth - 1);
        SierTri(v, cx, cy, findMid(cx,bx), findMid(cy,by), findMid(ax,cx), findMid(ay,cy), depth - 1);
    }

}

//finds the middle of two points
function findMid(a, b){
    var middle = (a + b)/2;
    return middle;
}

//finds random rgb value  0-255
function getRandNum(){
    //var rand = Math.floor(Math.random()* 256);
    var rand = Math.random();
    return rand;
}



