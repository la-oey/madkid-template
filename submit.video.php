<?php

function ajax_error($code, $message){
	//header('content-type: application/json; charset=utf-8');
	//header("access-control-allow-origin: *");
	$output = array('Success' => false,
			   		'Error' => $code,
			   		'Message' => $message);
	echo json_encode($output);
	die();
}


function ajax_return($contents){
	//header('content-type: application/json; charset=utf-8');
	//header("access-control-allow-origin: *");
	$output = array('Success' => true,
			   		'Data' => $contents);
	//echo json_encode($output);
	die();
}

	$data = json_decode($_REQUEST['data'], true);
	$vidData = $_REQUEST['vidData']

	$rawfile = sprintf('%s/%s.webm', 'output/video-recording', $data['client']['sid']);
	$fp = fopen($rawfile, 'w');
	file_put_contents($rawfile, file_get_contents($vidData))
	//fwrite($fp, json_encode($data, JSON_PRETTY_PRINT));
	//fclose($fp);

	ajax_return('success');
?>