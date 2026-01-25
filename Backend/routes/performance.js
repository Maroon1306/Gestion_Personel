const express = require('express');
const router = express.Router();
const db = require('../db');

// Constantes de performance
const MONTHLY_TARGET_HOURS = 176; // 22 jours × 8 heures
const DAILY_TARGET_HOURS = 8;
const WORKING_DAYS_PER_MONTH = 22;

// Calculer la performance pour un personnel
async function calculatePerformance(personnelId, month, year) {
    try {
        // Récupérer toutes les présences du mois
        const [attendance] = await db.query(`
            SELECT SUM(hours_worked) as total_hours, 
                   COUNT(DISTINCT date) as days_worked,
                   COUNT(*) as total_records
            FROM attendance 
            WHERE personnel_id = ? 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
            AND status != 'absent'
        `, [personnelId, month, year]);

        const totalHours = parseFloat(attendance[0]?.total_hours) || 0;
        
        // Calcul du pourcentage de performance
        let performancePercentage = 0;
        
        if (totalHours > 0) {
            performancePercentage = (totalHours / MONTHLY_TARGET_HOURS) * 100;
            
            // Limiter à 100% (sauf si heures supplémentaires)
            if (performancePercentage > 100) {
                performancePercentage = 100 + ((performancePercentage - 100) / 10); // Bonus réduit pour heures sup
            }
            
            // Arrondir à 2 décimales
            performancePercentage = Math.min(performancePercentage, 200); // Limite max 200%
            performancePercentage = parseFloat(performancePercentage.toFixed(2));
        }

        // Vérifier si une entrée existe déjà
        const [existing] = await db.query(`
            SELECT id FROM performance 
            WHERE personnel_id = ? AND month = ? AND year = ?
        `, [personnelId, month, year]);

        if (existing.length > 0) {
            // Mettre à jour
            await db.query(`
                UPDATE performance 
                SET total_hours_worked = ?, 
                    performance_percentage = ?,
                    updated_at = NOW()
                WHERE personnel_id = ? AND month = ? AND year = ?
            `, [totalHours, performancePercentage, personnelId, month, year]);
        } else {
            // Insérer
            await db.query(`
                INSERT INTO performance 
                (personnel_id, month, year, total_hours_worked, performance_percentage)
                VALUES (?, ?, ?, ?, ?)
            `, [personnelId, month, year, totalHours, performancePercentage]);
        }

        // Mettre à jour la performance dans la table personnel
        await db.query(`
            UPDATE personnel 
            SET performance = ?
            WHERE id = ?
        `, [performancePercentage, personnelId]);

        return {
            personnel_id: personnelId,
            month,
            year,
            total_hours: totalHours,
            performance_percentage: performancePercentage,
            target_hours: MONTHLY_TARGET_HOURS,
            daily_target: DAILY_TARGET_HOURS,
            days_worked: attendance[0]?.days_worked || 0
        };

    } catch (error) {
        console.error('Error calculating performance:', error);
        throw error;
    }
}

// Calculer la performance pour tous les personnels pour le mois courant
async function calculateAllPerformance(month, year) {
    try {
        // Récupérer tous les personnels actifs
        const [personnels] = await db.query(`
            SELECT id FROM personnel WHERE active = 1
        `);

        const results = [];
        for (const personnel of personnels) {
            try {
                const result = await calculatePerformance(personnel.id, month, year);
                results.push(result);
            } catch (error) {
                console.error(`Error for personnel ${personnel.id}:`, error);
            }
        }

        return results;

    } catch (error) {
        console.error('Error calculating all performance:', error);
        throw error;
    }
}

// Route: Calculer la performance pour un personnel spécifique
router.post('/calculate/:personnelId', async (req, res) => {
    try {
        const { personnelId } = req.params;
        const { month, year } = req.body;
        
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const result = await calculatePerformance(
            parseInt(personnelId), 
            targetMonth, 
            targetYear
        );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul de performance'
        });
    }
});

// Route: Calculer la performance pour tous (batch)
router.post('/calculate-all', async (req, res) => {
    try {
        const { month, year } = req.body;
        
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const results = await calculateAllPerformance(targetMonth, targetYear);

        res.json({
            success: true,
            data: results,
            message: `Performance calculée pour ${results.length} personnels`
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul de performance'
        });
    }
});

