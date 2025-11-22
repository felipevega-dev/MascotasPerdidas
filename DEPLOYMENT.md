# 🚀 Deployment Guide - MascotasPerdidas

## Resumen Técnico

### Stack Tecnológico
- **Frontend**: Next.js 16.0.3 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Backend**: Firebase (Firestore, Storage, Auth)
- **Emails**: Resend API
- **Maps**: React-Leaflet 5.0.0 + OpenStreetMap
- **Real-time**: Firestore real-time subscriptions

---

## Pre-requisitos

### 1. Cuentas y Servicios
- [ ] Cuenta de Firebase (console.firebase.google.com)
- [ ] Cuenta de Resend (resend.com)
- [ ] Cuenta de Vercel o plataforma de hosting (opcional)

### 2. Configuración de Firebase

#### Firestore Database
1. Ir a Firebase Console → Firestore Database
2. Crear base de datos en modo producción o test
3. Configurar reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla para colección de mascotas
    match /pets/{petId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Regla para conversaciones
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Regla para mensajes
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
  }
}
```

#### Firebase Storage
1. Ir a Firebase Console → Storage
2. Configurar reglas de seguridad:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pets/{petId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /sightings/{sightingId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /messages/{messageId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Firebase Authentication
1. Ir a Firebase Console → Authentication
2. Habilitar métodos de autenticación:
   - Email/Password ✅
3. (Opcional) Configurar dominio autorizado para producción

### 3. Configuración de Resend

#### Obtener API Key
1. Ir a https://resend.com
2. Registrarse (plan gratuito: 100 emails/día)
3. Ir a "API Keys"
4. Crear nueva API Key
5. Copiar la key (formato: `re_xxxxxxxxxxxx`)

#### Verificar Dominio (Producción)
Para emails desde tu propio dominio:
1. Ir a "Domains" en Resend
2. Agregar tu dominio
3. Configurar registros DNS (SPF, DKIM)
4. Esperar verificación

---

## Variables de Entorno

### Desarrollo Local
Crear `.env.local`:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Producción (Vercel)
Configurar las mismas variables en:
- Vercel Dashboard → Settings → Environment Variables
- Marcar como "Production"

---

## Deployment en Vercel

### Opción 1: Via GitHub (Recomendado)

1. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/mascotas-perdidas.git
git push -u origin main
```

2. **Conectar con Vercel**
- Ir a https://vercel.com
- "Import Project" → Seleccionar el repo de GitHub
- Framework: Next.js (auto-detectado)
- Environment Variables: Copiar todas las variables
- Deploy

3. **Configuración Adicional**
- Vercel auto-detecta Next.js 16
- Build command: `npm run build` (por defecto)
- Output directory: `.next` (por defecto)

### Opción 2: Via CLI de Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Seguir los prompts para configurar.

### Post-Deployment

1. **Verificar dominio en Firebase**
   - Firebase Console → Authentication → Settings
   - Agregar dominio de Vercel a "Authorized domains"
   - Ejemplo: `mascotas-perdidas.vercel.app`

2. **Actualizar CORS en Resend**
   - Si usas API desde frontend
   - Resend Dashboard → Settings → CORS
   - Agregar tu dominio de producción

3. **Probar funcionalidades críticas**
   - Autenticación ✅
   - Subida de imágenes ✅
   - Envío de emails ✅
   - Chat en tiempo real ✅

---

## Deployment Alternativo (Netlify)

```bash
npm run build
```

Configurar en Netlify:
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variables: Las mismas que Vercel

---

## Optimizaciones Pre-Deployment

### 1. Build Local
```bash
npm run build
```

Verificar que no hay errores de TypeScript o build.

### 2. Lighthouse Audit
```bash
npm run build
npm run start
```

Abrir Chrome DevTools → Lighthouse → Run audit

Objetivos:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### 3. Optimización de Imágenes
Ya implementado con Next.js Image component.

Verificar:
- Todas las imágenes usan `<Image>` de Next.js
- Lazy loading activo
- Formatos WebP cuando sea posible

### 4. Code Splitting
Next.js App Router ya hace code splitting automático.

### 5. Compression
Vercel habilita gzip/brotli automáticamente.

---

## Monitoreo Post-Deployment

### 1. Vercel Analytics (Opcional)
```bash
npm install @vercel/analytics
```

