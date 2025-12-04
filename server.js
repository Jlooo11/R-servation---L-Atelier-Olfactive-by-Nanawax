const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Vérification de la connexion SMTP
transporter.verify(function(error, success) {
    if (error) {
        console.log('Erreur de configuration SMTP:', error);
    } else {
        console.log('Serveur SMTP prêt à envoyer des emails');
    }
});

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Backend pour L\'Atelier Olfactive - API de réservation' });
});

// Route pour soumettre une réservation
app.post('/api/reservation', async (req, res) => {
    try {
        const { nom, prenom, email, taille, couleur } = req.body;

        // Validation des champs obligatoires
        if (!nom || !prenom || !taille || !couleur) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez remplir tous les champs obligatoires'
            });
        }

        // HTML de l'email
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Nouvelle Réservation - L'Atelier Olfactive</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #d3b9a0 0%, #e8d5c4 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { max-width: 150px; margin-bottom: 20px; }
                .content { background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #583e30; margin-bottom: 10px; }
                h2 { color: #7a5c48; margin-top: 30px; margin-bottom: 15px; }
                .detail-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #583e30; min-width: 150px; display: inline-block; }
                .value { color: #333; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #7a5c48; font-size: 12px; }
                .highlight { background-color: #f9f5f1; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>L'Atelier Olfactive</h1>
                    <p style="color: #7a5c48; font-size: 18px;">by Nanawax La Maison</p>
                </div>
                
                <div class="content">
                    <h2>Nouvelle Réservation Confirmée ✨</h2>
                    
                    <div class="highlight">
                        <p style="margin: 0; font-size: 16px;">
                            Une nouvelle personne s'est inscrite à l'événement exclusif du <strong>21 décembre 2025</strong>.
                        </p>
                    </div>
                    
                    <h2>Détails du participant :</h2>
                    
                    <div class="detail-item">
                        <span class="label">Nom complet :</span>
                        <span class="value">${prenom} ${nom}</span>
                    </div>
                    
                    ${email ? `
                    <div class="detail-item">
                        <span class="label">Email :</span>
                        <span class="value">${email}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-item">
                        <span class="label">Taille vêtement :</span>
                        <span class="value" style="font-weight: bold; color: #a1887f;">${taille}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="label">Couleur préférée :</span>
                        <span class="value">
                            <span style="display: inline-block; width: 15px; height: 15px; border-radius: 50%; background-color: ${getColorCode(couleur)}; margin-right: 8px; vertical-align: middle;"></span>
                            ${couleur}
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="label">Date de l'événement :</span>
                        <span class="value">21 décembre 2025</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="label">Heure de réservation :</span>
                        <span class="value">${new Date().toLocaleString('fr-FR')}</span>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 L'Atelier Olfactive by Nanawax La Maison</p>
                        <p>Cette réservation a été envoyée automatiquement via le formulaire en ligne.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Texte alternatif pour les clients email
        const textContent = `
        NOUVELLE RÉSERVATION - L'Atelier Olfactive
        ===========================================
        
        Participant : ${prenom} ${nom}
        ${email ? `Email : ${email}` : 'Email : Non fourni'}
        Taille vêtement : ${taille}
        Couleur préférée : ${couleur}
        
        Événement : L'Atelier Olfactive by Nanawax
        Date : 21 décembre 2025
        Heure de réservation : ${new Date().toLocaleString('fr-FR')}
        
        ---
        Ce message a été envoyé automatiquement.
        `;

        // Configuration de l'email
        const mailOptions = {
            from: `"L'Atelier Olfactive" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL || 'jeanloickone@gmail.com',
            subject: `🎫 Nouvelle Réservation: ${prenom} ${nom} - L'Atelier Olfactive`,
            text: textContent,
            html: htmlContent,
            replyTo: email || process.env.SMTP_USER
        };

        // Envoi de l'email
        await transporter.sendMail(mailOptions);

        // Réponse de succès
        res.status(200).json({
            success: true,
            message: 'Réservation enregistrée et email envoyé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de la réservation',
            error: error.message
        });
    }
});

// Fonction utilitaire pour obtenir le code couleur
function getColorCode(colorName) {
    const colorMap = {
        'Blanc': '#ffffff',
        'Noir': '#000000',
        'Vert': '#4caf50',
        'Bleu': '#2196f3',
        'Marron': '#795548',
        'Saumon': '#ff8a65',
        'Violet': '#9c27b0',
        'Jaune': '#ffeb3b'
    };
    return colorMap[colorName] || '#cccccc';
}

// Route pour récupérer toutes les réservations (si vous voulez stocker en base de données plus tard)
app.get('/api/reservations', (req, res) => {
    // Pour l'instant, retourne un message
    res.json({
        message: 'Endpoint pour récupérer les réservations',
        note: 'Implémentez une base de données pour stocker les réservations'
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
    console.log(`📧 Les emails seront envoyés à: ${process.env.RECIPIENT_EMAIL || 'jeanloickone@gmail.com'}`);
});