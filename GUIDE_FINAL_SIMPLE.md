# Guide Final - Configuration Supabase

## ✅ État actuel

Votre base de données Supabase est **déjà configurée** avec :

- ✅ Tables créées : `account_managers`, `affiliates`, `clients`, `plans`, `campaigns`, `reports`, `documents`, `contracts`, `commissions`, `media_kits`, `email_templates`
- ✅ Vues SQL créées : `affiliate_stats`, `am_stats`, `client_stats`, `campaign_stats`
- ✅ Données seed insérées : 2 AMs, 4 Affiliés, 2 Clients, 12 Plans
- ✅ Colonnes calculées : `gains_affilie`, `notre_marge`, `depense_client`

## 📊 Données existantes dans Supabase

### Account Managers (2)
- Sophie Martin (sophie.martin@company.com)
- Thomas Dubois (thomas.dubois@company.com)

### Affiliés (4)
- Digital Partners
- Marketing Pro
- Web Influence
- Social Media Masters

### Clients (2)
- Desigual
- Miliboo

### Plans (12 au total)
- 6 pour Desigual
- 6 pour Miliboo

## ⚠️ Problème actuel à corriger

Le frontend utilise incorrectement le hook `use()` de React 19 dans **30+ fichiers**. 

### Solution

Les composants clients doivent utiliser `useEffect` + `useState` au lieu de `use()` pour charger les données asynchrones.

**Exemple incorrect :**
\`\`\`tsx
"use client"
export default function Page() {
  const data = use(getData()) // ❌ ERREUR
  // ...
}
\`\`\`

**Exemple correct :**
\`\`\`tsx
"use client"
export default function Page() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getData().then(result => {
      setData(result)
      setLoading(false)
    })
  }, [])
  
  if (loading) return <div>Loading...</div>
  // ...
}
\`\`\`

## 🎯 Prochaines étapes

1. **Vérifier que l'app charge** - Ouvrez l'application et vérifiez la console (F12)
2. **Chercher les erreurs** - Identifiez les pages qui ont encore des erreurs `use()`
3. **Confirmer les données** - Vérifiez que vous voyez Sophie Martin, Thomas Dubois, Desigual, Miliboo dans l'interface

## 📝 Notes importantes

- Tous les logs console commencent par `[v0]` pour faciliter le debug
- Les queries Supabase sont dans `lib/supabase/queries/`
- Les Server Actions sont dans `lib/supabase/actions/`
- Les vues SQL calculent automatiquement les statistiques (total vs validé)

## 🔧 Si vous voyez des erreurs

**Erreur "use() called with..."**
→ Le composant doit être corrigé pour utiliser `useEffect` au lieu de `use()`

**Erreur "invalid input syntax for type uuid"**
→ Un ID est passé en texte au lieu d'UUID, vérifiez les paramètres de route

**Erreur "does not provide an export"**
→ Une fonction est importée depuis le mauvais fichier, vérifiez les imports

---

**Votre base de données est prête !** Les queries sont alignées avec votre schéma Supabase. Il ne reste plus qu'à corriger les composants qui utilisent mal le hook `use()`.
