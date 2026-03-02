ALTER TABLE syndic RENAME COLUMN telephone TO telephone_gestionnaire;
ALTER TABLE syndic RENAME COLUMN email TO email_gestionnaire;
ALTER TABLE syndic ADD COLUMN telephone_assistante text;
ALTER TABLE syndic ADD COLUMN email_assistante text;
