import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from './node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './node_modules/three/examples/jsm/geometries/TextGeometry.js';


        
async function fetchData() {
    try {
        const response = await fetch(`/game/startGame/`, {
            method: 'GET',
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export class Game {
    constructor(mode, user_id) {
        this.user_id = user_id;
        this.lastInputTime = 0;
        this.ready = false;
        this.mode = mode;
        this.gameRunning = true;
        this.startMatch = false;
        this.init().then( gameData => {this.gameData = gameData
            this.players = gameData.players;
            this.ballData = gameData.ball;
            this.loader = new THREE.TextureLoader();
            this.fontloader = new FontLoader();
            this.font = 0;
            this.scene = new THREE.Scene();
            this.textMesh;
            this.fontloader.load('/static/gameFront/fonts/Neue_Qophins_Regular.json', (loadedFont) => {
                this.font = loadedFont;
            })
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.parentDev = document.getElementById('game-container')
            this.parentDev.appendChild(this.renderer.domElement);
            this.setupScene();
            this.setupControls();
            this.setupLights();
            this.setupGameObjects();
            this.setupEventListeners();
            this.createScoreDisplay();
            this.keys = {
                player1: { left: false, right: false },
                player2: { left: false, right: false }
            };
            if( this.mode == 'local' || this.mode == 'Ai')
            {
                this.startLocalGame();
                this.ready = true;
            }
            if(this.mode == 'online')
            {
                this.startOnlineGame();
                this.ready = true;
            }
            if(this.mode == 'Tournement')
            {
                this.startTournementGame();
                this.ready = true;
            }
            this.closeWebSocketOnButtonClick()
        });
    } 
    setupScene() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        if(this.mode == 'online')
            skyGeometry.rotateY(3 * Math.PI / 2);
        else
            skyGeometry.rotateY(Math.PI / 3);
        let texture = new THREE.TextureLoader().load('/static/gameFront/static/sphere.jpeg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        const skyMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            color: new THREE.Color(0.4, 0.3, 0.5), 
        });
        const skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        const partGeo = new THREE.BufferGeometry;
        const posArray = new Float32Array(1500 * 3);
        for(let i = 0; i < 1500 * 3; i++)
            posArray[i] = ( Math.random() - 0.5 ) * 30
        const fallSpeeds = new Float32Array(1500);
        for (let i = 0; i < 1500; i++) {
            fallSpeeds[i] = Math.random() * 0.05 + 0.01; 
        }
        const angles = new Float32Array( 1500 * 3);
        for (let i = 0; i <  1500 * 3; i++) {
            angles[i] = Math.random() * Math.PI / 2;
        }
        partGeo.setAttribute('fallSpeed', new THREE.BufferAttribute(fallSpeeds, 1));
        partGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        partGeo.setAttribute('angle', new THREE.BufferAttribute(angles, 3));

        const sakura = this.loader.load('/static/gameFront/static/sakura2.png')
        this.partMat = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: sakura },
                time: { value: 0 }
            },
            vertexShader: `
                attribute float angle;
                attribute float fallSpeed; // New attribute for individual falling speed
                uniform float time;
                varying float vAngle;

                void main() {
                    vAngle = angle + (sin(time * 0.5) * 2.5) * 0.08;  // Rotate over time

                    vec3 newPosition = position; 
                    newPosition.y -= fallSpeed * time; // Move down over time

                    // Reset when it falls below a threshold
                    if (newPosition.y < -10.0) {
                        newPosition.y += 20.0; // Reset back to the top
                    }

                    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
                    gl_PointSize = 0.4 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vAngle;
        
                void main() {
                    vec2 uv = gl_PointCoord - vec2(0.5); // Center the texture
                    float s = sin(vAngle), c = cos(vAngle);
                    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y) + vec2(0.5); // Rotate texture
                    gl_FragColor = texture2D(pointTexture, uv);
                    if (gl_FragColor.a < 0.2) discard; // Remove transparent pixels
                }
            `,
            transparent: true
        })
        
        // Load the model
        this.particles = new THREE.Points(partGeo, this.partMat);
        this.scene.add(this.particles);
        this.camera.position.z = 0;
        this.camera.position.x = 6;
        this.camera.position.y = 7.5;
        this.field =  new THREE.Mesh(
            new THREE.PlaneGeometry(5, 10),
            new THREE.MeshPhysicalMaterial({ color: 0x3B5D6C, clearcoat:0.2, clearcoatRoughness:0.4, metalness:0.9, roughness:0.5 , side: THREE.DoubleSide })
        );
        this.field.rotation.x = Math.PI / 2;
        this.field.receiveShadow = true;
        this.scene.add(this.field);
        const centerLine = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 0.1),
            new THREE.MeshBasicMaterial({ color: 0xEFE6DD, side: THREE.DoubleSide })
        );
        centerLine.rotation.x = Math.PI / 2;
        this.scene.add(centerLine);
        const wallGeometry = new THREE.BoxGeometry(0.5, 0.3, 10);
        const wallMaterial = new THREE.MeshPhysicalMaterial({ color: 0x5C677D, clearcoat:0.2, clearcoatRoughness:0.4, metalness:0.9, roughness:0.5 , side: THREE.DoubleSide });
        
        this.wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
        this.wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
        
        this.wallLeft.position.set(-2.75, 0.15, 0);
        this.wallRight.position.set(2.75, 0.15, 0);
        
        this.scene.add(this.wallLeft, this.wallRight, skybox);
    }
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xF4D35E, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xC8465F, 2);
        directionalLight.position.set(-5, 10, -2);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        this.renderer.shadowMap.enabled = true;
    }
    setupGameObjects() {
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(this.ballData.redius),
            new THREE.MeshPhysicalMaterial({
                color: 0xae0f22,
                clearcoat:1, clearcoatRoughness:0.2, metalness:0.7, roughness:0.1 
            })
        );
        

        this.ballDirLight = new THREE.DirectionalLight(0xff5400 , 8);
        this.ballLight = new THREE.PointLight(0xff4400 , 8);
        this.ball.add(this.ballLight)
        this.ball.add(this.ballDirLight )
        
 ;
        this.scene.add(this.ball);
        
        const paddleGeometry = new THREE.CapsuleGeometry(this.players.player1.paddleSizeY, this.players.player1.paddleSizeX, 15, 25)
        
        const loader = new GLTFLoader();
        loader.load(
            '/static/gameFront/static/scene.gltf',
            (gltf) => {
                this.paddle1spot = new THREE.SpotLight(0x1E90FF , 30, 4, Math.PI * 2.3, Math.PI / 2);
                this.paddle2spot = new THREE.SpotLight(0xFF0000 , 30, 4, Math.PI * 2.3, Math.PI / 2);
                this.paddle1 = gltf.scene;
                this.paddle2 = gltf.scene.clone();
                this.paddle1.scale.set(0.001, 0.001, 0.00076); 
                this.paddle1.position.set(0, 0, 0); 
                this.paddle1.rotation.set(0, Math.PI / 2, 0); 
                this.paddle2.scale.set(0.001, 0.001, 0.00076); 
                this.paddle2.position.set(0, 0, 0); 
                this.paddle2.rotation.set(0, -Math.PI / 2 , 0); 
                this.paddle1.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.color.set(0x7F6F3C);
                    }
                });
                this.paddle2.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.color.set(0x303A65);
                    }
                });

                this.paddle1.add(this.paddle1spot);
                this.paddle2.add(this.paddle2spot);

                this.scene.add(this.paddle1, this.paddle2);
            },
            undefined,
            (error) => {
                console.error('An error occurred while loading the model:', error);
            }
        );
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        if (this.mode === 'local' || this.mode === 'Tournement') {
            document.addEventListener('keydown', (e) => this.handleLocalKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleLocalKeyUp(e));
        } else {
            document.addEventListener('keydown', (e) => this.handleOnlineKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleOnlineKeyUp(e));
        }
    }

    handleLocalKeyDown(event) {
        switch(event.code) {
            case 'KeyA': this.keys.player1.left = true; break;
            case 'KeyD': this.keys.player1.right = true; break;
            case 'ArrowLeft': this.keys.player2.left = true; break;
            case 'ArrowRight': this.keys.player2.right = true; break;
        }
    }

    handleLocalKeyUp(event) {
        switch(event.code) {
            case 'KeyA': this.keys.player1.left = false; break;
            case 'KeyD': this.keys.player1.right = false; break;
            case 'ArrowLeft': this.keys.player2.left = false; break;
            case 'ArrowRight': this.keys.player2.right = false; break;
        }
    }

    handleOnlineKeyDown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            this.keys.player1[event.key === 'ArrowLeft' ? 'left' : 'right'] = true;
        }
    }

    handleOnlineKeyUp(event) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            this.keys.player1[event.key === 'ArrowLeft' ? 'left' : 'right'] = false;
        }
    }
    closeWebSocketOnButtonClick() {
        document.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () => {
                console.log("WebSocket closed.");
                if (this.ws && this.ws.readyState === WebSocket.OPEN)
                    this.ws.close();
            }, { once: true });
        });
    }
    startLocalGame(){

        this.ws = new WebSocket(`wss://${window.location.hostname}:5000/ws/pongLocal/`);
        
        this.ws.onopen = () => {
            console.log('Connected to game server');
            document.getElementById('waiting-screen').style.display = 'flex';
        };
        
        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'waiting') {
                // Already showing waiting screen
            }
            else if( data.type == 'endGame')
            {
                this.createWinMessage();
                this.winner.position.z = data.winner.z;
                this.winner.position.x = data.winner.x;
            }
            else if (data.type === 'match_found') {
                document.getElementById('waiting-screen').style.display = 'none';
                this.camera.position.z = 0;
                this.camera.position.x = 4.5;
                this.camera.position.y = 7;
                this.camera.lookAt(0, 0, 0);
                this.startMatch = false; 
                this.ws.send(JSON.stringify({ type: "start_game" })); 
                await this.createTimer();
            }
            else {

                if (!this.startMatch && data.ball) {

                    this.ballData.x = 0;
                    this.ballData.y = this.ballData.y;
                    this.ballData.z = 0;
                    return;
                }
                
                if (data.ball) {
                    this.ballData.x = data.ball.x;
                    this.ballData.y = data.ball.y;
                    this.ballData.z = data.ball.z;
                }
                
                if (data.players) {
                    if (data.players.player1) {
                        this.players.player1.x = data.players.player1.x;
                    }
                    if (data.players.player2) {
                        this.players.player2.x = data.players.player2.x;
                    }
                    this.updateScoreDisplay(data.players.player1.score, data.players.player2.score, "Player 1", "Player 2", true);
                }
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from game server');
            document.getElementById('waiting-screen').style.display = 'none';
            this.gameRunning = false;
        };
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    startOnlineGame(){

        this.ws = new WebSocket(`wss://${window.location.hostname}:5000/ws/pongOnline/${this.user_id}`);

        this.ws.onopen = () => {
            console.log('Connected to game server');
            document.getElementById('waiting-screen').style.display = 'flex';
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'waiting') {
                // Already showing waiting screen
            }
            else if(data.type === 'error')
            {
                document.getElementById('waiting-screen').textContent = data.message;
                document.getElementById('waiting-screen').style.display = 'flex';
                await this.sleep(3000);
                document.getElementById('waiting-screen').style.display = 'none';
                window.location.hash = "home";
            }
            else if( data.type == 'endGame')
            {
                this.createWinMessage();
                this.winner.position.z = data.winner.z;
                this.winner.position.x = data.winner.x;
            }
            else if (data.type === 'match_found') {
                document.getElementById('waiting-screen').style.display = 'none';
                this.playerId = data.player;
                
                if (this.playerId === 'player2') {
                    this.camera.position.z = -7.9;
                    this.camera.position.y = 1.5;
                    this.camera.position.x = 0;
                    this.camera.lookAt(0, 0, 0);
                } else {
                    this.camera.position.z = 7.9;
                    this.camera.position.y = 1.5;
                    this.camera.position.x = 0;
                    this.camera.lookAt(0, 0, 0);
                }
                this.startMatch = false; 
                await this.createTimer();
                this.ws.send(JSON.stringify({ type: "start_game" }));
            }
            else {
              
                if (!this.startMatch && data.ball) {
                 
                    this.ballData = { 
                        x: 0, 
                        y: this.ballData ? this.ballData.y : 0.5, 
                        z: 0 
                    };
                    return;
                }
                
            
                if (data.ball) {
                        this.ballData = { x: data.ball.x, y: data.ball.y, z: data.ball.z };
                
                }

                if (data.players) {
                    if (data.players.player1) {
                        this.players.player1.x = data.players.player1.x;
                    }
                    if (data.players.player2) {
                        this.players.player2.x = data.players.player2.x;
                    }
                    this.updateScoreDisplay(data.players.player1.score, data.players.player2.score, data.players.player1.name , data.players.player2.name, false);
                }
            }
        };

        this.ws.onclose = (e) => {
            console.log('Disconnected from game server');
            document.getElementById('waiting-screen').style.display = 'none';
            this.gameRunning = false;
        };
    }
    startTournementGame(){
        this.ws = new WebSocket(`wss://${window.location.hostname}:5000/ws/pongTournement/`);
        this.ws.onopen = () => {
            this.injectNicknameModal();
        };

        this.ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'waiting') {
                // Already showing waiting screen
            }
            else if( data.type == 'endGame' || data.type == 'endTournament')
            {
                this.createWinMessage();
                this.winner.position.z = data.winner.z;
                this.winner.position.x = data.winner.x;
                this.scene.add(this.winner);
            }
            else if (data.type === 'match_found') {
                this.camera.position.z = 0;
                this.camera.position.x = 4.5;
                this.camera.position.y = 7;
                this.camera.lookAt(0, 0, 0);
                if(this.winner)
                    this.scene.remove(this.winner);
                document.getElementById('waiting-screen').style.display = 'none';
                if(data.matchType)
                {
                    if (this.matchText)
                        this.scene.remove(this.matchText);
                    this.matchTypeText(data.matchType);
                }
                this.startMatch = false; 
                await this.createTimer();
            }
            else {
           
                if (!this.startMatch && data.ball) {
                    this.ballData.x = 0;
                    this.ballData.y = this.ballData.y;
                    this.ballData.z = 0;
                    return;
                }
                
                if (data.ball) {
                    this.ballData.x = data.ball.x;
                    this.ballData.y = data.ball.y;
                    this.ballData.z = data.ball.z;
                }
                
                if (data.players) {
                    const playerKeys = Object.keys(data.players);
                    if (playerKeys.length >= 2) {
                        this.players.player1.score = data.players[playerKeys[0]].score
                        this.players.player2.score = data.players[playerKeys[1]].score
                        this.players.player1.nickname = data.players[playerKeys[0]].nickname
                        this.players.player2.nickname = data.players[playerKeys[1]].nickname
                        this.players.player1.x = data.players[playerKeys[0]].x;
                        this.players.player2.x = data.players[playerKeys[1]].x;
                    }
                    this.updateScoreDisplay(this.players.player1.score, this.players.player2.score, this.players.player1.nickname , this.players.player2.nickname, true);
                }
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from game server');
            document.getElementById('waiting-screen').style.display = 'none';
            this.gameRunning = false;
        };
    }
    injectNicknameModal() {

        const existingModal = document.getElementById("nicknameModal");
        if (existingModal) existingModal.remove();
 
        const modal = document.createElement("div");
        modal.id = "nicknameModal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(0, 0, 0, 0.7)";
        modal.style.display = "flex";
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
        modal.style.fontFamily = "Arial, sans-serif";
        modal.style.zIndex = 100;

        const modalBox = document.createElement("div");
        modalBox.style.background = "#1a0f14";
        modalBox.style.padding = "20px";
        modalBox.style.borderRadius = "10px";
        modalBox.style.textAlign = "center";
        modalBox.style.width = "350px";
        modalBox.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.3)";

        const title = document.createElement("h2");
        title.innerText = "Enter Player Nicknames";
        title.style.color = "rgb(140, 75, 90)"

        const inputFields = [];
        for (let i = 1; i <= 4; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Player ${i}`;
            input.maxLength = 10;
            input.style.width = "90%";
            input.style.padding = "10px";
            input.style.margin = "8px 0";
            input.style.border = "1px solid #c8465f";
            input.style.borderRadius = "5px";
            input.style.textAlign = "center";
            input.style.fontSize = "16px";
            input.style.background = "#3d232b";
    
            inputFields.push(input);
            modalBox.appendChild(input);
        }

        const errorMsg = document.createElement("p");
        errorMsg.style.color = "red";
        errorMsg.style.fontSize = "14px";
        errorMsg.style.display = "none";
        modalBox.appendChild(errorMsg);

        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "center"; 
        buttonContainer.style.marginTop = "15px";

        const startButton = document.createElement("button");
        startButton.innerText = "Start";
        startButton.style.padding = "12px 20px";
        startButton.style.border = "none";
        startButton.style.borderRadius = "5px";
        startButton.style.cursor = "pointer";
        startButton.style.fontSize = "16px";
        startButton.style.backgroundColor = "#c8465f";
        startButton.style.color = "white";
        startButton.style.fontWeight = "bold";
    
        startButton.onclick = () => {
            const nicknames = inputFields.map(input => input.value.trim());
    
            if (nicknames.some(name => name.length === 0 || name.length > 10)) {
                errorMsg.innerText = "Nicknames must be 1-10 characters long!";
                errorMsg.style.display = "block";
                return;
            }
            const uniqueNicknames = new Set(nicknames);
            if (uniqueNicknames.size !== nicknames.length) {
                errorMsg.innerText = "Nicknames must be unique!";
                errorMsg.style.display = "block";
                return;
            }
            this.ws.send(JSON.stringify({
                type: "set_nickname",
                nickname1: nicknames[0],
                nickname2: nicknames[1],
                nickname3: nicknames[2],
                nickname4: nicknames[3]
            }));
    
            document.body.removeChild(modal);
        };
        buttonContainer.appendChild(startButton);
        modalBox.appendChild(title);
        modalBox.appendChild(buttonContainer);
        modal.appendChild(modalBox);
        document.body.appendChild(modal);
    }
    
    
    sendInput() {
        if (!this.startMatch) return; 
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            if (this.mode === 'online' || this.mode == 'Ai')
                if(this.playerId == 'player2')
                {
                    this.ws.send(JSON.stringify({
                        mode: this.mode,
                        downKey: this.keys.player1.right,
                        upKey: this.keys.player1.left
                    }));
                }
                else
                {
                    this.ws.send(JSON.stringify({
                        mode: this.mode,
                        upKey: this.keys.player1.right,
                        downKey: this.keys.player1.left
                    }));
                }
            else if (this.mode === 'local' || this.mode == 'Tournement')
                this.ws.send(JSON.stringify({
                    upKey1: this.keys.player1.right,
                    downKey1: this.keys.player1.left,
                    upKey2: this.keys.player2.right,
                    downKey2: this.keys.player2.left,
                    
                }));
        }
    }
    matchTypeText(matchType)
    {
        if(!this.font)
            return;
        let textGeo = new TextGeometry(matchType, {font : this.font, size: 0.5 , depth : 0.1});
        this.matchText = new THREE.Mesh(textGeo, new THREE.MeshPhysicalMaterial({color: 0xF0E0FC, emissiveIntensity: 0.5,
            clearcoat: 1,clearcoatRoughness: 0.2,metalness: 0.7,roughness: 0.1}))
        if( matchType == 'FINAL')
        {
            this.matchText.scale.set(1.9, 1.9, 1);
            this.matchText.position.set(0, 4.4, 0);
        }
        else
            this.matchText.position.set(0, 4.2, 0);
        this.matchText.geometry.center();
        this.matchText.rotation.y += Math.PI /2
        this.scene.add(this.matchText)
    }
    createTimer() {
        return new Promise((resolve) => {
            if (!this.font) {
                console.warn("Font not loaded yet, waiting...");
                const checkFontInterval = setInterval(() => {
                    if (this.font) {
                        clearInterval(checkFontInterval);
                        this.createTimer().then(resolve);
                    }
                }, 100);
                return;
            }
            
            let sec = 3;
            let timerMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xF4D35E,
                emissive: 0xF4D35E,
                emissiveIntensity: 0.5,
                clearcoat: 1,
                clearcoatRoughness: 0.2,
                metalness: 0.7,
                roughness: 0.1
            });
            this.startMatch = false;
    
            if (!this.intervalSet) {
                this.timerText = new TextGeometry(`${sec}`, { font: this.font, size: 2, depth: 0.05 });
                this.timerText.center();
                this.timer = new THREE.Mesh(this.timerText, timerMaterial);
                this.timer.position.y += 1;
    
                if (this.mode != 'online') {
                    this.timer.rotation.y += Math.PI / 2;
                    this.timer.position.z += 0.1;
                }
                else
                {
                    if(this.playerId == 'player2')
                        this.timer.rotation.y += Math.PI;
                }
    
                this.scene.add(this.timer);
                this.intervalSet = true;
                const timerLight = new THREE.PointLight(0xF4D35E, 2, 10);
                timerLight.position.set(0, 0, 2);
                this.timer.add(timerLight);
    
                let interval = setInterval(() => {
                    sec--;
                    
                    if (sec === 0) {
                        let goTextGeometry = new TextGeometry(`GO`, { font: this.font, size: 2, depth: 0.05 });
                        goTextGeometry.center();
                        this.timer.geometry.dispose();
                        this.timer.geometry = goTextGeometry; 
                        this.timer.material.color.set(0xC8465F);
                        this.timer.material.emissive.set(0xC8465F);
                        setTimeout(() => {
                            this.scene.remove(this.timer);
                            this.intervalSet = false;
                            this.startMatch = true;
                            resolve(true);
                        }, 1000);
                        
                        clearInterval(interval);
                    } else {
                        let newTextGeometry = new TextGeometry(`${sec}`, { font: this.font, size: 2, depth: 0.05 });
                        newTextGeometry.center();
                        this.timer.geometry.dispose();
                        this.timer.geometry = newTextGeometry;
                    }
                }, 1000);
            }
        });
    }
    
    createWinMessage()
    {
        if (!this.font) return;
        if (this.winner) return;
        let winLight = new THREE.PointLight(0x00FF00, 20, 20, 5);
        let winDirLight = new THREE.DirectionalLight(0x00FF00, 10);
        this.win = new THREE.Group();
        this.winText = new TextGeometry("WINNER", {
            font: this.font,
            size: 0.5,
            depth: 0.05
        });
        this.winText.computeBoundingBox();
        this.winner = new THREE.Mesh(this.winText, new THREE.MeshPhysicalMaterial({ color: 0x00FF00,clearcoat:1, clearcoatRoughness:0.2, metalness:0.7, roughness:0.1  }));
        const textWidth = this.winText.boundingBox.max.x - this.winText.boundingBox.min.x;
        this.winner.position.set(-textWidth/2, 0, 0);
        this.winner.scale.set(0, 0, 0);
        this.winner.add(winLight);
        this.winner.add(winDirLight);
        this.scene.add(this.winner);
        this.winMessageAnimation()
    }
    winMessageAnimation() {
        if (!this.winner) return;
    
        let scaleUp = true;
        let scale = 1;
        this.winner.geometry.center(); 
        this.winner.position.y = 1
        const animate = () => {
            if (!this.winner) return;
    
            if (scaleUp) {
                scale += 0.08; 
                if (scale >= 1.7) 
                    scaleUp = false; 
                this.winner.scale.set(scale, scale, scale);
            } else {
                scale -= 0.08; 
                if (scale <= 1.5) {
                    this.winner.scale.set(1.5, 1.5, 1.5);
                }
            }
            this.winner.rotation.y += 0.03;
            requestAnimationFrame(animate);
        };
    
        requestAnimationFrame(animate);
    }
    

    createScoreDisplay() {
        this.boardLight = new THREE.DirectionalLight(0x69FFFF, 2);
        this.scoreBoard = new THREE.Group();
        this.scoreBoard.position.set(0, 3.5, 0);
        if(this.mode === 'online')
        {
            this.boardLight.position.set(0, 15, 10);
            this.boardclone = this.scoreBoard.clone().rotateZ(Math.PI);
        }
        else
        {
            this.boardLight.position.set(5, 20, 0);
            this.boardclone = this.scoreBoard.clone().rotateZ(-Math.PI / 2);
        }
        this.boardclone.add(this.boardLight);
        this.scene.add(this.boardclone)
        this.scene.add(this.scoreBoard);

        const baseGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xEFE6DD,
            metalness: 0.9,
            roughness: 0.2,
            envMap: this.scene.environment,
            emissive: 0x222222,
            emissiveIntensity: 0.5
        });
        
        const scoreBase = new THREE.Mesh(baseGeometry, baseMaterial);
        this.scoreBoard.add(scoreBase);

        const scoreboardLight = new THREE.SpotLight(0xF4D35E, 2);
        scoreboardLight.position.set(0, 1, 2);
        scoreboardLight.target = scoreBase;
        scoreboardLight.angle = Math.PI / 4;
        scoreboardLight.penumbra = 0.3;
        this.scoreBoard.add(scoreboardLight);
   
        const scoreboardAmbient = new THREE.AmbientLight(0xEFE6DD, 1);
        this.scoreBoard.add(scoreboardAmbient);

        const dividerGeometry = new THREE.PlaneGeometry(0.05, 0.6);
        const dividerMaterial = new THREE.MeshBasicMaterial({
            color: 0xF4D35E,
            transparent: true,
            opacity: 0.8
        });
        
        const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
        divider.position.set(0, 0, 0.051);
        this.scoreBoard.add(divider);

        this.player1ScoreText = new THREE.Group();
        this.player2ScoreText = new THREE.Group();
        
        this.player1ScoreText.position.set(-0.7, 0, 0.051);
        this.player2ScoreText.position.set(0.7, 0, 0.051);
        
        this.scoreBoard.add(this.player1ScoreText);
        this.scoreBoard.add(this.player2ScoreText);
        
        this.updateScoreDisplay(0, 0, "rayan", "Player 2");
        
        const team1Color = new THREE.Mesh(
            new THREE.PlaneGeometry(1.45, 0.1),
            new THREE.MeshBasicMaterial({ color:0x1E90FF })
        );
        
        const team2Color = new THREE.Mesh(
            new THREE.PlaneGeometry(1.45, 0.1),
            new THREE.MeshBasicMaterial({ color:  0xFF0000 })
        );
        
        team1Color.position.set(-0.75, 0.35, 0.051);
        team2Color.position.set(0.75, 0.35, 0.051);
        
        this.scoreBoard.add(team1Color);
        this.scoreBoard.add(team2Color);
    }
    updateScoreDisplay(score1, score2, player1Name = "Player 1", player2Name = "Player 2", isLocal) {
        if (!this.font) return;
        

        if(this.mode === 'Ai')
        {
            player1Name = 'YOU';
            player2Name = 'AI';
        }
        while (this.player1ScoreText.children.length > 0) {
            this.player1ScoreText.remove(this.player1ScoreText.children[0]);
        }
        
        while (this.player2ScoreText.children.length > 0) {
            this.player2ScoreText.remove(this.player2ScoreText.children[0]);
        }


        const score1Material = new THREE.MeshStandardMaterial({
            color: 0x1E90FF,
            metalness: 0.9,
            roughness: 0.3,
        });
        
        const score1Geometry = new TextGeometry(score1.toString(), {
            font: this.font,
            size: 0.4,
            depth: 0.05
        });
        
        score1Geometry.computeBoundingBox();
        const score1Width = score1Geometry.boundingBox.max.x - score1Geometry.boundingBox.min.x;
        
        const score1Mesh = new THREE.Mesh(score1Geometry, score1Material);
        score1Mesh.position.set(-score1Width/2, 0, 0);
        this.player1ScoreText.add(score1Mesh);
        
        const name1Geometry = new TextGeometry(player1Name, {
            font: this.font,
            size: 0.13,
            depth: 0.02
        });
        
        name1Geometry.computeBoundingBox();
        const name1Width = name1Geometry.boundingBox.max.x - name1Geometry.boundingBox.min.x;
        
        const name1Mesh = new THREE.Mesh(name1Geometry, new THREE.MeshBasicMaterial({ color: 0xF4D3C0  }));
        name1Mesh.position.set(-name1Width/2, -0.25, 0);
        this.player1ScoreText.add(name1Mesh);
        const score2Material = new THREE.MeshStandardMaterial({
            color:  0xFF0000,
            metalness: 0.9,
            roughness: 0.3,
        });
        
        const score2Geometry = new TextGeometry(score2.toString(), {
            font: this.font,
            size: 0.4,
            depth: 0.05
        });
        
        score2Geometry.computeBoundingBox();
        const score2Width = score2Geometry.boundingBox.max.x - score2Geometry.boundingBox.min.x;
        
        const score2Mesh = new THREE.Mesh(score2Geometry, score2Material);
        score2Mesh.position.set(-score2Width/2, 0, 0);
        this.player2ScoreText.add(score2Mesh);
        
        const name2Geometry = new TextGeometry(player2Name, {
            font: this.font,
            size: 0.13,
            depth: 0.02
        });
        
        name2Geometry.computeBoundingBox();
        const name2Width = name2Geometry.boundingBox.max.x - name2Geometry.boundingBox.min.x;
        
        const name2Mesh = new THREE.Mesh(name2Geometry, new THREE.MeshBasicMaterial({ color: 0xF4D3C0  }));
        name2Mesh.position.set(-name2Width/2, -0.25, 0);
        this.player2ScoreText.add(name2Mesh);
        if (isLocal)
        {
            this.scoreBoard.rotation.y = Math.PI / 2;
        }
        if(this.playerId === 'player2' && !isLocal)
            this.scoreBoard.rotation.y = Math.PI
            this.boardLight.position.set(10, 15, 10);
    }
    resize(width, height) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
    async init() {
        console.log("Fetching ball data...");
        const gameData = await fetchData();
        return gameData
    }
    render() {
        if (!this.ready) return;
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        
        if (!this.ready) return;
        const anyKeysPressed = this.keys.player1.left || this.keys.player1.right || 
        this.keys.player2.left || this.keys.player2.right;
        this.partMat.uniforms.time.value += 0.1;
        this.ball.position.set(
            this.ballData.x,
            this.ballData.y,
            this.ballData.z
        );

        if (this.paddle1)
            this.paddle1.position.set(
                this.players.player1.x,
                this.players.player1.y,
                this.players.player1.z
            );
        if (this.paddle1)
            this.paddle2.position.set(
                this.players.player2.x,
                this.players.player2.y,
                this.players.player2.z
            );
        if(anyKeysPressed || this.mode != "online")
            this.sendInput();
        this.controls.update();

    }
    cleanup() {
        if (this.ws) {
            this.ws.close();
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.renderer) {
            this.renderer.dispose();
            this.parentDev.removeChild(this.renderer.domElement);
        }
    }
}