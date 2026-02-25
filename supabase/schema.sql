CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('resident', 'conseil', 'admin', 'super_admin');
CREATE TYPE announce_category AS ENUM ('travaux', 'information', 'assemblee', 'divers');
CREATE TYPE alerte_category AS ENUM ('incendie', 'degat_eau', 'ascenseur', 'intrusion', 'coupure', 'autre');
CREATE TYPE alerte_statut AS ENUM ('en_cours', 'resolu');
CREATE TYPE message_type AS ENUM ('texte', 'image', 'fichier');
CREATE TYPE contact_type AS ENUM ('interne', 'externe');

CREATE TABLE residences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  adresse TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  logo_url TEXT,
  couleur_principale TEXT DEFAULT '#1F3864'
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  residence_id UUID REFERENCES residences(id),
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role user_role DEFAULT 'resident',
  appartement TEXT,
  batiment TEXT,
  telephone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE annonces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  categorie announce_category NOT NULL,
  auteur_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  residence_id UUID REFERENCES residences(id) ON DELETE CASCADE NOT NULL,
  is_important BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  pieces_jointes TEXT[]
);

CREATE TABLE alertes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  categorie alerte_category NOT NULL,
  statut alerte_statut DEFAULT 'en_cours',
  auteur_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  residence_id UUID REFERENCES residences(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE evenements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  lieu TEXT NOT NULL,
  auteur_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  residence_id UUID REFERENCES residences(id) ON DELETE CASCADE NOT NULL,
  participants UUID[] DEFAULT '{}'::UUID[]
);

CREATE TABLE canaux (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  residence_id UUID REFERENCES residences(id) ON DELETE CASCADE NOT NULL,
  is_private BOOLEAN DEFAULT FALSE
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contenu TEXT NOT NULL,
  auteur_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  canal_id UUID REFERENCES canaux(id) ON DELETE CASCADE,
  destinataire_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type message_type DEFAULT 'texte',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  CHECK (canal_id IS NOT NULL OR destinataire_id IS NOT NULL)
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  role TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  disponibilite TEXT,
  residence_id UUID REFERENCES residences(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  type contact_type DEFAULT 'externe'
);

-- RLS
ALTER TABLE residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE annonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE canaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom)
  VALUES (new.id, new.email, '', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_residence_id ON profiles(residence_id);
CREATE INDEX IF NOT EXISTS idx_annonces_residence_id ON annonces(residence_id);
CREATE INDEX IF NOT EXISTS idx_alertes_statut_residence_id ON alertes(statut, residence_id);
CREATE INDEX IF NOT EXISTS idx_messages_canal_id ON messages(canal_id);
