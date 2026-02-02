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

function bnoteSetTheme(theme) {
	var link = document.getElementById("bnote-theme-css");
	if(!link) {
		return;
	}
	var lightTheme = link.getAttribute("data-light-theme") || "default";
	var darkTheme = link.getAttribute("data-dark-theme") || "dark";
	var themeFolder = (theme === "dark") ? darkTheme : lightTheme;
	link.setAttribute("href", "style/css/" + themeFolder + "/bnote.css");
	document.documentElement.setAttribute("data-bnote-theme", theme);
	localStorage.setItem("bnote-theme", theme);
	bnoteUpdateThemeToggle(theme);
}

function bnoteUpdateThemeToggle(theme) {
	var btn = document.querySelector(".bnote-theme-toggle");
	if(!btn) {
		return;
	}
	var icon = btn.querySelector("i");
	if(!icon) {
		return;
	}
	if(theme === "dark") {
		icon.className = "bi-sun";
		btn.setAttribute("title", "Light mode umschalten");
		btn.setAttribute("aria-label", "Light mode umschalten");
	}
	else {
		icon.className = "bi-moon-stars";
		btn.setAttribute("title", "Dark mode umschalten");
		btn.setAttribute("aria-label", "Dark mode umschalten");
	}
}

function bnoteInitTheme() {
	var stored = localStorage.getItem("bnote-theme");
	if(stored === "dark" || stored === "light") {
		bnoteSetTheme(stored);
		return;
	}
	var prefersDark = false;
	if(window.matchMedia) {
		prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	bnoteSetTheme(prefersDark ? "dark" : "light");
}

function bnoteGetRegexp(regexName) {
	if(typeof getRegexp === "function") {
		return getRegexp(regexName);
	}
	return null;
}

function bnoteApplyValidationState(el, isOk) {
	var $el = $(el);
	if(isOk) {
		$el.removeClass("is-invalid");
		if($el.val() !== "") {
			$el.addClass("is-valid");
		}
		else {
			$el.removeClass("is-valid");
		}
	}
	else {
		$el.addClass("is-invalid");
		$el.removeClass("is-valid");
	}
}

function bnoteValidateDateTimeGroup(baseId) {
	var dateEl = document.getElementById(baseId + "_date");
	var timeEl = document.getElementById(baseId + "_time");
	if(!dateEl || !timeEl) {
		return true;
	}
	var required = dateEl.getAttribute("data-bnote-required") === "1" || dateEl.required;
	var hasAny = (dateEl.value !== "" || timeEl.value !== "");
	var ok = true;
	if(required || hasAny) {
		ok = (dateEl.value !== "" && timeEl.value !== "");
	}
	bnoteApplyValidationState(dateEl, ok);
	bnoteApplyValidationState(timeEl, ok);
	return ok;
}

function bnoteValidateElement(el) {
	if(!el || el.disabled || el.type === "hidden") {
		return true;
	}
	if(el.classList.contains("bnote-datetime-date") || el.classList.contains("bnote-datetime-time")) {
		if(el.id && (el.id.endsWith("_date") || el.id.endsWith("_time"))) {
			var baseId = el.id.replace(/_(date|time)$/, "");
			return bnoteValidateDateTimeGroup(baseId);
		}
	}
	var required = el.getAttribute("data-bnote-required") === "1" || el.required;
	if(el.type === "checkbox") {
		var ok = !required || el.checked;
		bnoteApplyValidationState(el, ok);
		return ok;
	}
	var val = $(el).val();
	var isEmpty = (val === null || val === "" || val === "null");
	if(required && isEmpty) {
		bnoteApplyValidationState(el, false);
		return false;
	}
	var vtype = el.getAttribute("data-bnote-validate");
	if(vtype) {
		var regexStr = bnoteGetRegexp(vtype);
		if(regexStr) {
			var regex = new RegExp(regexStr);
			var okRegex = (!isEmpty) ? regex.test(val) : !required;
			bnoteApplyValidationState(el, okRegex);
			return okRegex;
		}
	}
	if(el.checkValidity) {
		var okNative = el.checkValidity();
		bnoteApplyValidationState(el, okNative);
		return okNative;
	}
	bnoteApplyValidationState(el, true);
	return true;
}

function bnoteAttachValidation(root) {
	$(root).find("input, select, textarea").each(function(i, el) {
		$(el).on("input.bnoteValidation change.bnoteValidation blur.bnoteValidation", function() {
			bnoteValidateElement(el);
		});
	});
}

$(document).ready(function() {
	bnoteInitTheme();
	$(".bnote-theme-toggle").on("click", function() {
		var current = document.documentElement.getAttribute("data-bnote-theme") || "light";
		bnoteSetTheme(current === "dark" ? "light" : "dark");
	});

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

	bnoteAttachValidation(document);
});
