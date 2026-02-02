<HEAD>
 <title><?php echo $system_data->getApplicationName() . " | " . $system_data->getModuleTitle(); ?></title>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
 
 <link rel="shortcut icon" href="favicon.png" type="image/png" />
 <link rel="icon" href="favicon.png" type="image/png" />
  
 <link rel='stylesheet' type='text/css' href='https://fonts.googleapis.com/css?family=PT+Sans:400,700,400italic,700italic'>
 <link rel="stylesheet" href="vendor/twbs/bootstrap/dist/css/bootstrap.min.css" />
 <link rel="stylesheet" type="text/css" href="lib/jquery/jquery.jqplot.min.css" /> 
 <link rel="stylesheet" type="text/css" href="vendor/enyo/dropzone/dist/min/dropzone.min.css" />
 <link rel="stylesheet" href="vendor/twbs/bootstrap-icons/font/bootstrap-icons.min.css" />
 <link rel="stylesheet" type="text/css" href="vendor/datatables/datatables/media/css/jquery.dataTables.min.css" />
 <script type="text/javascript">
 (function() {
   try {
     var stored = localStorage.getItem("bnote-theme");
     var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
     var theme = (stored === "dark" || stored === "light") ? stored : (prefersDark ? "dark" : "light");
     var lightTheme = "<?php echo $system_data->getTheme(); ?>";
     var darkTheme = "dark";
     var themeFolder = (theme === "dark") ? darkTheme : lightTheme;
     var link = document.createElement("link");
     link.rel = "stylesheet";
     link.type = "text/css";
     link.id = "bnote-theme-css";
     link.setAttribute("data-light-theme", lightTheme);
     link.setAttribute("data-dark-theme", darkTheme);
     link.href = "style/css/" + themeFolder + "/bnote.css";
     document.write(link.outerHTML);
     document.documentElement.setAttribute("data-bnote-theme", theme);
   } catch(e) {
     try {
       var linkFallback = document.createElement("link");
       linkFallback.rel = "stylesheet";
       linkFallback.type = "text/css";
       linkFallback.id = "bnote-theme-css";
       linkFallback.setAttribute("data-light-theme", "<?php echo $system_data->getTheme(); ?>");
       linkFallback.setAttribute("data-dark-theme", "dark");
       linkFallback.href = "style/css/<?php echo $system_data->getTheme(); ?>/bnote.css";
       document.write(linkFallback.outerHTML);
     } catch(e2) {}
   }
 })();
 </script>
 <noscript>
  <link rel="stylesheet" type="text/css" id="bnote-theme-css" data-light-theme="<?php echo $system_data->getTheme(); ?>" data-dark-theme="dark" href="<?php echo "style/css/" . $system_data->getTheme() . "/bnote.css"?>" />
 </noscript>
 <link rel='stylesheet' type="text/css" href='vendor/fullcalendar/fullcalendar/dist/fullcalendar.css' />

 <script type="text/javascript" src="vendor/components/jquery/jquery.min.js"></script>
 <script type="text/javascript" src="lib/jquery/jquery.jqplot.min.js"></script>
 <script type="text/javascript" src="vendor/twbs/bootstrap/dist/js/bootstrap.min.js"></script>
 <script type="text/javascript" src="vendor/datatables/datatables/media/js/jquery.dataTables.min.js"></script>
 <script type="text/javascript" src='lib/jquery/moment.min.js'></script>
 <script type="text/javascript" src='vendor/fullcalendar/fullcalendar/dist/fullcalendar.min.js'></script>
 <script type="text/javascript" src="vendor/tinymce/tinymce/tinymce.min.js" ></script>
 <script type="text/javascript" src="vendor/enyo/dropzone/dist/min/dropzone.min.js"></script>
 <script type="text/javascript" src="<?php echo $GLOBALS["DIR_LOGIC"]; ?>main.js"></script>
 <script type="text/javascript">
<?php $system_data->regex->getJSValidationFunctions(); ?>
 </script>
  
</HEAD>
