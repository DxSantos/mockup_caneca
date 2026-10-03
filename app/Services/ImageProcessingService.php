<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageProcessingService
{
    private const TARGET_WIDTH = 2700;  // 270mm em 300 DPI
    private const TARGET_HEIGHT = 1000; // 100mm em 300 DPI

    public function processArtwork(UploadedFile $file): string
    {
        // Aumenta temporariamente o limite de memória para processamento de imagem
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

        // Criar o canvas com as dimensões do molde (270mm x 100mm)
        $canvas = imagecreatetruecolor(self::TARGET_WIDTH, self::TARGET_HEIGHT);
        
        // Fundo branco
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);

        // Redimensionar e copiar a imagem original para o canvas
        imagecopyresampled(
            $canvas, $source,
            0, 0, 0, 0,
            self::TARGET_WIDTH, self::TARGET_HEIGHT,
            $origWidth, $origHeight
        );

        $filename = 'artworks/' . uniqid() . '_processed.jpg';

        // Garante a criação da pasta na storage pública
        Storage::disk('public')->makeDirectory('artworks');
        $fullPath = Storage::disk('public')->path($filename);

        // Guarda a imagem final
        imagejpeg($canvas, $fullPath, 90);

        // Liberta a memória consumida pelas imagens
        imagedestroy($source);
        imagedestroy($canvas);

        return $filename;
    }
}