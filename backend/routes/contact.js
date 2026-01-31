const express = require('express');
const { query } = require('../db');
const { sendEmail } = require('../services/mailer');
const { notifyAdminNewContactMessage } = require('../services/sms');

const router = express.Router();

/**
 * POST /api/contact
 * Reçoit un message de contact d'un visiteur/étudiant
 * Envoie un email à l'admin et un SMS d'alerte
 */


router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        ok: false,
        message: 'Tous les champs sont requis (name, email, subject, message)',
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        ok: false,
        message: 'Le message doit contenir au moins 10 caractères',
      });
    }

    // Données de l'admin
    const adminEmail = process.env.ADMIN_EMAIL || 'mlamaranapalaga21@gmail.com';
    const adminPhone = process.env.ADMIN_PHONE || '53875648';

    // Préparer le contenu de l'email
    const emailSubject = `📧 Nouveau message de contact - ${subject}`;
    const emailText = `
Bonjour,

Vous avez reçu un nouveau message de contact.

EXPÉDITEUR
──────────────────
Nom: ${name}
Email: ${email}

SUJET: ${subject}

MESSAGE
──────────────────
${message}

──────────────────
Pour répondre, envoyez un email à: ${email}
    `.trim();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouveau message de contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 15px; margin-top: 0;">
      📧 Nouveau message de contact
    </h2>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e9ecef;">
      <h3 style="margin-top: 0; color: #198754; font-size: 18px;">👤 Expéditeur</h3>
      <p style="margin: 10px 0;"><strong>Nom :</strong> ${name}</p>
      <p style="margin: 10px 0;">
        <strong>Email :</strong> 
        <a href="mailto:${email}" style="color: #0d6efd; word-break: break-all;">${email}</a>
      </p>
    </div>

    <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #0d6efd; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0d6efd;">
        Sujet: ${subject}
      </p>
    </div>

    <div style="margin: 25px 0;">
      <h4 style="color: #495057; margin-bottom: 10px;">Message :</h4>
      <div style="background: #fff; padding: 15px; border-left: 4px solid #0d6efd; background-color: #f8f9fa; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
        ${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </div>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
      <h4 style="color: #495057; margin-bottom: 10px;">Répondre :</h4>
      <p style="margin: 0;">
        <a href="mailto:${email}?subject=Re: ${subject.replace(/\s/g, '%20')}" style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Répondre par email
        </a>
      </p>
    </div>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-bottom: 0;">
      Plateforme Gestion des Offres de Stage — ${new Date().getFullYear()}
    </p>
  </div>
</body>
</html>
    `.trim();

    // Envoyer l'email à l'admin
    const emailResult = await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    if (!emailResult.ok) {
      console.error('[Contact] Erreur envoi email admin:', emailResult.error);
    }

    // Envoyer un SMS d'alerte à l'admin
    const smsResult = await notifyAdminNewContactMessage(
      { name, email, subject, message },
      adminPhone
    );

    if (!smsResult.ok) {
      console.error('[Contact] Erreur envoi SMS admin:', smsResult.error);
    }

    // Envoyer un email de confirmation à l'expéditeur
    const confirmationEmailText = `
Bonjour ${name},

Merci de nous avoir contacté. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.

En attendant, voici un résumé de votre demande:

SUJET: ${subject}

Vous recevrez une réponse à l'adresse email: ${email}

Cordialement,
L'équipe Gestion des Offres de Stage
    `.trim();

    const confirmationEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmation de réception</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">✓</span>
      </div>
      <h2 style="color: #28a745; margin: 0;">Message reçu avec succès !</h2>
    </div>

    <p style="font-size: 16px;">Bonjour <strong>${name}</strong>,</p>
    
    <p style="font-size: 16px;">
      Merci de nous avoir contacté. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.
    </p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
      <h4 style="margin-top: 0; color: #28a745;">📋 Résumé de votre demande</h4>
      <p style="margin: 10px 0;"><strong>Sujet :</strong> ${subject}</p>
      <p style="margin: 10px 0;"><strong>Email de contact :</strong> ${email}</p>
    </div>

    <p style="font-size: 14px; color: #6c757d;">
      Vous recevrez une réponse à l'adresse email <strong>${email}</strong>.
    </p>

    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
      <p style="margin: 0; color: #155724;">
        <strong>ℹ️ Info :</strong> Les réponses sont généralement envoyées dans les 24 à 48 heures.
      </p>
    </div>

    <hr style="margin-top: 40px; border: none; border-top: 1px solid #dee2e6;">
    <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-bottom: 0;">
      Plateforme Gestion des Offres de Stage — ${new Date().getFullYear()}
    </p>
  </div>
</body>
</html>
    `.trim();

    await sendEmail({
      to: email,
      subject: '✓ Confirmation de réception de votre message',
      text: confirmationEmailText,
      html: confirmationEmailHtml,
    });

    return res.json({
      ok: true,
      message: 'Message envoyé avec succès. Vous recevrez une réponse dans les plus brefs délais.',
      emailSent: emailResult.ok,
      smsSent: smsResult.ok,
    });
  } catch (err) {
    console.error('[Contact] Erreur:', err);
    return res.status(500).json({
      ok: false,
      message: 'Erreur lors du traitement de votre message',
    });
  }
});

module.exports = router;
