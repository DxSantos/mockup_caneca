let scene, camera, renderer, controls;
let mugMaterials = [];       // Guarda todas as partes de cerâmica de todas as canecas
let paperMaterials = [];     // Guarda os papéis no chão
let mainLight;

// Valores Padrão da Imagem de Referência (Porcelana)
const materialSettings = {
    reflectivity: 0.7, // Intensidade do brilho especular (0.0 a 2.0)
    roughness: 0.0,    // Rugosidade da superfície (0.0 a 1.0)
    metalness: 0.0,    // Quantidade de metalicidade (0.0 a 1.0)
    opacity: 1.0       // Transparência (0.0 a 1.0)
};

// Guarda as cores atuais selecionadas para cada parte
const partColors = {
    handle: '#ffffff',
    interior: '#ffffff',
    body: '#ffffff',
    bottom: '#ffffff',
    rim: '#ffffff'
};

function init3D() {
    const container = document.getElementById('canvas-container');
    
    // 1. Cena e Câmera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0d0d0);

    camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 16.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Habilita gerenciamento de cores e contraste cinematográfico (Pretos profundos)
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Controles de Órbita 360°
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -0.2, 0);

    // 3. Iluminação de Estúdio Ajustada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    mainLight = new THREE.DirectionalLight(0xffffff, materialSettings.reflectivity);
    mainLight.position.set(8, 20, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-10, 12, -8);
    scene.add(fillLight);

    // 4. Mesa de Madeira
    createWoodenTable();

    // 5. Papéis/Moldes da Arte Cruzados no Chão
    createArtworkPapers();

    // 6. Instanciar as 3 Canecas (Esquerda, Centro, Direita)
    createMugGroup(-4.2, 0, -2, 0);                 // Esquerda
    createMugGroup(0, 0, -4, -Math.PI / 2);          // Centro
    createMugGroup(4.2, 0, -2, Math.PI);             // Direita

    // 7. Inicializar ouvintes dos Controles
    setupMaterialControls();
    setupColorControls();

    window.addEventListener('resize', onWindowResize);
    animate();
}

/**
 * Registra os ouvintes para alteração dinâmica de cores por parte
 */
function setupColorControls() {
    const bindColor = (id, key, meshName) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const newColor = e.target.value;
                partColors[key] = newColor;

                mugMaterials.forEach(mesh => {
                    if (mesh.name === meshName) {
                        mesh.material.color.setStyle(newColor);
                        mesh.material.needsUpdate = true;
                    }
                });
            });
        }
    };

    bindColor('colorHandle', 'handle', 'handleMesh');
    bindColor('colorInterior', 'interior', 'innerBody');
    bindColor('colorInterior', 'interior', 'innerBottom');
    bindColor('colorBody', 'body', 'outerBody');
    bindColor('colorBottom', 'bottom', 'bottomBase');
    bindColor('colorRim', 'rim', 'rimMesh');
}

/**
 * Registra os ouvintes de eventos para alterar as propriedades materiais em tempo real
 */
function setupMaterialControls() {
    const inputReflectivity = document.getElementById('inputReflectivity');
    const inputRoughness = document.getElementById('inputRoughness');
    const inputMetalness = document.getElementById('inputMetalness');
    const inputOpacity = document.getElementById('inputOpacity');

    if (inputReflectivity) {
        inputReflectivity.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('valReflectivity').innerText = val;
            materialSettings.reflectivity = val;
            
            if (mainLight) {
                mainLight.intensity = 0.2 + (val * 0.65);
            }
            
            updateAllMaterials();
        });
    }

    if (inputRoughness) {
        inputRoughness.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('valRoughness').innerText = val;
            materialSettings.roughness = val;
            updateAllMaterials();
        });
    }

    if (inputMetalness) {
        inputMetalness.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('valMetalness').innerText = val;
            materialSettings.metalness = val;
            updateAllMaterials();
        });
    }

    if (inputOpacity) {
        inputOpacity.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById('valOpacity').innerText = val;
            materialSettings.opacity = val;
            updateAllMaterials();
        });
    }
}

/**
 * Atualiza o brilho, especularidade e resposta à luz mantendo as cores selecionadas
 */
