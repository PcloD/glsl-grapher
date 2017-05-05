(function() {
  "use strict";

  function makeFragmentShader(shaderFunc) {
    return `
      varying vec2 vUV;
      uniform vec3 overColor;
      uniform vec3 underColor;

      ${shaderFunc}

      void main() {
        float over = step(y(vUV.x), vUV.y); // 0 if under, 1 if over
        vec3 color = mix(underColor, overColor, over);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  }

  var GraphMaterial2D = function(options) {
    this.shaderFunc = options.shaderFunc;

    this.limits = options.limits;
    if (this.limits === undefined) {
      this.limits = new THREE.Box2(
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 1)
      );
    }

    this.overColor = options.overColor;
    if (this.overColor === undefined) {
      this.overColor = 0xffffff;
    }
    this.overColor = new THREE.Color(this.overColor);

    this.underColor = options.underColor;
    if (this.underColor === undefined) {
      this.underColor = 0x0000ff;
    }
    this.underColor = new THREE.Color(this.underColor);

    THREE.ShaderMaterial.call(this, {
      uniforms: {
        minLimit: {value: this.limits.min},
        maxLimit: {value: this.limits.max},
        overColor: {value: this.overColor},
        underColor: {value: this.underColor},
      },
      vertexShader: `
        varying vec2 vUV;
        uniform vec2 minLimit;
        uniform vec2 maxLimit;
        void main() {
          // Linear mapping to range:
          vUV = mix(minLimit, maxLimit, uv);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: makeFragmentShader(this.shaderFunc),
    });
  };

  GraphMaterial2D.prototype = Object.create(THREE.ShaderMaterial.prototype);

  GraphMaterial2D.prototype.setShaderFunc = function(shaderFunc) {
    this.shaderFunc = shaderFunc;
    this.fragmentShader = makeFragmentShader(this.shaderFunc);
    this.needsUpdate = true;
  }

  window.GraphMaterial2D = GraphMaterial2D;
})();
