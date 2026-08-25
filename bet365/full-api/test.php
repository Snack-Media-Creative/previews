<?php
// 1. Fix the URL (Removed the stray '&' after the '?')
$url = 'https://bet365.snack-media.com/soccer?EventGroupID=100100&MarketID=40&LanguageID=1&countryid=197';
$username = 'snack';
$password = 'snack365';

echo "<h3>Testing Connection to Bet365 API...</h3>";
echo "Target URL: $url<br><br>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 

// Pass credentials securely in the header
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

// Disguise cURL as a standard Firefox browser
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0');

// Add headers that browsers normally send
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language: en-US,en;q=0.5',
    'Connection: keep-alive',
    'Upgrade-Insecure-Requests: 1'
]);

// Tell cURL to track the exact request it sends
curl_setopt($ch, CURLINFO_HEADER_OUT, true);

// Execute the request
$response = curl_exec($ch);
$info = curl_getinfo($ch);
$error = curl_error($ch);
curl_close($ch);

// Output the results in a readable format
echo "<b>HTTP Status Code:</b> " . $info['http_code'] . "<br>";
echo "<b>Time Taken:</b> " . $info['total_time'] . " seconds<br>";
echo "<b>cURL Error (if any):</b> " . ($error ? $error : "None") . "<br><br>";

echo "<b>Raw Response length:</b> " . strlen($response) . " bytes<br><br>";

echo "<b>Raw Response Data:</b><br>";
echo "<textarea style='width:100%; height:300px;'>" . htmlspecialchars($response) . "</textarea>";
?>