function updateAllMaterials() {
    const val = materialSettings.reflectivity;

    mugMaterials.forEach((mesh) => {
        if (mesh && mesh.material) {
            const calculatedRoughness = Math.max(0, Math.min(1, (1 - val) + materialSettings.roughness));
            mesh.material.roughness = calculatedRoughness;
            mesh.material.metalness = materialSettings.metalness;
            mesh.material.opacity = materialSettings.opacity;
            mesh.material.transparent = materialSettings.opacity < 1.0;
            mesh.material.needsUpdate = true;
        }
    });
}

/**
 * Cria os dois papéis empilhados no chão
 */
function createArtworkPapers() {
    paperMaterials = [];
    
    const paperWidth = 10.8;
    const paperHeight = 4.0;
    const paperGeo = new THREE.PlaneGeometry(paperWidth, paperHeight);

    const paperMat1 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        side: THREE.DoubleSide
    });
    const paperMesh1 = new THREE.Mesh(paperGeo, paperMat1);
    paperMesh1.rotation.x = -Math.PI / 2;
    paperMesh1.rotation.z = 0.08;
    paperMesh1.position.set(-0.3, -2.23, 2.7);
    paperMesh1.receiveShadow = true;
    paperMesh1.castShadow = true;
    scene.add(paperMesh1);
    paperMaterials.push(paperMat1);

    const paperMat2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        side: THREE.DoubleSide
    });
    const paperMesh2 = new THREE.Mesh(paperGeo, paperMat2);
    paperMesh2.rotation.x = -Math.PI / 2;
    paperMesh2.rotation.z = -0.06;
    paperMesh2.position.set(0.3, -2.21, 2.5);
    paperMesh2.receiveShadow = true;
    paperMesh2.castShadow = true;
    scene.add(paperMesh2);
    paperMaterials.push(paperMat2);
}

/**
 * Cria a mesa de madeira
 */
function createWoodenTable() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3e230d';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 600; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(20, 10, 3, 0.09)' : 'rgba(110, 60, 25, 0.09)';
        const y = Math.random() * 512;
        const h = Math.random() * 3 + 1;
        ctx.fillRect(0, y, 512, h);
    }

    const tableTexture = new THREE.CanvasTexture(canvas);
    tableTexture.wrapS = THREE.RepeatWrapping;
    tableTexture.wrapT = THREE.RepeatWrapping;
    tableTexture.repeat.set(4, 4);

    const tableGeo = new THREE.PlaneGeometry(60, 60);
    const tableMat = new THREE.MeshStandardMaterial({
        map: tableTexture,
        roughness: 0.5,
        metalness: 0.1
    });

    const table = new THREE.Mesh(tableGeo, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -2.25;
    table.receiveShadow = true;
    scene.add(table);
}

/**
 * Constrói a Caneca em 3D Realista
 */
