let scene, camera, renderer, controls;
let mugMaterials = [];

function init3D() {
    const container = document.getElementById('canvas-container');
    
    // 1. Cena e Câmera com ângulo de visão superior realista
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0d0d0);

    camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Posicionamento estratégico para ver o interior e o fundo interno
    camera.position.set(0, 9.5, 15.5);

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
    controls.target.set(0, -0.5, 0);

    // 3. Iluminação de Estúdio Profissional
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
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

    // 5. Instanciar as 3 Canecas Solidas e Fechadas (Esquerda, Centro, Direita)
    createMugGroup(-5.2, 0, 0, Math.PI / 2.1);   // Vista Esquerda (Foco na alça/lateral)
    createMugGroup(0, 0, 0, 0);                 // Vista Central (Frente)
    createMugGroup(5.2, 0, 0, -Math.PI / 2.1);  // Vista Direita (Outra lateral)

    window.addEventListener('resize', onWindowResize);
    animate();
}

/**
 * Cria o piso/mesa de madeira com sombras
 */
function createWoodenTable() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fundo tom madeira escura
    ctx.fillStyle = '#3e230d';
    ctx.fillRect(0, 0, 512, 512);

    // Desenha veios da madeira
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
 * Constrói a Caneca em 3D Realista com Interior Maciço e Fechado
 */
function createMugGroup(x, y, z, rotationY) {
    const group = new THREE.Group();

    // Material Cerâmica Branca Glossy com Renderização Dupla (Evita ficar vazado)
    const ceramicMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.12,
        metalness: 0.05,
        side: THREE.DoubleSide
    });

    // 1. Corpo Externo da Caneca (Recebe a estampa)
    const outerGeo = new THREE.CylinderGeometry(2, 2, 4.5, 64, 1, true);
    const outerMesh = new THREE.Mesh(outerGeo, ceramicMaterial.clone());
    outerMesh.castShadow = true;
    outerMesh.receiveShadow = true;
    group.add(outerMesh);

    // Guarda referência para aplicar a textura enviada
    mugMaterials.push(outerMesh);

    // 2. Interior da Caneca (Cavidade interna totalmente visível e branca)
    const innerGeo = new THREE.CylinderGeometry(1.85, 1.85, 4.35, 64, 1, true);
    const innerMesh = new THREE.Mesh(innerGeo, ceramicMaterial);
    innerMesh.position.y = 0.08;
    group.add(innerMesh);

    // 3. Fundo Interno (Base sólida visível dentro da caneca)
    const innerBottomGeo = new THREE.CircleGeometry(1.85, 64);
    const innerBottomMesh = new THREE.Mesh(innerBottomGeo, ceramicMaterial);
    innerBottomMesh.rotation.x = -Math.PI / 2;
    innerBottomMesh.position.y = -2.1;
    group.add(innerBottomMesh);

    // 4. Borda Superior Curvada (Arredondamento da louça)
    const rimGeo = new THREE.TorusGeometry(1.925, 0.075, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, ceramicMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 2.25;
    group.add(rimMesh);

    // 5. Alça da Caneca Conectada Perfeitamente ao Corpo (x = -1.95)
    const handleCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-1.95, 1.4, 0),
        new THREE.Vector3(-3.45, 1.0, 0),
        new THREE.Vector3(-3.45, -1.0, 0),
        new THREE.Vector3(-1.95, -1.4, 0)
    );
    const handleGeo = new THREE.TubeGeometry(handleCurve, 32, 0.22, 16, false);
    const handleMesh = new THREE.Mesh(handleGeo, ceramicMaterial);
    handleMesh.castShadow = true;
    group.add(handleMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    scene.add(group);
}

/**
 * Aplica e Ajusta a Estampa na Caneca
 */
function updateMugTexture(imageUrl) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Alinhamento exato do início da arte junto à alça
        texture.offset.x = 0.25;
        texture.repeat.x = 1;

        mugMaterials.forEach((mesh) => {
            mesh.material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.12,
                metalness: 0.05,
                side: THREE.DoubleSide
            });
            mesh.material.needsUpdate = true;
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

// Upload via AJAX / REST API
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