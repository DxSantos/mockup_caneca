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
        $file = $request->file('image');
        $originalPath = $file->store('artworks/originals', 'public');
        $processedPath = $this->imageService->processArtwork($file);

        $artwork = MugArtwork::create([
            'title' => $request->input('title'),
            'original_path' => $originalPath,
            'processed_path' => $processedPath,
            'width_mm' => 270.00,
            'height_mm' => 100.00,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $artwork->id,
                'title' => $artwork->title,
                'image_url' => asset('storage/' . $processedPath),
            ],
        ], 201);
    }
}