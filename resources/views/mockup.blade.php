<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerador de Mockup 3D - Caneca (270mm x 100mm)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>
    <script src="https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body class="bg-gray-100 text-gray-800 min-h-screen flex flex-col">

    <header class="bg-white shadow p-4">
        <h1 class="text-xl font-bold text-gray-800">Visualizador 3D de Canecas — 270x100 mm</h1>
    </header>

    <main class="flex-1 container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-1 flex flex-col justify-between">
            <div>
                <h2 class="text-lg font-semibold mb-4">Carregar Arte da Caneca</h2>
                <form id="uploadForm" class="space-y-4">
                    @csrf
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" id="title" name="title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Arte (270mm x 100mm)</label>
                        <input type="file" id="image" name="image" accept="image/*" required class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600">
                    </div>
                    <button type="submit" id="btnSubmit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-semibold transition">
                        Gerar Mockup 3D
                    </button>
                </form>
            </div>
            
            <div class="mt-6 border-t pt-4 text-xs text-gray-500">
                <p><strong>Atalhos de rotação 3D:</strong></p>
                <p>• Clique e arraste para girar 360° (Horizontal e Vertical).</p>
                <p>• Scroll para Zoom In / Zoom Out.</p>
            </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md lg:col-span-3 flex flex-col relative">
            <div id="canvas-container" class="w-full h-[550px] bg-slate-900 rounded-md"></div>
        </div>
    </main>

    <script src="{{ asset('js/mockup-viewer.js') }}"></script>
</body>
</html>