// Route: Obtenir les statistiques de performance mensuelles
router.get('/monthly-stats/:personnelId', async (req, res) => {
    try {
        const { personnelId } = req.params;
        const { month, year } = req.query;
        
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        // Récupérer les performances du personnel
        const [performance] = await db.query(`
            SELECT * FROM performance 
            WHERE personnel_id = ? 
            AND month = ? 
            AND year = ?
        `, [personnelId, targetMonth, targetYear]);

        // Récupérer les détails d'attendance
        const [attendance] = await db.query(`
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_days,
                SUM(hours_worked) as total_hours,
                SUM(overtime_hours) as total_overtime
            FROM attendance 
            WHERE personnel_id = ? 
            AND MONTH(date) = ? 
            AND YEAR(date) = ?
        `, [personnelId, targetMonth, targetYear]);

        // Récupérer les informations du personnel
        const [personnelInfo] = await db.query(`
            SELECT name, matricule, position, department 
            FROM personnel 
            WHERE id = ?
        `, [personnelId]);

        const result = {
            personnel: personnelInfo[0],
            performance: performance[0] || {
                total_hours_worked: 0,
                performance_percentage: 0
            },
            attendance: attendance[0] || {
                total_days: 0,
                present_days: 0,
                absent_days: 0,
                partial_days: 0,
                total_hours: 0,
                total_overtime: 0
            },
            targets: {
                monthly_target_hours: MONTHLY_TARGET_HOURS,
                daily_target_hours: DAILY_TARGET_HOURS,
                working_days_per_month: WORKING_DAYS_PER_MONTH
            },
            calculations: {
                daily_performance: DAILY_TARGET_HOURS > 0 ? 
                    ((attendance[0]?.total_hours || 0) / DAILY_TARGET_HOURS) * 4.6 : 0
            }
        };

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// Route: Obtenir le top des performances
router.get('/top-performers', async (req, res) => {
    try {
        const { month, year, limit = 10 } = req.query;
        
        const currentDate = new Date();
        const targetMonth = month || currentDate.getMonth() + 1;
        const targetYear = year || currentDate.getFullYear();

        const [performers] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.matricule,
                p.position,
                p.department,
                perf.performance_percentage,
                perf.total_hours_worked,
                RANK() OVER (ORDER BY perf.performance_percentage DESC) as rank
            FROM performance perf
            JOIN personnel p ON perf.personnel_id = p.id
            WHERE perf.month = ? 
            AND perf.year = ?
            AND p.active = 1
            ORDER BY perf.performance_percentage DESC
            LIMIT ?
        `, [targetMonth, targetYear, parseInt(limit)]);

        res.json({
            success: true,
            data: performers
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des tops performances'
        });
    }
});

// Route: Calcul automatique quotidien (à appeler via cron job)
router.post('/daily-calculation', async (req, res) => {
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Calculer pour tous les personnels
        const results = await calculateAllPerformance(month, year);

        res.json({
            success: true,
            data: results,
            message: `Calcul quotidien effectué pour ${results.length} personnels`
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du calcul quotidien'
        });
    }
});

// Route: Mettre à jour la configuration
router.put('/config', async (req, res) => {
    try {
        const { monthly_target_hours, daily_target_hours, working_days_per_month } = req.body;

        const [config] = await db.query('SELECT id FROM performance_config LIMIT 1');
        
        if (config.length > 0) {
            await db.query(`
                UPDATE performance_config 
                SET monthly_target_hours = ?, 
                    daily_target_hours = ?, 
                    working_days_per_month = ?,
                    updated_at = NOW()
                WHERE id = ?
            `, [monthly_target_hours, daily_target_hours, working_days_per_month, config[0].id]);
        } else {
            await db.query(`
                INSERT INTO performance_config 
                (monthly_target_hours, daily_target_hours, working_days_per_month)
                VALUES (?, ?, ?)
            `, [monthly_target_hours, daily_target_hours, working_days_per_month]);
        }

        res.json({
            success: true,
            message: 'Configuration mise à jour avec succès'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour de la configuration'
        });
    }
});

// Route: Obtenir la configuration actuelle
router.get('/config', async (req, res) => {
    try {
        const [config] = await db.query('SELECT * FROM performance_config LIMIT 1');
        
        if (config.length === 0) {
            // Insérer la configuration par défaut
            await db.query(`
                INSERT INTO performance_config 
                (monthly_target_hours, daily_target_hours, working_days_per_month)
                VALUES (176, 8, 22)
            `);
            
            const [newConfig] = await db.query('SELECT * FROM performance_config LIMIT 1');
            res.json({
                success: true,
                data: newConfig[0]
            });
        } else {
            res.json({
                success: true,
                data: config[0]
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la configuration'
        });
    }
});

module.exports = router;