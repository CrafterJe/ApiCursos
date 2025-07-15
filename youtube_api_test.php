<?php
require_once __DIR__ . '/vendor/autoload.php';

$client = new Google\Client();
$client->setDeveloperKey('AIzaSyC4Kh7xBCHSvofaH1Ju23m4xJK_7vgiHkI'); // tu API Key

$youtube = new Google\Service\YouTube($client);

$response = $youtube->channels->listChannels('snippet,statistics', [
    'id' => 'UC_x5XG1OV2P6uZZ5FSM9Ttw'
]);

header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);
