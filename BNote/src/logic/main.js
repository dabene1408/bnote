/**
 * Main JavaScript file.
 */

// NORMAL EDITOR -> used for rich text fields, e.g. communication
tinyMCE.init({
	selector: "textarea#tinymce",
	language: "de",
	theme: "silver",
	toolbar: "bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | fontsizeselect",
	menubar: false,
	statusbar: false,
	license_key: 'gpl'
});

// FULL EDITOR -> used for website editing
tinyMCE.init({
	selector: "textarea#tinymcefull",
	language: "de",
	theme: "silver",
	menubar: "edit format tools table",
	toolbar: "preview | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | fontsizeselect | link unlink | cut copy paste | undo redo | hr | print",
	statusbar: false,
	tools: "inserttable",
	license_key: 'gpl'
});

// global settings
fullNavi = true;

$(document).ready(function() {
	$(".copyDateOrigin").on('change', function(event) {
		// get all origin values and build target values
		var h = "";
		var m = "";
		var dt = "";
		$(".copyDateOrigin").each(function(i, obj) {
			if($(obj).hasClass("hour")) {
				h = $(obj).val();
			}
			else if($(obj).hasClass("minute")) {
				m = $(obj).val();
			}
			else if($(obj).hasClass("bnote-datetime-time") || $(obj).attr("type") == "time") {
				var t = $(obj).val();
				if(t && t.indexOf(":") > 0) {
					h = t.split(":")[0];
					m = t.split(":")[1];
				}
			}
			else if($(obj).hasClass("bnote-datetime-date") || $(obj).attr("type") == "date") {
				dt = $(obj).val();
			}
			else {
				dt = $(obj).val();
			}
		});
		var val = "";
		if(h == "" || m == "") {
			val = dt;
		}
		else if(dt == "") {
			val = h + ":" + m;
		}
		else {
			val = dt + " " + h + ":" + m;
		}
		$('.copyDateTarget').each(function(i, obj) {
			var $obj = $(obj);
			if($obj.hasClass("hour")) {
				$obj.val(h);
			}
			else if($obj.hasClass("minute")) {
				$obj.val(m);
			}
			else if($obj.hasClass("bnote-datetime-time") || $obj.attr("type") == "time") {
				if(h != "" && m != "") $obj.val(h + ":" + m);
			}
			else if($obj.hasClass("bnote-datetime-date") || $obj.attr("type") == "date") {
				$obj.val(dt);
			}
			else {
				$obj.val(val);
			}
		});
	});
	
	$("#fb-fileupload").dropzone({
		url: $('#fb-fileupload-form').attr('action')
	});
	
});
