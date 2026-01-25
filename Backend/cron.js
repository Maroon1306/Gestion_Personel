const cron = require('node-cron');
const axios = require('axios');

// Exécuter tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Début du calcul automatique de performance...');
    
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    
    const response = await axios.post(`${process.env.BACKEND_URL || 'http://localhost:4000'}/performance/daily-calculation`, {
      month,
      year
    });
    
    console.log('Calcul automatique terminé:', response.data);
  } catch (error) {
    console.error('Erreur lors du calcul automatique:', error);
  }
});

console.log('Job cron démarré pour le calcul de performance');