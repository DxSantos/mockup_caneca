let scene, camera, renderer, controls;
let mugMaterials = [];
let paperMaterials = []; // Guarda as folhas para aplicar a textura

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
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 2. Controles de Órbita 360°
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -0.2, 0);

    // 3. Iluminação de Estúdio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
    mainLight.position.set(8, 20, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 12, -8);
    scene.add(fillLight);

    // 4. Mesa de Madeira
    createWoodenTable();

    // 5. Papéis/Moldes da Arte Cruzados no Chão (270mm x 100mm)
    createArtworkPapers();

    // 6. Instanciar as 3 Canecas (Esquerda, Centro, Direita)
    createMugGroup(-4.2, 0, -2, 0);                 // Esquerda (Alça na esquerda)
    createMugGroup(0, 0, -4, -Math.PI / 2);          // Centro (Frente lisa)
    createMugGroup(4.2, 0, -2, Math.PI);             // Direita (Alça na direita)

    window.addEventListener('resize', onWindowResize);
    animate();
}

/**
 * Cria os dois papéis empilhados e cruzados no chão (estilo Rapid Mockup)
 */
function createArtworkPapers() {
    paperMaterials = []; // Reseta a lista
    
    const paperWidth = 10.8; // Proporção 270mm
    const paperHeight = 4.0; // Proporção 100mm
    const paperGeo = new THREE.PlaneGeometry(paperWidth, paperHeight);

    // 1. Folha de Baixo (Levemente inclinada para a esquerda)
    const paperMat1 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        side: THREE.DoubleSide
    });
    const paperMesh1 = new THREE.Mesh(paperGeo, paperMat1);
    paperMesh1.rotation.x = -Math.PI / 2;
    paperMesh1.rotation.z = 0.08; // Rotação para cruzar
    paperMesh1.position.set(-0.3, -2.23, 2.7); // Altura logo acima da mesa
    paperMesh1.receiveShadow = true;
    paperMesh1.castShadow = true;
    scene.add(paperMesh1);
    paperMaterials.push(paperMat1);

    // 2. Folha de Cima (Levemente inclinada para a direita e um pouco mais alta)
    const paperMat2 = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.6,
        side: THREE.DoubleSide
    });
    const paperMesh2 = new THREE.Mesh(paperGeo, paperMat2);
    paperMesh2.rotation.x = -Math.PI / 2;
    paperMesh2.rotation.z = -0.06; // Rotação oposta
    paperMesh2.position.set(0.3, -2.21, 2.5); // Ligeiramente acima da primeira folha
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
 * Constrói a Caneca em 3D
 */
function createMugGroup(x, y, z, rotationY) {
    const group = new THREE.Group();

    const ceramicMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.12,
        metalness: 0.05,
        side: THREE.DoubleSide
    });

    // Corpo
    const outerGeo = new THREE.CylinderGeometry(2, 2, 4.5, 64, 1, true);
    const outerMesh = new THREE.Mesh(outerGeo, ceramicMaterial.clone());
    outerMesh.castShadow = true;
    outerMesh.receiveShadow = true;
    group.add(outerMesh);

    mugMaterials.push(outerMesh);

    // Interior
    const innerGeo = new THREE.CylinderGeometry(1.85, 1.85, 4.35, 64, 1, true);
    const innerMesh = new THREE.Mesh(innerGeo, ceramicMaterial);
    innerMesh.position.y = 0.08;
    group.add(innerMesh);

    // Fundo Interno
    const innerBottomGeo = new THREE.CircleGeometry(1.85, 64);
    const innerBottomMesh = new THREE.Mesh(innerBottomGeo, ceramicMaterial);
    innerBottomMesh.rotation.x = -Math.PI / 2;
    innerBottomMesh.position.y = -2.1;
    group.add(innerBottomMesh);

    // Borda Superior
    const rimGeo = new THREE.TorusGeometry(1.925, 0.075, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, ceramicMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 2.25;
    group.add(rimMesh);

    // Alça Anatômica
    const handleCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-1.95, 1.45, 0),
        new THREE.Vector3(-4.00, 1.65, 0),
        new THREE.Vector3(-4.00, -1.65, 0),
        new THREE.Vector3(-1.95, -1.45, 0)
    );
    const handleGeo = new THREE.TubeGeometry(handleCurve, 48, 0.28, 16, false);
    const handleMesh = new THREE.Mesh(handleGeo, ceramicMaterial);
    handleMesh.castShadow = true;
    handleMesh.receiveShadow = true;
    group.add(handleMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    scene.add(group);
    return group;
}

/**
 * Aplica e Ajusta a Estampa na Caneca e nos Papéis
 */
function updateMugTexture(imageUrl) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Textura Envelopada para as Canecas
        const mugTexture = texture.clone();
        mugTexture.offset.x = 0.25;
        mugTexture.repeat.x = 1;
        mugTexture.needsUpdate = true;

        mugMaterials.forEach((mesh) => {
            mesh.material = new THREE.MeshStandardMaterial({
                map: mugTexture,
                roughness: 0.12,
                metalness: 0.05,
                side: THREE.DoubleSide
            });
            mesh.material.needsUpdate = true;
        });

        // Textura Plana Direta para os Papéis no Chão
        paperMaterials.forEach((paperMat) => {
            const paperTex = texture.clone();
            paperTex.offset.set(0, 0);
            paperTex.repeat.set(1, 1);
            paperTex.needsUpdate = true;

            paperMat.map = paperTex;
            paperMat.color.setHex(0xffffff); // Garante que não fique escuro/azul
            paperMat.needsUpdate = true;
        });
    });
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

// Upload via REST API
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerText = 'Processando Arte...';

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('image', document.getElementById('image').files[0]);

    try {
        const response = await fetch('/api/artworks/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.success) {
            updateMugTexture(result.data.image_url);
        } else {
            alert('Erro ao enviar imagem.');
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao processar imagem.');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Gerar Mockup 3D';
    }
});

window.onload = init3D;