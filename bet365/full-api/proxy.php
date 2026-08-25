<?php
// Allow the frontend to read this file
header('Access-Control-Allow-Origin: *');

$url = 'https://bet365.snack-media.com/soccer?&EventGroupID=100100&MarketID=40&LanguageID=1&countryid=197';
$username = 'snack';
$password = 'snack365';

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

// --- NEW SETTINGS TO ACT LIKE A REAL BROWSER ---

// 1. Follow redirects if the server tries to send us to a different URL
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 

// 2. Pretend to be a normal Google Chrome browser
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

// 3. Automatically decode GZIP/Deflate compressed data
curl_setopt($ch, CURLOPT_ENCODING, ""); 

// Bypass SSL verification in case your local server doesn't have updated certificates
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

// Check if cURL itself failed
if ($response === false) {
    header('Content-Type: text/plain');
    echo "cURL Error: " . $curl_error;
    exit;
}

// Check if the API returned an error code
if ($http_status !== 200) {
    header('Content-Type: text/plain');
    echo "API Error: HTTP status code $http_status.\n\n";
    echo "Raw response:\n" . $response;
    exit;
}

// Output the final XML
header('Content-Type: application/xml');
echo $response;
?>