"use client";

import { useEffect, useRef } from "react";

export function AsciiWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const width = 120;
    const height = 40;
    canvas.width = width * 8;
    canvas.height = height * 12;

    // 1. GENERATE TEXTURE ATLAS (The Sprite Sheet)
    const chars = "█▓▒░ ";
    const atlasCanvas = document.createElement("canvas");
    const charW = 32;
    const charH = 32;
    atlasCanvas.width = charW * chars.length;
    atlasCanvas.height = charH;
    const actx = atlasCanvas.getContext("2d")!;
    
    actx.fillStyle = "#000"; // Black background
    actx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);
    actx.fillStyle = "#fff"; // White text
    actx.font = "24px JetBrains Mono, monospace";
    actx.textAlign = "center";
    actx.textBaseline = "middle";
    for (let i = 0; i < chars.length; i++) {
      actx.fillText(chars[i], i * charW + charW / 2, charH / 2);
    }

    // 2. UPLOAD TEXTURE TO GPU
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // 3. WRITE THE SHADERS
    // Vertex Shader: Just creates a flat rectangle covering the whole canvas
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Where your math lives, running for every pixel at once
    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform sampler2D u_chars;

      // Helper to convert HSL to RGB (approximating your OKLCH colors)
      vec3 hsl2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
          return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
      }

      void main() {
        vec2 grid = vec2(120.0, 40.0);
        
        // Get normalized coordinates (0.0 to 1.0)
        vec2 uv = gl_FragCoord.xy / u_resolution;
        uv.y = 1.0 - uv.y; // Flip Y so it renders top-to-bottom like Canvas 2D
        
        // Find which cell of the 120x40 grid this pixel belongs to
        vec2 cell = floor(uv * grid);
        vec2 cellUv = fract(uv * grid); // UV inside the individual cell
        
        float x = cell.x;
        float y = cell.y;
        float t = u_time;
        
        // YOUR EXACT MATH
        float wave1 = sin(x * 0.08 + t) * cos(y * 0.12 + t * 0.5);
        float wave2 = sin(x * 0.05 - t * 0.7) * sin(y * 0.08 + t * 0.3);
        float wave3 = cos(x * 0.03 + y * 0.03 + t * 0.4);
        
        float combined = (wave1 + wave2 + wave3) / 3.0;
        float normalized = (combined + 1.0) / 2.0;
        
        // Pick character from the atlas
        float numChars = 5.0;
        float charIndex = floor(normalized * (numChars - 0.001));
        vec2 atlasUv = vec2((charIndex + cellUv.x) / numChars, cellUv.y);
        
        // Read the white/black pixel from our texture atlas
        vec4 texColor = texture2D(u_chars, atlasUv);
        
        // Calculate Color (Mapping your 170-200 hue range)
        float hue = 0.472 + (normalized * 0.083); // ~170 to ~200 degrees
        float lightness = 0.5 + (normalized * 0.3);
        float alpha = 0.3 + (normalized * 0.7);
        
        vec3 color = hsl2rgb(vec3(hue, 1.0, lightness));
        
        // texColor.r acts as our alpha mask (black background = 0, white text = 1)
        gl_FragColor = vec4(color, alpha) * texColor.r;
      }
    `;

    // 4. COMPILE WEBGL PROGRAM (Boilerplate)
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    
    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up a full-screen rectangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // 5. THE RENDER LOOP
    let animationId: number;
    let time = 0;
    let isVisible = false;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // We ONLY update the time variable. The GPU does the rest.
      gl.uniform1f(timeLocation, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      time += 0.03;
      animationId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; }, { threshold: 0 });
    observer.observe(canvas);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ imageRendering: "pixelated" }} />;
}