En `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Firebase Analytics
Ya está configurado con `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.

### 3. Error Tracking (Opcional)
Considerar:
- Sentry
- LogRocket
- Rollbar

### 4. Uptime Monitoring
Servicios recomendados:
- UptimeRobot (gratuito)
- Pingdom
- StatusCake

---

## Troubleshooting Común

### Error: Firebase not initialized
**Causa**: Variables de entorno no configuradas
**Solución**: Verificar que todas las `NEXT_PUBLIC_FIREBASE_*` están en `.env.local` o Vercel

### Error: 403 Forbidden en Storage
**Causa**: Reglas de Storage muy restrictivas
**Solución**: Revisar `storage.rules` en Firebase Console

### Error: Email not sending
**Causa**: RESEND_API_KEY inválida o no configurada
**Solución**: 
1. Verificar API key en Resend dashboard
2. Confirmar que la variable está en producción
3. Revisar logs de API: `/api/emails/*`

### Error: Chat no sincroniza
**Causa**: Reglas de Firestore bloqueando lecturas
**Solución**: Verificar reglas de `conversations` y `messages`

### Error: Map no carga
**Causa**: Leaflet CSS no cargado
**Solución**: Ya está importado en `globals.css`, verificar que se incluye

### Error: QR code no genera
**Causa**: Librería `qrcode` no instalada
**Solución**: 
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

## Checklist Pre-Lanzamiento

### Funcionalidad
- [ ] Todas las páginas cargan sin errores
- [ ] Autenticación funciona (registro + login)
- [ ] Subida de imágenes funciona
- [ ] Emails se envían correctamente
- [ ] Chat funciona en tiempo real
- [ ] Mapa interactivo funciona
- [ ] Filtros aplican correctamente
- [ ] QR codes generan y escanean bien

### Performance
- [ ] Build sin errores
- [ ] Lighthouse score > 80
- [ ] Tiempo de carga < 3 segundos
- [ ] Imágenes optimizadas

### Seguridad
- [ ] Variables de entorno no expuestas en código
- [ ] Reglas de Firestore configuradas
- [ ] Reglas de Storage configuradas
- [ ] HTTPS habilitado (Vercel por defecto)

### SEO
- [ ] Meta tags configurados
- [ ] Open Graph tags para redes sociales
- [ ] Sitemap generado (opcional)
- [ ] robots.txt configurado (opcional)

### Responsive
- [ ] Funciona en móvil (375px)
- [ ] Funciona en tablet (768px)
- [ ] Funciona en desktop (1024px+)

---

## Costos Estimados

### Plan Gratuito (Inicio)
- **Vercel**: Gratis (100GB bandwidth, deploy ilimitados)
- **Firebase**: Gratis (Spark plan: 1GB storage, 10GB bandwidth/mes)
- **Resend**: Gratis (100 emails/día, 1 dominio)

**Total**: $0/mes para comenzar

### Plan Escalado (>10k usuarios/mes)
- **Vercel Pro**: $20/mes (1TB bandwidth)
- **Firebase Blaze**: ~$25-50/mes (pay-as-you-go)
- **Resend**: $20/mes (50k emails/mes)

**Total**: ~$65-90/mes

---

## Roadmap Post-Lanzamiento

### Mejoras Futuras (Opcional)
1. **PWA**: Service workers para offline
2. **Push Notifications**: Alertas en tiempo real
3. **Internacionalización**: i18n para múltiples idiomas
4. **Admin Panel**: Dashboard para moderación
5. **Analytics Dashboard**: Estadísticas de uso
6. **Tests Automatizados**: Jest + Cypress
7. **Mobile App**: React Native wrapper
8. **AI Features**: Reconocimiento de razas con ML

---

## Soporte y Documentación

### Enlaces Útiles
- Next.js Docs: https://nextjs.org/docs
- Firebase Docs: https://firebase.google.com/docs
- Resend Docs: https://resend.com/docs
- Vercel Docs: https://vercel.com/docs
- React-Leaflet: https://react-leaflet.js.org

### Logs de Producción
```bash
# Vercel logs
vercel logs [deployment-url]

# Firebase logs
# Ir a Firebase Console → Functions (si usas)
```

---

**Última actualización**: Guía completa de deployment lista para producción.

✅ **STATUS**: Proyecto listo para deploy
