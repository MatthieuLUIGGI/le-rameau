-- Activer l'extension pg_cron si elle n'est pas déjà active (doit être fait en tant que superuser/admin)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Supprimer la tâche si elle existe déjà pour éviter les erreurs
SELECT cron.unschedule('delete-expired-actualites');

-- Planifier une tâche qui s'exécute tous les jours à minuit (heure UTC)
-- Cette tâche supprimera automatiquement de la base de données toutes les actualités 
-- dont la date d'expiration est antérieure ou égale à la date du jour.
SELECT cron.schedule(
  'delete-expired-actualites',
  '0 0 * * *',
  $$ DELETE FROM public.actualites WHERE date_expiration <= CURRENT_DATE; $$
);
