<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Central Mail Creation in BNote
 * @author Matti
 *
 */
class Mailing {
	
	private $fromId = null;
	private $to;
	private $bcc = null;
	private $subject;
	private $body;
	private $isHtml = false;
	private $attachments = array();
	
	private $sysdata;
	
	/**
	 * Creates a new mail with the given parameters and default from and encoding.<br/>
	 * <strong>Make sure to call {@link sendMail()} to actually send this mail.</strong>
	 * @param string $to Receipient; can be null.
	 * @param string $subject Message subject.
	 * @param string $body Message body.
	 */
	function __construct($subject, $body) {
		$this->subject = $subject;
		$this->body = $body;
		
		// set default from as system-admin mail
		global $system_data;
		$this->sysdata = $system_data;
	}
	
	public function setFromUser($userId) {
		$this->fromId = $userId;
	}
	
	public function getTo() {
		return $this->to;
	}
	
	public function setTo($to) {
		$this->to = $to;
	}
	
	public function getBcc() {
		return $this->bcc;
	}
	
	public function setBcc($addresses) {
		$this->bcc = $addresses;
	}
	
	public function getSubject() {
		return $this->subject;
	}
	
	public function setSubject($subject) {
		$this->subject = $subject;
	}
	
	public function getBody() {
		return $this->body;
	}
	
	public function setBody($body) {
		$this->body = $body;
		$this->isHtml = false;
	}
	
	public function isHtmlBody() {
		return $this->isHtml;
	}
	
	/**
	 * Just give a plain HTML representation of your message.<br/>
	 * Do not worry about heading or this kinda stuff. Only body.
	 * @param string $html
	 */
	public function setBodyInHtml($html) {
		$this->isHtml = true;
		$this->body = $html;
	}
	
	/**
	 * Appends the given text to the body/message.<br/>
	 * <i>Can be used without initializing the message.</i>
	 * @param string $text Text to append.
	 */
	public function appendToBody($text) {
		if($this->body == null) {
			$this->body = "";
		}
		$this->body .= $text;
	}
	
	public function addAttachment($attachment, $name) {
		array_push($this->attachments, array($attachment, $name));
	}
	
	/**
	 * Call this method to send the email.<br/>
	 * <strong>Just by creating an object of this class, no mail is sent!</strong>
	 */
	public function sendMail() {
		return $this->sendMailInternal(false);
	}
	
	/**
	 * Sends the email without throwing BNoteError on failures.
	 */
	public function sendMailQuietly() {
		return $this->sendMailInternal(true);
	}
	
