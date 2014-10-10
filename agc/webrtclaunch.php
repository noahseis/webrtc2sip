<?php
if (isset($_GET["DB"]))							{$DB=$_GET["DB"];}
        elseif (isset($_POST["DB"]))			{$DB=$_POST["DB"];}
if (isset($_GET["phone_login"]))				{$phone_login=$_GET["phone_login"];}
        elseif (isset($_POST["phone_login"]))	{$phone_login=$_POST["phone_login"];}
if (isset($_GET["phone_pass"]))					{$phone_pass=$_GET["phone_pass"];}
        elseif (isset($_POST["phone_pass"]))    {$phone_pass=$_POST["phone_pass"];}
if (isset($_GET["server_ip"]))					{$server_ip=$_GET["server_ip"];}
        elseif (isset($_POST["server_ip"]))		{$server_ip=$_POST["server_ip"];}
if (isset($_GET["callerid"]))					{$callerid=$_GET["callerid"];}
        elseif (isset($_POST["callerid"]))		{$callerid=$_POST["callerid"];}
if (isset($_GET["protocol"]))					{$protocol=$_GET["protocol"];}
        elseif (isset($_POST["protocol"]))		{$protocol=$_POST["protocol"];}
if (isset($_GET["codecs"]))						{$codecs=$_GET["codecs"];}
        elseif (isset($_POST["codecs"]))		{$codecs=$_POST["codecs"];}
if (isset($_GET["options"]))					{$options=$_GET["options"];}
        elseif (isset($_POST["options"]))		{$options=$_POST["options"];}
if (isset($_GET["system_key"]))					{$system_key=$_GET["system_key"];}
        elseif (isset($_POST["system_key"]))	{$system_key=$_POST["system_key"];}

$phone_pass = base64_decode($phone_pass);
$server_ip = base64_decode($server_ip);
$phone_login = base64_decode($phone_login);

$query_string = "/agc/webrtc.php?serveraddress=$server_ip&username=$phone_login&password=$phone_pass";

$servers = array("External DNS Address","External DNS Address");
$server = $servers[array_rand($servers)];
$URL = "http://$server$query_string";

header("Location: $URL");

exit;
?>
