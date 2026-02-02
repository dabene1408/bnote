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
		icon.className = "bi-sun-fill";
		btn.setAttribute("title", "Light mode umschalten");
		btn.setAttribute("aria-label", "Light mode umschalten");
	}
	else {
		icon.className = "bi-moon-stars-fill";
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

function bnoteParseDateTimeStr(val) {
	if(!val) {
		return null;
	}
	var v = val.trim();
	if(v.indexOf(" ") > 0) {
		v = v.replace(" ", "T");
	}
	var d = new Date(v);
	if(isNaN(d.getTime())) {
		return null;
	}
	return d;
}

function bnotePad2(n) {
	return (n < 10) ? ("0" + n) : ("" + n);
}

function bnoteLocalDateStr(d) {
	return d.getFullYear() + "-" + bnotePad2(d.getMonth() + 1) + "-" + bnotePad2(d.getDate());
}

function bnoteLocalTimeStr(d) {
	return bnotePad2(d.getHours()) + ":" + bnotePad2(d.getMinutes());
}

function bnoteGetDateTimeValue(baseName) {
	var hidden = document.getElementById(baseName + "_value");
	if(hidden && hidden.value) {
		return hidden.value;
	}
	var dateEl = document.getElementById(baseName + "_date");
	var timeEl = document.getElementById(baseName + "_time");
	if(dateEl && timeEl && dateEl.value && timeEl.value) {
		return dateEl.value + "T" + timeEl.value;
	}
	return null;
}

function bnoteIsDateTimeEmpty(baseName) {
	var dateEl = document.getElementById(baseName + "_date");
	var timeEl = document.getElementById(baseName + "_time");
	if(!dateEl || !timeEl) {
		return true;
	}
	return (dateEl.value === "" && timeEl.value === "");
}

function bnoteAutofillFromOriginIfEmpty() {
	var originDate = document.querySelector(".copyDateOrigin.bnote-datetime-date");
	var originTime = document.querySelector(".copyDateOrigin.bnote-datetime-time");
	if(!originDate || !originTime) {
		return;
	}
	if(originDate.value === "" || originTime.value === "") {
		return;
	}
	var originDateTime = originDate.value + "T" + originTime.value;
	var originDateObj = bnoteParseDateTimeStr(originDateTime);
	if(!originDateObj) {
		return;
	}
	var adjustedMeeting = new Date(originDateObj.getTime() - 60000);
	var adjustedApprove = new Date(originDateObj.getTime() - 120000);
	var endAuto = new Date(originDateObj.getTime() + 3600000);
	var meetingDate = bnoteLocalDateStr(adjustedMeeting);
	var meetingTime = bnoteLocalTimeStr(adjustedMeeting);
	var approveDate = bnoteLocalDateStr(adjustedApprove);
	var approveTime = bnoteLocalTimeStr(adjustedApprove);
	var endDate = bnoteLocalDateStr(endAuto);
	var endTime = bnoteLocalTimeStr(endAuto);

	if(bnoteIsDateTimeEmpty("meetingtime")) {
		var md = document.getElementById("meetingtime_date");
		var mt = document.getElementById("meetingtime_time");
		if(md && mt) {
			md.value = meetingDate;
			mt.value = meetingTime;
			md.dispatchEvent(new Event("input"));
			mt.dispatchEvent(new Event("input"));
		}
	}
	if(bnoteIsDateTimeEmpty("approve_until")) {
		var ad = document.getElementById("approve_until_date");
		var at = document.getElementById("approve_until_time");
		if(ad && at) {
			ad.value = approveDate;
			at.value = approveTime;
			ad.dispatchEvent(new Event("input"));
			at.dispatchEvent(new Event("input"));
		}
	}
	if(bnoteIsDateTimeEmpty("end")) {
		var ed = document.getElementById("end_date");
		var et = document.getElementById("end_time");
		if(ed && et) {
			ed.value = endDate;
			et.value = endTime;
			ed.dispatchEvent(new Event("input"));
			et.dispatchEvent(new Event("input"));
		}
	}
}

function bnoteSetFieldMessage(el, msg) {
	var $container = $(el).closest(".mb-1");
	if($container.length === 0) {
		$container = $(el).closest(".form-check");
	}
	var $msg = $container.find(".bnote-validation-msg");
	if(!$msg.length) {
		$msg = $('<div class="invalid-feedback bnote-validation-msg d-block"></div>');
		$container.append($msg);
	}
	if(msg) {
		$msg.text(msg);
	}
	else {
		$msg.remove();
	}
}

function bnoteValidateMeetingRules(baseName, dateEl, timeEl) {
	if(baseName !== "meetingtime" && baseName !== "approve_until") {
		return true;
	}
	var beginVal = bnoteGetDateTimeValue("begin");
	var currentVal = bnoteGetDateTimeValue(baseName);
	var beginDt = bnoteParseDateTimeStr(beginVal);
	var curDt = bnoteParseDateTimeStr(currentVal);
	if(!beginDt || !curDt) {
		return true;
	}
	var offsetMs = (baseName === "meetingtime") ? 60000 : 120000;
	var minBefore = new Date(beginDt.getTime() - offsetMs);
	var ok = (curDt.getTime() <= minBefore.getTime());
	if(!ok) {
		var label = (baseName === "meetingtime") ? "Treffpunkt" : "Rückmeldung";
		var minTxt = (baseName === "meetingtime") ? "1 Minute" : "2 Minuten";
		var msg = label + " muss mindestens " + minTxt + " vor dem Termin liegen.";
		bnoteSetFieldMessage(dateEl, msg);
		bnoteSetFieldMessage(timeEl, msg);
	}
	else {
		bnoteSetFieldMessage(dateEl, null);
		bnoteSetFieldMessage(timeEl, null);
	}
	bnoteApplyValidationState(dateEl, ok);
	bnoteApplyValidationState(timeEl, ok);
	return ok;
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
	if(ok) {
		bnoteSetFieldMessage(dateEl, null);
		bnoteSetFieldMessage(timeEl, null);
		return bnoteValidateMeetingRules(baseId, dateEl, timeEl);
	}
	else {
		bnoteSetFieldMessage(dateEl, "Bitte Datum und Uhrzeit vollständig ausfüllen.");
		bnoteSetFieldMessage(timeEl, "Bitte Datum und Uhrzeit vollständig ausfüllen.");
	}
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
		if(!okNative) {
			bnoteSetFieldMessage(el, el.validationMessage || "Ungültiger Wert.");
		}
		else {
			bnoteSetFieldMessage(el, null);
		}
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

function bnoteHandleOriginChange() {
	// get all origin values and build target values
	var h = "";
	var m = "";
	var dt = "";
	$(".copyDateOrigin, #begin_date, #begin_time").each(function(i, obj) {
		if($(obj).hasClass("hour")) {
			h = $(obj).val();
		}
		else if($(obj).hasClass("minute")) {
			m = $(obj).val();
		}
		else if($(obj).hasClass("bnote-datetime-time") || $(obj).attr("type") == "time" || $(obj).attr("id") == "begin_time") {
			var t = $(obj).val();
			if(t && t.indexOf(":") > 0) {
				h = t.split(":")[0];
				m = t.split(":")[1];
			}
		}
		else if($(obj).hasClass("bnote-datetime-date") || $(obj).attr("type") == "date" || $(obj).attr("id") == "begin_date") {
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
	var originDateTime = (dt != "" && h != "" && m != "") ? (dt + "T" + h + ":" + m) : "";
	var originDateObj = bnoteParseDateTimeStr(originDateTime);
	var adjustedMeeting = originDateObj ? new Date(originDateObj.getTime() - 60000) : null;
	var adjustedApprove = originDateObj ? new Date(originDateObj.getTime() - 120000) : null;
	var meetingDate = adjustedMeeting ? bnoteLocalDateStr(adjustedMeeting) : "";
	var meetingTime = adjustedMeeting ? bnoteLocalTimeStr(adjustedMeeting) : "";
	var approveDate = adjustedApprove ? bnoteLocalDateStr(adjustedApprove) : "";
	var approveTime = adjustedApprove ? bnoteLocalTimeStr(adjustedApprove) : "";
	var endAuto = originDateObj ? new Date(originDateObj.getTime() + 3600000) : null;
	var endDate = endAuto ? bnoteLocalDateStr(endAuto) : "";
	var endTime = endAuto ? bnoteLocalTimeStr(endAuto) : "";
	$('.copyDateTarget, #end_date, #end_time, #approve_until_date, #approve_until_time, #meetingtime_date, #meetingtime_time').each(function(i, obj) {
		var $obj = $(obj);
		var name = $obj.attr("name") || "";
		var id = $obj.attr("id") || "";
		var isMeeting = (name.indexOf("meetingtime") === 0 || id.indexOf("meetingtime") === 0);
		var isApprove = (name.indexOf("approve_until") === 0 || id.indexOf("approve_until") === 0);
		var isEnd = (name.indexOf("end") === 0 || id.indexOf("end") === 0);
		if($obj.hasClass("hour")) {
			$obj.val(h);
		}
		else if($obj.hasClass("minute")) {
			$obj.val(m);
		}
		else if($obj.hasClass("bnote-datetime-time") || $obj.attr("type") == "time") {
			if(isMeeting && meetingTime != "") {
				$obj.val(meetingTime);
			}
			else if(isApprove && approveTime != "") {
				$obj.val(approveTime);
			}
			else if(isEnd && endTime != "") {
				$obj.val(endTime);
			}
			else if(h != "" && m != "") {
				$obj.val(h + ":" + m);
			}
			$obj.trigger("input");
		}
		else if($obj.hasClass("bnote-datetime-date") || $obj.attr("type") == "date") {
			if(isMeeting && meetingDate != "") {
				$obj.val(meetingDate);
			}
			else if(isApprove && approveDate != "") {
				$obj.val(approveDate);
			}
			else if(isEnd && endDate != "") {
				$obj.val(endDate);
			}
			else {
				$obj.val(dt);
			}
			$obj.trigger("input");
		}
		else {
			if(isMeeting && originDateObj) {
				$obj.val(meetingDate + " " + meetingTime);
			}
			else if(isApprove && originDateObj) {
				$obj.val(approveDate + " " + approveTime);
			}
			else if(isEnd && originDateObj) {
				$obj.val(endDate + " " + endTime);
			}
			else {
				$obj.val(val);
			}
		}
		bnoteValidateElement(obj);
	});
}

$(document).ready(function() {
	bnoteInitTheme();
	$(".bnote-theme-toggle").on("click", function() {
		var current = document.documentElement.getAttribute("data-bnote-theme") || "light";
		bnoteSetTheme(current === "dark" ? "light" : "dark");
	});
	bnoteAutofillFromOriginIfEmpty();

	$(".copyDateOrigin, #begin_date, #begin_time").on('change', function(event) {
		bnoteHandleOriginChange();
	});
	
	
	$("#fb-fileupload").dropzone({
		url: $('#fb-fileupload-form').attr('action')
	});

	bnoteAttachValidation(document);
});
