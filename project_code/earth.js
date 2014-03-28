/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var SPIN_ID = 0;



var DAT = DAT || {};

DAT.Globe = function (container, colorFn) {

    colorFn = colorFn || function (x) {
        var c = new THREE.Color();

        if (x > 30) x = 30;
        c.setHSV((0.6 - (x * 0.03)), 1.0, 1);
        return c;
    };

    var Shaders = {
        'earth': {
            uniforms: {
                'texture': { type: 't', value: 0, texture: null }
            },
            vertexShader: [
              'varying vec3 vNormal;',
              'varying vec2 vUv;',
              'void main() {',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                'vUv = uv;',
              '}'
            ].join('\n'),
            fragmentShader: [
              'uniform sampler2D texture;',
              'varying vec3 vNormal;',
              'varying vec2 vUv;',
              'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
              '}'
            ].join('\n')
        },
        'atmosphere': {
            uniforms: {},
            vertexShader: [
              'varying vec3 vNormal;',
              'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
              '}'
            ].join('\n'),
            fragmentShader: [
              'varying vec3 vNormal;',
              'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
              '}'
            ].join('\n')
        }
    };






    var ShadersMoon = {
        'moon': {
            uniforms: {
                'texture': { type: 't', value: 0, texture: null }
            },
            vertexShader: [
              'varying vec3 vNormal;',
              'varying vec2 vUv;',
              'void main() {',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                'vUv = uv;',
              '}'
            ].join('\n'),
            fragmentShader: [
              'uniform sampler2D texture;',
              'varying vec3 vNormal;',
              'varying vec2 vUv;',
              'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
              '}'
            ].join('\n')
        },
        'atmosphere': {
            uniforms: {},
            vertexShader: [
              'varying vec3 vNormal;',
              'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
              '}'
            ].join('\n'),
            fragmentShader: [
              'varying vec3 vNormal;',
              'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
              '}'
            ].join('\n')
        }
    };

    var camera, scene, sceneAtmosphere, renderer, w, h;
    var vector, earth_mesh, atmosphere, point;

    var overRenderer;

    var imgDir = 'skins/';

    var curZoomSpeed = 0;
    var zoomSpeed = 50;

    var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
    var rotation = { x: 0, y: 0 },
        target = { x: Math.PI * .7, y: Math.PI / 6.0 },
        targetOnDown = { x: 0, y: 0 };

    var distance = 100000, distanceTarget = 100000;
    var padding = 40;
    var PI_HALF = Math.PI / 2;
    var particles, particle, geo2;




    function addLight(h, s, l, x, y, z) {

        var light = new THREE.PointLight(0xffffff, 1.5, 4500);
       
        light.position.set(x, y, z);
        scene.addObject(light);



         
        imgDir2 = "images/"

        // lens flares 
        var textureFlare0 = THREE.ImageUtils.loadTexture(imgDir2 + "lensflare0.png");
        var textureFlare2 = THREE.ImageUtils.loadTexture(imgDir2 + "lensflare2.png");
        var textureFlare3 = THREE.ImageUtils.loadTexture(imgDir2 + "lensflare3.png");



        var flareColor = new THREE.Color(0xffffff);
        //flareColor.setHex(h, s, l + 0.5);


          
        var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
        lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);

        lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
        lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);

        lensFlare.customUpdateCallback = lensFlareUpdateCallback;
        lensFlare.position.set(x, y, z);



        scene.addObject(lensFlare); 
    }

    function lol() {
        alert("lol");
    }




    function init() {

        container.style.color = '#fff';
        container.style.font = '13px/20px Arial, sans-serif';

        var shader, uniforms, uniforms_moon, material_space;
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;

        camera = new THREE.Camera(
            30, w / h, 1, 10000);
        camera.position.z = distance;




        controls = new THREE.FlyControls(camera);

        controls.movementSpeed = 2500;
        controls.domElement = container;
        controls.rollSpeed = Math.PI / 6;
        controls.autoForward = false;
        controls.dragToLook = false

        /*
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 3500, 15000);
        scene.fog.color.setHex(1, 1, 1);
        */

        vector = new THREE.Vector3();

        scene = new THREE.Scene();
        sceneAtmosphere = new THREE.Scene();

        var geometry = new THREE.Sphere(200, 40, 30);

        shader = Shaders['earth'];

        var shadermoon = ShadersMoon['moon'];

        uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms_moon = THREE.UniformsUtils.clone(shadermoon.uniforms);

        // uniforms_moon['texture'].texture = THREE.ImageUtils.loadTexture("skins/" + "moon.jpg");

        var queryStringParameter = getParameterByName('lowres');

        if (queryStringParameter == "true") {
            worldimage = "low_res_nightsky.jpg";
        } else {
            worldimage = "high_res_nightsky.jpg";
        }



        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }


        uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir + worldimage);
        shadermoon.uniforms['texture'].texture = THREE.ImageUtils.loadTexture("skins/" + "moon.jpg");

        material_space = new THREE.MeshShaderMaterial({

            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });

      earth_mesh = new THREE.Mesh(geometry, material_space);
      earth_mesh.matrixAutoUpdate = false;
       scene.addObject(earth_mesh);

        shader = Shaders['atmosphere'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        earth_material = new THREE.MeshShaderMaterial({

            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader

        });






        mesh = new THREE.Mesh(geometry, earth_material);
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
        mesh.flipSided = true;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
       // sceneAtmosphere.addObject(mesh);

        geometry = new THREE.Cube(1.3,1.3, 1.3, 1);
        var geometry2 = new THREE.Cube(1, 1, 1, 1 );

        for (var i = 0; i < geometry.vertices.length; i++) {
            var vertex = geometry.vertices[i];
            vertex.position.z += 0.5;

        }
        for (var i = 0; i < geometry2.vertices.length; i++) {
            var vertex = geometry2.vertices[i];
            vertex.position.z += 0.5;
        }


    point = new THREE.Mesh(geometry);
        line = new THREE.Mesh(geometry2);




        //SPACE
      //  var stars = http://i.imgur.com/4YGnGBc.jpg;
        var stars = imgDir + "stars.jpg";

        var urls = [stars, stars,
               stars, stars,
                stars, stars];
        var textureCube = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderUtils.lib["cube"];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms['tCube'].texture = textureCube; // textureCube has been init before
        var material = new THREE.MeshShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: uniforms
        }); // build the skybox Mesh
        skyboxMesh = new THREE.Mesh(new THREE.Cube(10000, 10000, 10000, 1, 1, 1, null, true), material);
        // add it to the scene
        scene.addObject(skyboxMesh);

        //
        //
        //  LENS FLARE
        //
        //
        /*
        var ambient = new THREE.AmbientLight(0xffffff); ambient.color.setHex(0x444444);
        //   ambient.color.setHSL( 0.1, 0.3, 0.2 );
        scene.addObject(ambient);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
        //   dirLight.position.set(0, -1, 0).normalize();
        scene.addObject(dirLight);
        dirLight.color.setHex(0xffffff); //     dirLight.color.setHSL( 0.1, 0.7, 0.5 );
        dirLight.position.set(500,500, 1000);

        var textureFlare0 = THREE.ImageUtils.loadTexture("images/lensflare0.png");
        var textureFlare2 = THREE.ImageUtils.loadTexture("images/lensflare2.png");
        var textureFlare3 = THREE.ImageUtils.loadTexture("images/lensflare3.png");

        addLight(0.55, 0.9, 0.5, 5000, 0, -1000, scene);
        addLight(0.08, 0.8, 0.5, 0, 0, -1000, scene);
        addLight(0.995, 0.5, 0.9, 200, 2000, -1000, scene);
        addLight(0.995, 0.5, 0.9, 400, 400, 60, scene);
        addLight(0.995, 0.5, 0.9, 300, 400, 500, scene);
        addLight(0.995, 0.5, 0.9, 500, 1000, 400, scene);
        addLight(0.995, 0.5, 0.9, 400, 200, 500, scene);
        addLight(0.995, 0.5, 0.9, 500, 1000, 500, scene);
        addLight(0.995, 0.5, 0.9, 400, 300, 500, scene);

        //
        //  END LENS FLARE
        //
        */






















        /*
        //scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 3500, 15000);
      //  scene.fog.color.setHSL(0.51, 0.4, 0.01);
        scene.fog.color.setHex(0.51, 0.4, 0.01);
        // world

        var s = 250;

        var cube = new THREE.CubeGeometry(s, s, s);

         
        var material = new THREE.MeshPhongMaterial({ ambient: 0x333333, color: 0xffffff, specular: 0xffffff, shininess: 50 });


        for (var i = 0; i < 5000; i++) {

            var mesh = new THREE.Mesh(cube, material);

            mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
            mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
            mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);

            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;

            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();

            scene.addObject(mesh);

        }*/


        // lights

        var ambient = new THREE.AmbientLight(0xffffff);
        ambient.color.setHex(0.1, 0.3, 0.2);
        scene.addObject(ambient);


        var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
        dirLight.position.set(0, -1, 0).normalize();
        scene.addObject(dirLight);

        dirLight.color.setHex(0.1, 0.7, 0.5);
         
         /*
   addLight(0.55, 0.9, 0.5, 800, 0, 600); 
       
   addLight(0.55, 0.9, 0.5, 2000, 40, 30);
   addLight(0.08, 0.8, 0.5, 600, 40, 30);
   addLight(0.995, 0.5, 0.9, 500, 200, 30);
   addLight(0.995, 0.5, 0.9, 400, 300, 30);
   addLight(0.995, 0.5, 0.9, 3000,100, 30);
   addLight(0.995, 0.5, 0.9, 200, 40, 30); 
  
  */
         

        // renderer
        /*
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(scene.fog.color, 1);
        */
       // container.appendChild(renderer.domElement);

        //
        /*
        renderer.gammaInput = true;
        renderer.gammaOutput = true;

      */



         


        var oldtime;

        uniforms3 = {
            time: { type: "f", value: 1.0 },
            scale: { type: "f", value: 0.5 }
        };

        var material2 = new THREE.MeshShaderMaterial({

            uniforms: uniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent

        });

        var material_sun = new THREE.MeshShaderMaterial({

            uniforms: uniforms3,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent

        });

        mesh_sun = new THREE.Mesh(new THREE.SphereGeometry(190, 100, 60), material_sun);
        scene.addObject(mesh_sun);
        mesh_sun.position = new THREE.Vector3(-5000, 100, 50)

        shader = Shaders['atmosphere'];
        uniforms_moon = THREE.UniformsUtils.clone(shadermoon.uniforms);

        material_Moon = new THREE.MeshShaderMaterial({
            uniforms: uniforms_moon,
            vertexShader: shadermoon.vertexShader,
            fragmentShader: shadermoon.fragmentShader
        });

        var mesh_moon = new THREE.Mesh(new THREE.SphereGeometry(90, 50, 30), material_Moon);
        scene.addObject(mesh_moon);
        mesh_moon.position = new THREE.Vector3(-3000, 100, 100)

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.autoClear = false;
        renderer.setClearColorHex(0x000000, 0.0);
        renderer.setSize(w, h);

        renderer.domElement.style.position = 'absolute';

        container.appendChild(renderer.domElement);

        container.addEventListener('mousedown', onMouseDown, false);

        container.addEventListener('mousewheel', onMouseWheel, false);

        document.addEventListener('keydown', onDocumentKeyDown, false);

        window.addEventListener('resize', onWindowResize, false);

        container.addEventListener('mouseover', function () {
            overRenderer = true;
        }, false);

        container.addEventListener('mouseout', function () {
            overRenderer = false;
        }, false);




        SPIN_ID = setInterval(function () {

            rotate();

        }, 1000 / 60);

   // }

    addData = function (data, opts) {
        var lat, lng, size, color, i, step, colorFnWrapper;
        step = 3;
        colorFnWrapper = function (data, i) { return colorFn(data[i + 2]); }

        var subgeo = new THREE.Geometry();
        for (i = 0; i < data.length; i += step) {
            lat = data[i];
            lng = data[i + 1];
            color = colorFnWrapper(data, i);
            size = data[i + 2];
            size = size * 10;
            addPoint(lat, lng, size, color, subgeo);
        }
        this._baseGeometry = subgeo;

        }

 

        // renderer

        //    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        //    renderer.setSize( window.innerWidth, window.innerHeight );
        //     renderer.setClearColor( scene.fog.color, 1 );

        //      container.appendChild( renderer.domElement );

        //

        //     renderer.gammaInput = true;
        //      renderer.gammaOutput = true;
        //      renderer.physicallyBasedShading = true;

        // stats

        //      stats = new Stats();
        //     container.appendChild( stats.domElement );

        // events

        //      window.addEventListener( 'resize', onWindowResize, false );

    }

    //
    function lensFlareUpdateCallback(object) {

        var f, fl = object.lensFlares.length;
        var flare;
        var vecX = -object.positionScreen.x * 2;
        var vecY = -object.positionScreen.y * 2;


        for (f = 0; f < fl; f++) {

            flare = object.lensFlares[f];

            flare.x = object.positionScreen.x + vecX * flare.distance;
            flare.y = object.positionScreen.y + vecY * flare.distance;

            flare.rotation = 0;

        }

        object.lensFlares[2].y += 0.025;
        object.lensFlares[3].rotation = object.positionScreen.x * 0.5 +  (45 * Math.PI / 180);
     
    }




    function createPoints() {
        if (this._baseGeometry !== undefined) {

            this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                vertexColors: THREE.FaceColors,
                morphTargets: false
            }));
            scene.addObject(this.points);
        }
    }

    function addPoint(lat, lng, size, color, subgeo) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (180 - lng) * Math.PI / 180;
        var tsize = size;


        point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
        point.position.y = 200 * Math.cos(phi);
        point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

        point.lookAt(mesh.position);
        if (size > 50) {
            size = 50;
        }

        if (tsize > 100) {
            tsize = 100;
        }

  /*

        point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
        point.position.y = 200 * Math.cos(phi);
        point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

        point.lookAt(mesh.position);

        point.scale.z = .01;//-size + 100;


        //point.scale.x = size*.04;
        point.scale.x = 0.5;
        point.scale.y = 0.5;


        //point.scale.y = size * .04;
        point.updateMatrix();

        var i;
        for (i = 0; i < point.geometry.faces.length; i++) {

            point.geometry.faces[i].color = color;

        }
        */

        line.position.x = 200 * Math.sin(phi) * Math.cos(theta);
        line.position.y = 200 * Math.cos(phi);
        line.position.z = 200 * Math.sin(phi) * Math.sin(theta);

        line.lookAt(mesh.position);

        line.scale.z = -tsize;

        line.scale.x = size * .01;
        line.scale.y = size * .01;
        line.updateMatrix();

        if (!mute) {
            playcoin(size);
        }

        var i;
        for (i = 0; i < line.geometry.faces.length; i++) {

            line.geometry.faces[i].color = color;

        }


    //    GeometryUtils.merge(subgeo, point);
        GeometryUtils.merge(subgeo, line);




         


    }


    function playcoin(size) {
        var soundname = "coinsound";

        if (size < 10) {
            soundname += "1";
        }

        if (size > 10 && size < 50) {
            soundname += "2";
        }


        if (size >= 50) {
            soundname += "3";
        }


        //  alert(soundname + "  " + size);
        document.getElementById(soundname).play();

    }


    function onMouseDown(event) {
        event.preventDefault();

        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseout', onMouseOut, false);

        mouseOnDown.x = - event.clientX;
        mouseOnDown.y = event.clientY;

        targetOnDown.x = target.x;
        targetOnDown.y = target.y;

        container.style.cursor = 'move';
    }

    function onMouseMove(event) {
        mouse.x = - event.clientX;
        mouse.y = event.clientY;

        var zoomDamp = distance / 1000;

        target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
        target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

        target.y = target.y > PI_HALF ? PI_HALF : target.y;
        target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
    }

    function onMouseUp(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
        container.style.cursor = 'auto';
    }

    function onMouseOut(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
    }

    function onMouseWheel(event) {
        event.preventDefault();
        if (overRenderer) {
            zoom(event.wheelDeltaY * 0.3);
        }
        return false;
    }

    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 38:
                zoom(100);
                event.preventDefault();
                break;
            case 40:
                zoom(-100);
                event.preventDefault();
                break;
        }
    }

    function onWindowResize(event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    }

    function rotate() {

        target.x -= 0.00008;

    }
    function animate() {
        requestAnimationFrame(animate);
        render();
    }



var oldTime = new Date().getTime();

function render() {

    var time = new Date().getTime();
    var delta = 0.001 * (time - oldTime);
    oldTime = time;

    uniforms3.time.value += 7.275 * delta;
    mesh3.rotation.y += 0.5 * delta;
    mesh3.rotation.x += 0.1 * delta;
    renderer.render(scene, camera);

}



    function render() {
        zoom(curZoomSpeed);

        var time = new Date().getTime();
        var delta = 0.001 * (time - oldTime);
        oldTime = time;
         

      //  controls.update(xx); 



        rotation.x += (target.x - rotation.x) * 0.1;//0.1;
        rotation.y += (target.y - rotation.y) * 0.1;
        distance += (distanceTarget - distance) * 0.2;

        camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
        camera.position.y = distance * Math.sin(rotation.y);
        camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

        vector.copy(camera.position);
        uniforms3.time.value += 28.275 * delta;

        renderer.clear();

        renderer.render(scene, camera);
        renderer.render(sceneAtmosphere, camera);
    }

    init();
    this.animate = animate;
    this.addData = addData;
    this.createPoints = createPoints;
    this.renderer = renderer;
    this.scene = scene;

    return this;

};