function createMugGroup(x, y, z, rotationY) {
    const group = new THREE.Group();

    const createCeramicMat = (colorHex) => new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(colorHex || 0xffffff),
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9,
        side: THREE.DoubleSide
    });

    // 1. Corpo Externo da Caneca
    const outerGeo = new THREE.CylinderGeometry(2.0, 2.0, 4.5, 64, 1, true);
    const outerMesh = new THREE.Mesh(outerGeo, createCeramicMat(partColors.body));
    outerMesh.name = 'outerBody';
    outerMesh.castShadow = true;
    outerMesh.receiveShadow = true;
    group.add(outerMesh);
    mugMaterials.push(outerMesh);

    // 2. Fundo Inferior Externo
    const bottomBaseGeo = new THREE.CircleGeometry(2.0, 64);
    const bottomBaseMesh = new THREE.Mesh(bottomBaseGeo, createCeramicMat(partColors.bottom));
    bottomBaseMesh.name = 'bottomBase';
    bottomBaseMesh.rotation.x = Math.PI / 2;
    bottomBaseMesh.position.y = -2.25;
    bottomBaseMesh.receiveShadow = true;
    group.add(bottomBaseMesh);
    mugMaterials.push(bottomBaseMesh);

    // 3. Interior da Caneca
    const innerGeo = new THREE.CylinderGeometry(1.85, 1.85, 4.35, 64, 1, true);
    const innerMesh = new THREE.Mesh(innerGeo, createCeramicMat(partColors.interior));
    innerMesh.name = 'innerBody';
    innerMesh.position.y = 0.08;
    group.add(innerMesh);
    mugMaterials.push(innerMesh);

    // 4. Fundo Interno da Cavidade
    const innerBottomGeo = new THREE.CircleGeometry(1.85, 64);
    const innerBottomMesh = new THREE.Mesh(innerBottomGeo, createCeramicMat(partColors.interior));
    innerBottomMesh.name = 'innerBottom';
    innerBottomMesh.rotation.x = -Math.PI / 2;
    innerBottomMesh.position.y = -2.1;
    group.add(innerBottomMesh);
    mugMaterials.push(innerBottomMesh);

    // 5. Borda Superior Curvada
    const rimGeo = new THREE.TorusGeometry(1.925, 0.075, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, createCeramicMat(partColors.rim));
    rimMesh.name = 'rimMesh';
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 2.25;
    group.add(rimMesh);
    mugMaterials.push(rimMesh);

    // 6. Alça de Cerâmica Anatômica
    const handleCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-1.95, 1.60, 0),
        new THREE.Vector3(-3.85, 1.90, 0),
        new THREE.Vector3(-3.85, -1.90, 0),
        new THREE.Vector3(-1.95, -1.60, 0)
    );

    const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.2, 20, false);
    handleGeo.scale(1.0, 1.0, 1.90);

    const handleMesh = new THREE.Mesh(handleGeo, createCeramicMat(partColors.handle));
    handleMesh.name = 'handleMesh';
    handleMesh.castShadow = true;
    handleMesh.receiveShadow = true;
    group.add(handleMesh);
    mugMaterials.push(handleMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    scene.add(group);
    return group;
}

/**
 * Aplica e Ajusta a Estampa na parede externa e opcionalmente na alça (60x10 mm)
 */
function updateMugTexture(imageUrl, handleImageUrl) {
    // Garante que o renderizador já existe antes de ler as capacidades do WebGL
    if (!renderer) return;

    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(imageUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        if (renderer && renderer.capabilities) {
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        }

        const mugTexture = texture.clone();
        mugTexture.offset.x = 0.25;
        mugTexture.repeat.set(1, 1);
        mugTexture.needsUpdate = true;

        mugMaterials.forEach((mesh) => {
            if (mesh.name === 'outerBody') {
                mesh.material.map = mugTexture;
                mesh.material.side = THREE.FrontSide;
                mesh.material.needsUpdate = true;
            }
        });

        paperMaterials.forEach((paperMat) => {
            const paperTex = texture.clone();
            paperTex.offset.set(0, 0);
            paperTex.repeat.set(1, 1);
            paperTex.needsUpdate = true;

            paperMat.map = paperTex;
            paperMat.color.setHex(0xffffff);
            paperMat.needsUpdate = true;
        });
    });

    if (handleImageUrl) {
        textureLoader.load(handleImageUrl, (handleTexture) => {
            handleTexture.wrapS = THREE.ClampToEdgeWrapping;
            handleTexture.wrapT = THREE.ClampToEdgeWrapping;
            handleTexture.colorSpace = THREE.SRGBColorSpace;
            
            handleTexture.rotation = 0;
            handleTexture.repeat.set(1.5, 4.6);
            handleTexture.offset.set(-0.25, -3);
            handleTexture.needsUpdate = true;

            mugMaterials.forEach((mesh) => {
                if (mesh.name === 'handleMesh') {
                    mesh.material.map = handleTexture;
                    mesh.material.needsUpdate = true;
                }
            });
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Upload via REST API (Garantido para funcionar tanto na página principal quanto no modo de teste)
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSubmit');
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'Processando Arte...';
        }

        const formData = new FormData();
        const titleInput = document.getElementById('title');
        const imageInput = document.getElementById('image');
        
        if (titleInput) formData.append('title', titleInput.value);
        if (imageInput && imageInput.files[0]) formData.append('image', imageInput.files[0]);

        const handleInput = document.getElementById('handle_image');
        if (handleInput && handleInput.files[0]) {
            formData.append('handle_image', handleInput.files[0]);
        }

        try {
            const response = await fetch('/api/artworks/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                updateMugTexture(result.data.image_url, result.data.handle_image_url);
            } else {
                alert('Erro ao enviar imagem.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao processar imagem.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'Gerar Mockup 3D';
            }
        }
    });
}

window.onload = init3D;