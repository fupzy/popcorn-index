# Plan — Sécurité / Authentification

Une liste d'étapes par point de la section `## Security / Authentication` de [REVIEW.md](REVIEW.md), réduite aux
étapes structurantes : celles qu'on ne peut pas déduire du reste. Les points **cochés** retracent ce qui a été
réalisé dans le code ; les points **non cochés** proposent les étapes à suivre.

---

## [x] Protect endpoints with authorization

1. Ajouter `AddAuthentication`, `AddJwtBearer` et `AddAuthorization` dans le `ServicesRegistrator` de `Authentication.Domain`.
2. Ajouter `UseAuthentication` et `UseAuthorization` dans `AppService.Configure`, avant `MapControllers`.
3. Créer `ClaimsPrincipalExtensions.GetUserId`, qui lit le claim `sub` du token validé.
4. Poser `[Authorize]` sur `UsersController` et sur les deux écritures de `ReviewsController`.
5. Créer `CreateReviewRequest`, corps de création sans `UserId`, et faire porter la validation sur ce type.
6. Construire le `CreateReviewCommand` dans le contrôleur à partir de l'id du token.
7. Restreindre `IReviewRepository.Update` au propriétaire, et renvoyer `404` quand la review n'est pas la sienne.
8. Créer `MockAuthenticationHandler`, schéma de test qui authentifie depuis un en-tête, et le step `Given` correspondant.
9. Authentifier les scénarios existants, et ajouter ceux d'échec : appels anonymes, review d'autrui, `userId` falsifié dans le corps.
10. Créer `authenticationInterceptor` côté Angular, qui pose `Authorization: Bearer` sur les seules URL de l'API.
11. Durcir `applyToken` pour rejeter tout token qui n'est pas un JWT décodable avec `sub` et `exp` futur.
12. Retirer `userId` de `CreateReviewCommand`, de `ReviewFormDialogData` et de `openForm`.
13. Remplacer les tests front qui décrivaient l'ancien comportement laxiste.
14. Déclarer le schéma de sécurité bearer via `ConfigureSwaggerGen`.
15. Créer un `IDocumentFilter` qui n'applique l'exigence qu'aux opérations portant `[Authorize]`.

---

## [x] Do not expose password hashes and user ids

1. Réduire `User` à son seul champ `Username`.
2. Créer `UserWithCredentials`, portant `Id`, `Username` et `PasswordHash`, pour le flux d'authentification.
3. Créer `AuthenticatedUser`, portant `Id` et `Username`, retourné par `ValidateUser` pour que le hash ne quitte pas `AuthService`.
4. Remplacer `GetByUsername` par `GetUserCredentials`, seul point de sortie du hash.
5. Projeter `new User(u.Username)` dans `GetAll` et `GetById`, pour que le SQL ne lise plus la colonne du hash.
6. Changer la signature de `IJwtService.GenerateToken` pour qu'elle prenne un `AuthenticatedUser`.
7. Retirer `id` et `passwordHash` de la réponse attendue du scénario de récupération des utilisateurs.

---

## [x] Remove `Jwt:Key` from the appsettings

1. Supprimer l'entrée `Jwt:Key` des deux `appsettings.json`.
2. Créer `ConfigurationExtensions.GetJwtSigningKey`, qui lit `JWT_KEY` et refuse une clé absente ou plus courte que 32 octets.
3. Faire appeler cette extension par `JwtService` au lieu de lire la configuration.

---

## [ ] Use cookies instead of `localStorage`

1. Déposer le token dans un cookie `HttpOnly`, `Secure` et `SameSite=Strict` à la connexion, et le retirer du corps de la réponse.
2. Configurer `AddJwtBearer` pour lire le token depuis ce cookie.
3. Ajouter un endpoint de déconnexion qui efface le cookie côté serveur.
4. Restreindre la politique CORS aux origines connues, le joker actuel étant incompatible avec `AllowCredentials`.
5. Ajouter une protection CSRF, le cookie étant désormais envoyé automatiquement par le navigateur.
6. Supprimer l'intercepteur Angular et la persistance dans `localStorage`.
7. Remplacer l'état d'authentification déduit du token par un appel serveur du type `GET /authentication/me`.
8. Adapter le harness de test et les specs, le token n'étant plus lisible côté client.

---

## [ ] Do not log sensitive data

1. Restreindre `LoggingFields` dans `AddHttpLogging` pour ne plus journaliser les corps de requête.
2. Vérifier qu'aucun mot de passe n'apparaît plus dans les logs de `register` et de `login`.
3. Passer en revue les `console.info` du service d'authentification Angular, qui tracent l'expiration du token.
