<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMugArtworkRequest;
use App\Models\MugArtwork;
use App\Services\ImageProcessingService;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class MugMockupController extends Controller
{
    public function __construct(
        private readonly ImageProcessingService $imageService
    ) {}

    public function index(): View
    {
        return view('mockup');
    }

    public function store(StoreMugArtworkRequest $request): JsonResponse
    {
        // 1. Processa a estampa principal do corpo da caneca (270mm x 100mm)
        $file = $request->file('image');
        $originalPath = $file->store('artworks/originals', 'public');
        $processedPath = $this->imageService->processArtwork($file);

        // 2. Processa a estampa opcional da alça (60mm x 10mm)
        $handleProcessedPath = null;
        if ($request->hasFile('handle_image')) {
            $handleFile = $request->file('handle_image');
            $handleProcessedPath = $this->imageService->processHandleArtwork($handleFile);
        }

        // 3. Salva os registros no Banco de Dados
        $artwork = MugArtwork::create([
            'title' => $request->input('title'),
            'original_path' => $originalPath,
            'processed_path' => $processedPath,
            'handle_processed_path' => $handleProcessedPath,
            'width_mm' => 270.00,
            'height_mm' => 100.00,
            'handle_width_mm' => 60.00,
            'handle_height_mm' => 10.00,    
        ]);

        // 4. Retorna as URLs formatadas para o JavaScript (mockup-viewer.js)
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $artwork->id,
                'title' => $artwork->title,
                'image_url' => asset('storage/' . $processedPath),
                'handle_image_url' => $handleProcessedPath ? asset('storage/' . $handleProcessedPath) : null,
            ],
        ], 201);
    }
}