	private function sendMailInternal($silent) {
		// abort if in demo mode
		if($this->sysdata->inDemoMode()) {
			if($silent) return false;
			new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_1"));
			return false;
		}
		
		// building receipient
		$explicitTo = ($this->to != null && $this->to != "");
		if($this->to == null) {
			$to = "";
		}
		else {
			$to = $this->to;
		}
		
		// normalize bcc list (unique, trimmed)
		$normalizedBcc = array();
		$bccUnique = array();
		if($this->bcc != NULL) {
			foreach($this->bcc as $addr) {
				$addr = trim($addr);
				if($addr == "") continue;
				$key = strtolower($addr);
				if(isset($bccUnique[$key])) continue;
				$bccUnique[$key] = true;
				$normalizedBcc[] = $addr;
			}
		}
		
		// building sender information
		$fromEmail = $this->sysdata->getCompanyInformation()["Mail"];
			if($this->fromId == null) {
				$fromName = "BNote";
			}
			else {
				$contact = $this->sysdata->getUsersContact($this->fromId);
				$fromName =  $contact["name"] . " " . $contact["surname"] . " via BNote";
				$replyTo = $contact["email"];
				if($to == "") {
					$to = $contact["email"];
				}
			}
		
		// validation
		if(($normalizedBcc == null || count($normalizedBcc) == 0) && $this->to == null) {
			// no recipients (e.g. all contacts without email) -> silently abort
			return false;
		}
		if($this->body == null) {
			if($silent) return false;
			new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_3"));
		}
		if($this->subject == null) {
			if($silent) return false;
			new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_4"));
		}
		
		// handle charset
		$strenc = mb_detect_encoding($this->subject, 'UTF-8', true);
		if($strenc == false) {
			$subject = utf8_encode($this->subject);
		}
		else {
			$subject = $this->subject;
		}
		
		$strenc = mb_detect_encoding($this->body, 'UTF-8', true);
		if($strenc == false) {
			$body = utf8_encode($this->body);
		}
		else {
			$body = $this->body;
		}
		
		// load template
		$tpl_path = "data/mail_template.html";
		$dir_prefix = "";
		if(isset($GLOBALS['dir_prefix'])) {
			$dir_prefix = $GLOBALS["dir_prefix"];
		}
		$template = null;
		$candidates = array(
			$dir_prefix . $tpl_path,
			dirname(__DIR__, 3) . "/" . $tpl_path,
			dirname(__DIR__, 2) . "/" . $tpl_path
		);
		foreach($candidates as $candidate) {
			if($candidate != null && $candidate != "" && file_exists($candidate)) {
				$template = file_get_contents($candidate);
				break;
			}
		}
		if($template === null || $template === false) {
			// fallback to inline template if no file exists (e.g. empty data volume)
			$template = '<!doctype html><html><head><meta charset="%encoding%"><title>%title%</title></head><body style="font-family:Arial,Helvetica,sans-serif;background:#f6f6f6;margin:0;padding:24px;"><div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e0e0e0;border-radius:6px;padding:24px;"><h2 style="margin:0 0 12px 0;color:#143452;">%title%</h2><div style="color:#2F4152;line-height:1.5;">%content%</div><hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;"><div style="font-size:12px;color:#666;">%footer% &middot; <a href="%link%" style="color:#356A9C;text-decoration:none;">%link_name%</a></div></div></body></html>';
		}
		
		// replace placeholders
		$tpl_mail = str_replace("%encoding%", 'utf-8', $template);
		
		$tpl_mail = str_replace("%title%", $subject, $tpl_mail);
		$tpl_mail = str_replace("%content%", $body, $tpl_mail);
		$link = $this->sysdata->getSystemURL();
		$tpl_mail = str_replace("%link%", $link, $tpl_mail);
		$tpl_mail = str_replace("%link_name%", $this->sysdata->getCompany(), $tpl_mail);
		$tpl_mail = str_replace("%footer%", Lang::txt("mail_footerText"), $tpl_mail);
		
		// sending mail
		$mail = new PHPMailer(true);
		try {
			$mail->isSMTP();  // use SMTP from Docker env
			$smtpHost = getenv("BNOTE_SMTP_HOST");
			$smtpPort = getenv("BNOTE_SMTP_PORT");
			$smtpUser = getenv("BNOTE_SMTP_USER");
			$smtpPass = getenv("BNOTE_SMTP_PASS");
			$smtpSecure = getenv("BNOTE_SMTP_SECURE");
			if($smtpHost == false || $smtpHost == "") {
				new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_5") . " SMTP host missing");
				return false;
			}
			$mail->Host = $smtpHost;
			if($smtpPort != false && $smtpPort != "") {
				$mail->Port = intval($smtpPort);
			}
			$mail->SMTPAuth = ($smtpUser != false && $smtpUser != "");
			if($mail->SMTPAuth) {
				$mail->Username = $smtpUser;
				$mail->Password = ($smtpPass == false ? "" : $smtpPass);
			}
			if($smtpSecure != false && $smtpSecure != "") {
				$mail->SMTPSecure = $smtpSecure;
			} else if(isset($mail->Port) && $mail->Port == 465) {
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
			} else {
				$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
			}
			$mail->SMTPAutoTLS = true;
			$mail->CharSet = PHPMailer::CHARSET_UTF8;
			$envFromEmail = getenv("BNOTE_SMTP_FROM_EMAIL");
			$envFromName = getenv("BNOTE_SMTP_FROM_NAME");
			$mail->setFrom(($envFromEmail != false && $envFromEmail != "") ? $envFromEmail : $fromEmail,
				($envFromName != false && $envFromName != "") ? $envFromName : $fromName);
			
			// if no explicit To was provided, move first BCC to To to avoid extra recipients
			if(!$explicitTo && count($normalizedBcc) > 0) {
				$to = $normalizedBcc[0];
				array_shift($normalizedBcc);
			}
			if(isset($replyTo)) {
				$mail->addReplyTo($replyTo);
			}
			$mail->addAddress($to);
			if($normalizedBcc != NULL) {
				foreach($normalizedBcc as $address) {
					if($address != "") {
						$mail->addBCC($address);
					}
				}
			}
			$mail->isHTML(true);
			$mail->Subject = $subject;
			$mail->Body = $tpl_mail;
			
			if(count($this->attachments) > 0) {
				foreach($this->attachments as $atmt) {
					$mail->addAttachment($atmt[0], $atmt[1]);
				}
			}
			
			return $mail->send();
		} catch (\Exception $e) {
			if(!$silent) {
				new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_5") . " {$mail->ErrorInfo}");
			}
		}
		return False;
	}
	
	/**
	 * Calls the {@link sendMail()} method and throws and error if it returns false.
	 */
	public function sendMailWithFailError() {
		if($this->sendMail() === false) {
			new BNoteError(Lang::txt("Mailing_sendMail.BNoteError_6"));
		}
	}
}
