# 🔐 Aviso de Seguridad - Credenciales Expuestas

## ⚠️ ACCIÓN URGENTE REQUERIDA

Las credenciales de Firebase que estaban hardcodeadas en el código fueron movidas a variables de entorno, pero **las credenciales anteriores ya fueron expuestas en el repositorio Git**.

### Pasos Inmediatos de Seguridad

#### 1. Rotar Credenciales de Firebase

Debes regenerar tus credenciales de Firebase inmediatamente:

1. Ve a [Firebase Console](https://console.firebase.google.com/project/mascotasperdidas-b0faa/settings/general)
2. En "Tus apps" → Web app
3. **IMPORTANTE**: Aunque las API keys de Firebase son públicas por diseño, si hay preocupación de abuso:
   - Configura restricciones de dominio en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Limita la API key solo a tu dominio de producción

#### 2. Verificar Historial de Git

```bash
# Verifica que .env.local esté en .gitignore
cat .gitignore | grep .env

# Elimina .env.local del historial de Git si fue commiteado
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Fuerza el push (CUIDADO: esto reescribe el historial)
git push origin --force --all
```

#### 3. OpenAI API Key

La key de OpenAI que estaba en `.env.local` **NO se usa en ninguna parte del código**. Aún así:

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Revoca la key expuesta
3. Si no planeas usar OpenAI, simplemente elimínala

### Configuración Actual (Segura)

Las credenciales ahora están en `.env.local` (ignorado por Git) y se acceden vía variables de entorno:

```typescript
// app/lib/firebase.ts
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    // ... etc
};
```

### Para Nuevos Desarrolladores

1. Copia `.env.example` a `.env.local`
2. Obtén las credenciales de Firebase Console
3. Rellena los valores en `.env.local`
4. **NUNCA** hagas commit de `.env.local`

### Monitoreo

Configura alertas de uso en Firebase Console para detectar abuso:

1. Firebase Console → Usage and billing
2. Configura alertas de presupuesto
3. Monitorea métricas de autenticación y storage
4. Revisa logs regularmente

## Estado Actual

✅ Credenciales movidas a variables de entorno
✅ `.env.local` en `.gitignore`
✅ `.env.example` creado como template
✅ Código actualizado para usar `process.env.*`

⚠️ **PENDIENTE**: Rotar credenciales expuestas (tu responsabilidad)
