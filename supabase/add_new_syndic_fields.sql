ALTER TABLE syndic RENAME COLUMN telephone TO telephone_gestionnaire;
ALTER TABLE syndic RENAME COLUMN email TO email_gestionnaire;
ALTER TABLE syndic ADD COLUMN telephone_assistante text;
ALTER TABLE syndic ADD COLUMN email_assistante text;

ALTER TABLE syndic 
  ADD CONSTRAINT valid_email_gestionnaire CHECK (email_gestionnaire ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email_gestionnaire = '' OR email_gestionnaire IS NULL),
  ADD CONSTRAINT valid_email_assistante CHECK (email_assistante ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email_assistante = '' OR email_assistante IS NULL),
  ADD CONSTRAINT valid_telephone_gestionnaire CHECK (telephone_gestionnaire ~ '^[0-9+ \-\(\)]*$' OR telephone_gestionnaire IS NULL),
  ADD CONSTRAINT valid_telephone_assistante CHECK (telephone_assistante ~ '^[0-9+ \-\(\)]*$' OR telephone_assistante IS NULL);
