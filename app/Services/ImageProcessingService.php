<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageProcessingService
{
    private const TARGET_WIDTH = 2700;  // 270mm em 300 DPI
    private const TARGET_HEIGHT = 1000; // 100mm em 300 DPI

    private const HANDLE_WIDTH = 708;   // 60mm em 300 DPI
    private const HANDLE_HEIGHT = 118;  // 10mm em 300 DPI

    public function processArtwork(UploadedFile $file): string
    {
        ini_set('memory_limit', '512M');

        $imagePath = $file->getRealPath();
        $info = getimagesize($imagePath);

        if (!$info) {
            throw new \InvalidArgumentException('Ficheiro de imagem inválido.');
        }

        list($origWidth, $origHeight, $type) = $info;

        $source = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($imagePath),
            IMAGETYPE_PNG  => @imagecreatefrompng($imagePath),
            IMAGETYPE_WEBP => @imagecreatefromwebp($imagePath),
            default        => throw new \InvalidArgumentException('Formato de imagem não suportado.'),
        };

        if (!$source) {
            throw new \RuntimeException('Não foi possível ler a imagem enviada.');
        }

        $canvas = imagecreatetruecolor(self::TARGET_WIDTH, self::TARGET_HEIGHT);

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        imagealphablending($canvas, true);

        imagecopyresampled(
            $canvas, $source,
            0, 0, 0, 0,
            self::TARGET_WIDTH, self::TARGET_HEIGHT,
            $origWidth, $origHeight
        );

        imagefilter($canvas, IMG_FILTER_CONTRAST, -22);
        imagefilter($canvas, IMG_FILTER_BRIGHTNESS, -12);
        imagefilter($canvas, IMG_FILTER_COLORIZE, -6, -4, 2);

        $filename = 'artworks/' . uniqid() . '_processed.png';

        Storage::disk('public')->makeDirectory('artworks');
        $fullPath = Storage::disk('public')->path($filename);

        imagepng($canvas, $fullPath, 0);

        imagedestroy($source);
        imagedestroy($canvas);

        return $filename;
    }

    /**
     * Processa a estampa exclusiva para a alça (60mm x 10mm)
     */
    public function processHandleArtwork(UploadedFile $file): string
    {
        ini_set('memory_limit', '256M');

        $imagePath = $file->getRealPath();
        $info = getimagesize($imagePath);

        if (!$info) {
            throw new \InvalidArgumentException('Ficheiro de imagem inválido.');
        }

        list($origWidth, $origHeight, $type) = $info;

        $source = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($imagePath),
            IMAGETYPE_PNG  => @imagecreatefrompng($imagePath),
            IMAGETYPE_WEBP => @imagecreatefromwebp($imagePath),
            default        => throw new \InvalidArgumentException('Formato de imagem não suportado.'),
        };

        $canvas = imagecreatetruecolor(self::HANDLE_WIDTH, self::HANDLE_HEIGHT);

        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);

        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        imagealphablending($canvas, true);

        imagecopyresampled(
            $canvas, $source,
            0, 0, 0, 0,
            self::HANDLE_WIDTH, self::HANDLE_HEIGHT,
            $origWidth, $origHeight
        );

        $filename = 'artworks/' . uniqid() . '_handle_processed.png';

        Storage::disk('public')->makeDirectory('artworks');
        $fullPath = Storage::disk('public')->path($filename);

        imagepng($canvas, $fullPath, 0);

        imagedestroy($source);
        imagedestroy($canvas);

        return $filename;
    }
}