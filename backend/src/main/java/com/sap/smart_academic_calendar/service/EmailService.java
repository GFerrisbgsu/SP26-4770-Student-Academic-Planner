package com.sap.smart_academic_calendar.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

/**
 * Email service using Resend API for sending transactional emails.
 * Uses constructor injection following project conventions.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;
    private static final int RESET_TOKEN_LENGTH = 32;
    private static final SecureRandom RANDOM = new SecureRandom();
    
    private final Resend resendClient;
    
    @Value("${app.mail.from}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(Resend resendClient) {
        this.resendClient = resendClient;
    }

    /**
     * Send an email via Resend API.
     * 
     * @param to Recipient email address
     * @param subject Email subject line
     * @param htmlContent HTML body content
     * @param from Sender email (must be from verified domain in Resend)
     * @return Resend email ID for tracking
     * @throws ResendException if email fails to send
     */
    public String sendEmail(String to, String subject, String htmlContent, String from) throws ResendException {
        CreateEmailOptions emailRequest = CreateEmailOptions.builder()
            .from(from)
            .to(to)
            .subject(subject)
            .html(htmlContent)
            .build();

        CreateEmailResponse response = resendClient.emails().send(emailRequest);
        
        log.info("Email sent successfully to {} with ID: {}", to, response.getId());
        return response.getId();
    }

    /**
     * Generate a random 6-character verification code.
     * 
     * @return Random alphanumeric verification code
     */
    public String generateVerificationCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return code.toString();
    }

    /**
     * Generate a random password reset token.
     *
     * @return Random alphanumeric token
     */
    public String generatePasswordResetToken() {
        StringBuilder token = new StringBuilder(RESET_TOKEN_LENGTH);
        for (int i = 0; i < RESET_TOKEN_LENGTH; i++) {
            token.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return token.toString();
    }

    /**
     * Send verification email to user with verification code.
     * 
     * @param to User's email address
     * @param username User's username
     * @param verificationCode 6-digit verification code
     * @throws ResendException if email fails to send
     */
    public void sendVerificationEmail(String to, String username, String verificationCode) throws ResendException {
        String subject = "Verify Your Email - Smart Academic Calendar";
        
        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 30px; }
                    .code { 
                        font-size: 32px; 
                        font-weight: bold; 
                        letter-spacing: 5px; 
                        color: #3b82f6; 
                        text-align: center; 
                        padding: 20px; 
                        background: white; 
                        border: 2px dashed #3b82f6; 
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <h2>Hello, %s!</h2>
                        <p>Thank you for registering with Smart Academic Calendar. Please verify your email address by using the code below:</p>
                        <div class="code">%s</div>
                        <p>This verification code will expire in 15 minutes.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>Smart Academic Calendar © 2026</p>
                    </div>
                </div>
            </body>
            </html>
            """, username, verificationCode);

        sendEmail(to, subject, htmlContent, fromEmail);
        log.info("Verification email sent to {}", to);
    }

    /**
     * Send password reset email to user with reset token.
     *
     * @param to User's email address
     * @param username User's username
     * @param resetToken Password reset token
     * @throws ResendException if email fails to send
     */
    public void sendPasswordResetEmail(String to, String username, String resetToken) throws ResendException {
        String subject = "Password Reset Request - Smart Academic Calendar";
        
        // Construct the password reset link
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, resetToken);

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #111827; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 30px; }
                    .button {
                        display: inline-block;
                        padding: 14px 28px;
                        background: #111827;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        margin: 20px 0;
                    }
                    .link { color: #6b7280; font-size: 12px; word-break: break-all; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <h2>Hello, %s!</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <div style="text-align: center;">
                            <a href="%s" class="button">Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p class="link">%s</p>
                        <p>This link will expire in 30 minutes.</p>
                        <p>If you did not request a password reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>Smart Academic Calendar © 2026</p>
                    </div>
                </div>
            </body>
            </html>
            """, username, resetLink, resetLink);

        sendEmail(to, subject, htmlContent, fromEmail);
        log.info("Password reset email sent to {} with reset link", to);
    }
}