let scene, camera, renderer, controls;
let mugMaterials = [];

function init3D() {
    const container = document.getElementById('canvas-container');
    
    // Cena, Câmera e Renderizador
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controles de Órbita 360° (Horizontal e Vertical)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Adiciona Chão para Sombra
    const planeGeo = new THREE.PlaneGeometry(50, 50);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Criar as 3 Canecas (Esquerda, Centro, Direita com posições/ângulos diferentes)
    createMugGroup(-5.5, 0, 0, Math.PI / 2);   // Vista Esquerda (Mostra a alça e lateral)
    createMugGroup(0, 0, 0, 0);              // Vista Central (Frente da estampa)
    createMugGroup(5.5, 0, 0, -Math.PI / 2);  // Vista Direita (Outra lateral)

    window.addEventListener('resize', onWindowResize);
    animate();
}

/**
 * Constrói a geometria 3D da caneca (Corpo + Alça)
 */
function createMugGroup(x, y, z, rotationY) {
    const group = new THREE.Group();

    // 1. Corpo da Caneca (Cilindro)
    const mugGeo = new THREE.CylinderGeometry(2, 2, 4.5, 64, 1, true);
    
    // Material padrão cerâmica branca
    const defaultMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    
    const mugMesh = new THREE.Mesh(mugGeo, defaultMat);
    mugMesh.castShadow = true;
    group.add(mugMesh);

    // Armazena referência para aplicar textura dinamicamente
    mugMaterials.push(mugMesh);

    // 2. Alça da Caneca (Torus)
    const handleGeo = new THREE.TorusGeometry(1.2, 0.25, 16, 32, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(-2, 0, 0);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.castShadow = true;
    group.add(handleMesh);

    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    scene.add(group);
}

/**
 * Atualiza a textura em todas as canecas ao fazer o upload
 */
function updateMugTexture(imageUrl) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // --- AJUSTE DE POSIÇÃO E ENVOLVIMENTO DA ARTE ---
        // Desloca o início da estampa na horizontal (0.0 a 1.0)
        // Altere o valor de offset.x para girar o ponto de início em redor da caneca
        texture.offset.x = 0.25; // 0.25 alinha o bordo esquerdo da imagem junto à alça

        // Inverte a textura se a imagem ficar espelhada/ao contrário
        texture.repeat.x = 1; 

        mugMaterials.forEach((mesh) => {
            mesh.material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.3,
                metalness: 0.1
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

// Manipulação do Formulário de Upload via API REST
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

// Inicializa a cena ao carregar
window.onload = init3D;