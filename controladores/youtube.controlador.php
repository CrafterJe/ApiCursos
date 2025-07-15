<?php
require_once __DIR__ . '/../vendor/autoload.php';

class YoutubeControlador {
    static public function ctrObtenerCanal($id_canal) {
        try {
            $client = new Google\Client();
            $client->setDeveloperKey('AIzaSyC4Kh7xBCHSvofaH1Ju23m4xJK_7vgiHkI'); 

            $youtube = new Google\Service\YouTube($client);

            $response = $youtube->channels->listChannels('snippet,statistics', [
                'id' => $id_canal
            ]);

            return [
                "status" => 200,
                "detalle" => $response
            ];
        } catch (Exception $e) {
            return [
                "status" => 500,
                "detalle" => "❌ Error al consultar YouTube: " . $e->getMessage()
            ];
        }
    }
}
