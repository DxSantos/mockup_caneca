<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ambiente de Teste 3D - Canecas</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body class="bg-gray-100 text-gray-800 min-h-screen flex flex-col">

    <header class="bg-slate-800 text-white p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">🛠️ Modo de Teste e Desenvolvimento 3D</h1>
        <span class="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">Imagens Automáticas Ativas</span>
    </header>

    <main class="flex-1 container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-1 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div>
                <h2 class="text-lg font-semibold mb-2">Painel de Testes Rápidos</h2>
                <p class="text-xs text-gray-500 mb-4">Atualize as propriedades e veja o resultado no 3D instantaneamente.</p>

                <!-- Botão de Recarregar Texturas Padrão -->
                <button id="btnReloadTextures" class="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 font-semibold mb-6 transition">
                    🔄 Recarregar Texturas de Teste
                </button>

                <!-- Opções de Cores do Objeto -->
                <div class="bg-white p-4 rounded-lg shadow mb-6 border">
                    <h3 class="text-md font-semibold mb-3 text-gray-800">Opções de Objeto (Cores)</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label for="colorHandle" class="text-sm text-gray-700">Alça</label>
                            <input type="color" id="colorHandle" value="#ffffff" class="w-8 h-8 rounded-full border cursor-pointer">
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="colorInterior" class="text-sm text-gray-700">Interior</label>
                            <input type="color" id="colorInterior" value="#ffffff" class="w-8 h-8 rounded-full border cursor-pointer">
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="colorBody" class="text-sm text-gray-700">Área da Arte</label>
                            <input type="color" id="colorBody" value="#ffffff" class="w-8 h-8 rounded-full border cursor-pointer">
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="colorBottom" class="text-sm text-gray-700">Fundo</label>
                            <input type="color" id="colorBottom" value="#ffffff" class="w-8 h-8 rounded-full border cursor-pointer">
                        </div>
                        <div class="flex items-center justify-between">
                            <label for="colorRim" class="text-sm text-gray-700">Outros (Borda)</label>
                            <input type="color" id="colorRim" value="#ffffff" class="w-8 h-8 rounded-full border cursor-pointer">
                        </div>
                    </div>
                </div>

                <!-- Configuração de Materiais -->
                <div class="bg-white p-4 rounded-lg shadow border">
                    <h3 class="text-md font-semibold mb-3 text-gray-800">Materiais</h3>
                    
                    <div class="mb-3">
                        <div class="flex justify-between text-sm font-medium text-gray-700">
                            <label for="inputReflectivity">Reflexo (Brilho)</label>
                            <span id="valReflectivity">0.7</span>
                        </div>
                        <input type="range" id="inputReflectivity" min="0" max="2" step="0.05" value="0.7" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-sm font-medium text-gray-700">
                            <label for="inputRoughness">Rugosidade</label>
                            <span id="valRoughness">0</span>
                        </div>
                        <input type="range" id="inputRoughness" min="0" max="1" step="0.05" value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-sm font-medium text-gray-700">
                            <label for="inputMetalness">Metalicidade</label>
                            <span id="valMetalness">0</span>
                        </div>
                        <input type="range" id="inputMetalness" min="0" max="1" step="0.05" value="0" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-sm font-medium text-gray-700">
                            <label for="inputOpacity">Transparência</label>
                            <span id="valOpacity">1</span>
                        </div>
                        <input type="range" id="inputOpacity" min="0.1" max="1" step="0.05" value="1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md lg:col-span-3 flex flex-col relative">
            <div id="canvas-container" class="w-full h-[550px] bg-slate-900 rounded-md"></div>
        </div>
    </main>

    <script src="{{ asset('js/mockup-viewer.js') }}"></script>

    <!-- Script de Autocarregamento de Imagens para Teste -->
    <script>
    window.addEventListener('load', () => {
        const DEFAULT_BODY_ART = "/storage/artworks/caneca_snoopy_demo.png"; 
        const DEFAULT_HANDLE_ART = "/storage/artworks/alca_marcia_demo.png";

        // Aguarda a renderização inicial do Three.js ser finalizada
        setTimeout(() => {
            if (typeof updateMugTexture === 'function') {
                updateMugTexture(DEFAULT_BODY_ART, DEFAULT_HANDLE_ART);
            }
        }, 800);

        const btnReload = document.getElementById('btnReloadTextures');
        if (btnReload) {
            btnReload.addEventListener('click', () => {
                if (typeof updateMugTexture === 'function') {
                    updateMugTexture(DEFAULT_BODY_ART, DEFAULT_HANDLE_ART);
                }
            });
        }
    });
</script>
</body>
</html>