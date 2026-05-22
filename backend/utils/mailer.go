package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// SendVerificationEmail dispatches a 6-digit verification code using standard SMTP.
// If no SMTP host is configured, it falls back to a debug console print so developers
// can easily test registration locally without a real SMTP configuration.
func SendVerificationEmail(toEmail, code string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpEmail := os.Getenv("SMTP_EMAIL")
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	smtpFromName := os.Getenv("SMTP_FROM_NAME")
	if smtpFromName == "" {
		smtpFromName = "FandomRealm Store"
	}

	if smtpHost == "" || smtpEmail == "" || smtpPassword == "" {
		// Beautiful fallback mock logging
		fmt.Println("\n================ MOCK SMTP DISPATCH ================")
		fmt.Printf("TO:      %s\n", toEmail)
		fmt.Printf("SUBJECT: Verify your FandomRealm account! 🧙‍♂️\n")
		fmt.Printf("BODY:    Welcome to FandomRealm! Your 6-digit verification code is:\n\n")
		fmt.Printf("         >>>  [ %s ]  <<<\n\n", code)
		fmt.Println("====================================================\n")
		return nil
	}

	// Setup SMTP Auth
	auth := smtp.PlainAuth("", smtpEmail, smtpPassword, smtpHost)

	subject := "Verify your FandomRealm account! 🧙‍♂️"
	body := fmt.Sprintf(
		"Subject: %s\n"+
			"From: %s <%s>\n"+
			"To: %s\n"+
			"MIME-version: 1.0;\n"+
			"Content-Type: text/html; charset=\"UTF-8\";\n\n"+
			"<html>"+
			"<body style=\"font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; margin: 0;\">"+
			"<div style=\"max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); text-align: center;\">"+
			"<h1 style=\"font-size: 28px; font-weight: 900; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; color: transparent; margin-bottom: 20px; letter-spacing: 2px;\">FANDOMREALM</h1>"+
			"<h2 style=\"font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 15px;\">Verify Your Portal Access</h2>"+
			"<p style=\"font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;\">Welcome to FandomRealm! Please verify your email address to unlock your portal to magical sitcoms, wands, lightsticks, and custom merchandise.</p>"+
			"<div style=\"display: inline-block; margin: 20px auto; padding: 16px 40px; background: rgba(59, 130, 246, 0.1); border: 2px dashed #3b82f6; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #60a5fa; box-shadow: 0 4px 12px rgba(59,130,246,0.15);\">%s</div>"+
			"<p style=\"font-size: 12px; color: #64748b; margin-top: 30px;\">This code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>"+
			"</div>"+
			"</body>"+
			"</html>",
		subject, smtpFromName, smtpEmail, toEmail, code,
	)

	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	err := smtp.SendMail(addr, auth, smtpEmail, []string{toEmail}, []byte(body))
	if err != nil {
		log.Printf("Failed to send real SMTP email: %v", err)
		return err
	}

	log.Printf("Real SMTP email successfully dispatched to %s", toEmail)
	return nil
}
