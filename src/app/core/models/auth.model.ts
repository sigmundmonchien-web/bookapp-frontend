// Données envoyées au backend pour se connecter
export interface LoginRequest {
  email: string;
  password: string;
}

// Réponse du backend après un login réussi (format LexikJWTBundle par défaut)
export interface LoginResponse {
  token: string;
}

// Données envoyées au backend pour créer un compte.
// Le champ acceptedPrivacyPolicy est obligatoire côté serveur
// depuis l'ajout de la vérification RGPD dans RegisterController :
// sans consentement explicite, l'API renvoie un 400.
export interface RegisterRequest {
  email: string;
  pseudo: string;
  password: string;
  acceptedPrivacyPolicy: boolean;
}