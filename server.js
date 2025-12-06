const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route principale - servir le fichier HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Serveur Atelier Olfactive en ligne',
        date: new Date().toISOString()
    });
});

// Route pour gérer les soumissions (optionnel - pour logging)
app.post('/api/log-reservation', (req, res) => {
    const reservation = req.body;
    console.log('Nouvelle réservation reçue:', reservation);
    
    // Ici vous pouvez ajouter la logique pour sauvegarder en base de données
    // ou envoyer des notifications supplémentaires
    
    res.json({ 
        success: true, 
        message: 'Réservation loggée avec succès',
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    console.log('📧 EmailJS configuré pour les envois d\'emails');
    console.log('📋 Routes disponibles:');
    console.log(`   - GET  /            : Page de réservation`);
    console.log(`   - GET  /api/health  : Vérification du serveur`);
    console.log(`   - POST /api/log-reservation : Log des réservations`);
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erreur interne du serveur' 
    });
});