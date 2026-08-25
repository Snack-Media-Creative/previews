<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/xml");

$url = 'https://snack-scripts.b-cdn.net/bet365/feeds/premier-league.xml';

// Set up headers to trick the CDN into thinking this is a standard web browser
$options = [
    "http" => [
        "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36\r\n" .
                    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8\r\n" .
                    "Accept-Language: en-US,en;q=0.5\r\n"
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo $response;
?>