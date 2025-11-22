# Plan de Sprints - PawAlert MVP

## 🎯 Objetivo General
Convertir PawAlert en una aplicación viable para que usuarios reales puedan reportar y encontrar mascotas perdidas de manera efectiva y segura.

---

## 🚨 SPRINT 0: CRÍTICO - SEGURIDAD Y BLOQUEADORES (URGENTE)
**Duración estimada**: Inmediato
**Objetivo**: Eliminar vulnerabilidades críticas que impiden el lanzamiento

### Tareas Críticas

#### 1. Seguridad de Credenciales (CRÍTICO)
- [ ] Mover Firebase config a variables de entorno
- [ ] Eliminar `.env.local` del repositorio Git
- [ ] Agregar `.env.local` a `.gitignore`
- [ ] Eliminar OpenAI key no utilizada
- [ ] Rotar todas las credenciales expuestas en Firebase Console
- [ ] Crear `.env.example` con template

**Archivos afectados**:
- `app/lib/firebase.ts`
- `.env.local` (eliminar del repo)
- `.gitignore`

---

#### 2. Campos Requeridos del Formulario (CRÍTICO)
- [ ] Agregar campo `size` (Pequeño/Mediano/Grande)
- [ ] Agregar campo `distinguishingFeatures` (textarea)
- [ ] Agregar campo `contactEmail`
- [ ] Agregar validación de email con pattern
- [ ] Hacer todos los campos requeridos según el tipo Pet

**Archivos afectados**:
- `app/report/page.tsx` (agregar campos en Step 2)

---

#### 3. Reglas de Firestore para Sightings (CRÍTICO)
- [ ] Permitir que usuarios autenticados agreguen sightings a cualquier pet
- [ ] Crear función helper en rules para validar sighting data
- [ ] Mantener protección de owner para update de datos base del pet
- [ ] Testear que no-owners pueden reportar sightings

**Archivos afectados**:
- `firestore.rules`

**Nueva regla sugerida**:
```javascript
// Allow authenticated users to add sightings (array union)
allow update: if isAuthenticated()
              && (resource.data.userId == request.auth.uid  // Owner can update all
              || onlyAddingSighting());  // Others can only add sightings

function onlyAddingSighting() {
  let affectedKeys = request.resource.data.diff(resource.data).affectedKeys();
  return affectedKeys.hasOnly(['sightings'])
         && request.resource.data.sightings.size() > resource.data.sightings.size();
}
```

---

#### 4. Límite de Tamaño de Archivo (CRÍTICO)
- [ ] Cambiar UI de "hasta 10MB" a "hasta 5MB"
- [ ] Agregar validación client-side antes de upload
- [ ] Mostrar error claro si archivo excede 5MB
- [ ] Considerar compresión automática de imágenes grandes

**Archivos afectados**:
- `app/components/ImageUpload.tsx` (línea 142, función handleFile)

---

### Criterios de Aceptación Sprint 0
✅ No hay credenciales expuestas en el código
✅ Formulario colecta TODOS los campos requeridos
✅ Cualquier usuario puede reportar sightings
✅ Upload de imágenes funciona sin errores de tamaño

---

## 🔧 SPRINT 1: VALIDACIÓN Y UX BÁSICA
**Duración estimada**: 1 semana
**Objetivo**: Asegurar que usuarios puedan completar el flujo sin errores

### Tareas de Validación

#### 1. Validación de Formulario
- [ ] Validar phone con regex (formato internacional o local)
- [ ] Validar email con HTML5 pattern
- [ ] Cambiar reward a `type="number"` con `min="0"` `step="0.01"`
- [ ] Validación de tamaño mínimo de descripción (ej: 20 caracteres)
- [ ] Deshabilitar botón "Siguiente" si campos requeridos vacíos en cada step

**Archivos afectados**:
- `app/report/page.tsx`

---

#### 2. Manejo de Errores de Geolocalización
- [ ] Mostrar mensaje claro cuando geolocation falla
- [ ] Permitir búsqueda manual de dirección si GPS falla
- [ ] Agregar botón "Usar mi ubicación actual" separado de carga automática
- [ ] Mostrar spinner mientras obtiene ubicación
- [ ] Timeout de 10s para geolocation request

**Archivos afectados**:
- `app/components/LocationPicker.tsx`

---

#### 3. Sanitización de Input (XSS Protection)
- [ ] Instalar `dompurify` o usar Next.js built-in sanitization
- [ ] Sanitizar todos los campos de texto antes de mostrar
- [ ] Sanitizar sighting notes
- [ ] Escapar HTML en descripciones

**Archivos afectados**:
- `app/pet/[id]/page.tsx`
- `app/components/PetCard.tsx`
- `app/components/SightingModal.tsx`

---

#### 4. Prevención de Duplicados
- [ ] Deshabilitar botón de submit inmediatamente al hacer click
- [ ] Agregar `disabled={isSubmitting}` a botón
- [ ] Mostrar spinner en botón durante submit
- [ ] Prevenir submit con Enter key mientras está procesando

**Archivos afectados**:
- `app/report/page.tsx` (handleSubmit)

---

#### 5. Estados de Error Mejorados
- [ ] Agregar error boundary global
- [ ] Mostrar mensaje de error específico cuando fetch de pet falla
- [ ] Agregar botón "Reintentar" en errores de red
- [ ] Toast notifications para errores (considerar react-hot-toast)

**Archivos afectados**:
- `app/pet/[id]/page.tsx`
- `app/layout.tsx` (error boundary)

---

### Criterios de Aceptación Sprint 1
✅ Todos los inputs tienen validación apropiada
✅ Errores de geolocalización no bloquean el flujo
✅ No hay vulnerabilidades XSS
✅ Imposible crear submissions duplicadas
✅ Errores se muestran claramente al usuario

---

## 🎨 SPRINT 2: PULIDO DE UX Y FUNCIONALIDAD
**Duración estimada**: 1 semana
**Objetivo**: Mejorar experiencia de usuario y completar features faltantes

### Tareas de UX

#### 1. Campo de Fecha de Pérdida
- [ ] Agregar input date en Step 1 del formulario
- [ ] Validar que fecha no sea futura
- [ ] Usar esa fecha en lugar de `new Date()` al submit
- [ ] Mostrar "Perdido hace X días" en cards

**Archivos afectados**:
- `app/report/page.tsx`
- `app/components/PetCard.tsx`

---

#### 2. Ubicación de Mapa por Defecto
- [ ] Cambiar default de Londres a España/LATAM (dependiendo del mercado)
- [ ] Detectar país por IP y centrar ahí (opcional)
- [ ] Si geolocation funciona, usar esa ubicación
- [ ] Configurar zoom inicial apropiado

**Archivos afectados**:
- `app/components/LocationPicker.tsx` (línea 27)
- `app/components/PetMap.tsx`

---

#### 3. Upload de Foto en Sightings
- [ ] Agregar componente ImageUpload a SightingModal
- [ ] Permitir foto opcional en sighting
- [ ] Mostrar preview de foto en timeline de sightings
- [ ] Comprimir imágenes antes de upload

**Archivos afectados**:
- `app/components/SightingModal.tsx`

---

#### 4. Mejoras en Image Upload
- [ ] Limpiar preview cuando upload falla
- [ ] Agregar progress bar durante upload
- [ ] Mostrar tamaño de archivo antes de upload
- [ ] Comprimir imágenes >2MB automáticamente
- [ ] Permitir cambiar foto después de upload

**Archivos afectados**:
- `app/components/ImageUpload.tsx`

---

#### 5. Protección contra Browser Back
- [ ] Guardar formData en localStorage mientras se completa
- [ ] Restaurar datos si usuario vuelve a /report
- [ ] Mostrar confirmación antes de salir con datos sin guardar
- [ ] Limpiar localStorage después de submit exitoso

**Archivos afectados**:
- `app/report/page.tsx`

---

#### 6. Consistencia de Idioma
- [ ] Traducir todos los textos a español
- [ ] Revisar PetCard, SightingModal, PetMap, etc.
- [ ] Usar formato de fecha en español (`es` locale)
- [ ] Verificar que date-fns locale funciona

**Archivos afectados**:
- `app/components/SightingModal.tsx`
- `app/components/PetMap.tsx`
- Todos los componentes con texto

---

### Criterios de Aceptación Sprint 2
✅ Usuarios pueden especificar cuándo perdieron su mascota
✅ Mapa se centra en ubicación relevante al usuario
✅ Sightings pueden incluir fotos
✅ Upload de imágenes tiene feedback claro
✅ Datos del formulario no se pierden con back button
✅ Toda la UI está en español

---

## ⚡ SPRINT 3: FUNCIONALIDADES AVANZADAS
**Duración estimada**: 1-2 semanas
**Objetivo**: Agregar features que mejoran adopción y engagement

### Tareas Avanzadas

#### 1. Sistema de Filtros en Mapa
- [ ] Filtrar por tipo (perro/gato/otro)
- [ ] Filtrar por estado (perdido/avistado/encontrado)
- [ ] Filtrar por fecha (últimas 24h, 7 días, 30 días)
- [ ] Filtrar por distancia (radio en km)
- [ ] Persistir filtros en URL query params

**Archivos afectados**:
- `app/map/page.tsx` (implementar onClick del botón Filtros)

---

#### 2. Búsqueda de Mascotas
- [ ] Barra de búsqueda en /map
- [ ] Buscar por nombre, raza, color
- [ ] Búsqueda por ubicación/ciudad
- [ ] Highlight resultados en mapa

**Archivos afectados**:
- `app/map/page.tsx`

---

#### 3. Notificaciones de Nuevos Sightings
- [ ] Email al owner cuando alguien reporta sighting
- [ ] Firebase Cloud Functions para envío de emails
- [ ] Template de email con link directo al sighting
- [ ] Opción para desactivar notificaciones

**Archivos nuevos**:
- `functions/src/index.ts` (Cloud Functions)
- Configuración de SendGrid o similar

---

#### 4. Panel de Usuario ("Mis Reportes")
- [ ] Página /my-pets con lista de pets del usuario
- [ ] Botón para editar pet
- [ ] Botón para marcar como encontrado
- [ ] Estadísticas (vistas, sightings)

**Archivos nuevos**:
- `app/my-pets/page.tsx`

---

#### 5. Compartir en Redes Sociales
- [ ] Agregar meta tags Open Graph
- [ ] Agregar Twitter Cards
- [ ] Botones de compartir en pet detail
- [ ] Generar imagen optimizada para cada pet

**Archivos afectados**:
- `app/pet/[id]/page.tsx` (metadata)
- `app/layout.tsx`

---

#### 6. Analytics y Monitoring
- [ ] Configurar Google Analytics o similar
- [ ] Track eventos: pet_created, sighting_added, poster_downloaded
- [ ] Sentry para error tracking
- [ ] Monitor Firebase usage/costs

**Archivos afectados**:
- `app/layout.tsx`

---

### Criterios de Aceptación Sprint 3
✅ Usuarios pueden filtrar mascotas en mapa
✅ Búsqueda funciona correctamente
✅ Owners reciben notificaciones de sightings
✅ Usuarios pueden gestionar sus reportes
✅ Links se comparten bien en redes sociales
✅ Tenemos visibilidad de uso y errores

---

## 📱 SPRINT 4: OPTIMIZACIÓN Y PULIDO
**Duración estimada**: 1 semana
**Objetivo**: Optimizar performance y preparar para escala

### Tareas de Optimización

#### 1. Performance
- [ ] Implementar React.lazy para rutas
- [ ] Optimizar imágenes con next/image
- [ ] Agregar loading skeletons
- [ ] Implementar pagination en lista de pets
- [ ] Cache de Firebase queries

---

#### 2. Accesibilidad
- [ ] Agregar ARIA labels a botones
- [ ] Navegación por teclado
- [ ] Contraste de colores WCAG AA
- [ ] Screen reader testing

---

#### 3. Mobile Experience
- [ ] Optimizar formulario para mobile
- [ ] Mejorar UX del mapa en pantallas pequeñas
- [ ] Botón sticky "Reportar" en mobile
- [ ] Testing en dispositivos reales

---

#### 4. SEO
- [ ] Sitemap.xml dinámico
- [ ] robots.txt
- [ ] Structured data (JSON-LD)
- [ ] Meta descriptions por página

---

#### 5. Testing
- [ ] Tests E2E con Playwright
- [ ] Test flujo completo de reporte
- [ ] Test de autenticación
- [ ] Test de sightings

---

### Criterios de Aceptación Sprint 4
✅ App carga rápido (<3s)
✅ Cumple WCAG 2.1 nivel AA
✅ Funciona bien en mobile
✅ SEO optimizado
✅ Tests cubren flujos críticos

---

## 🚀 PREPARACIÓN PARA LANZAMIENTO

### Pre-Launch Checklist
- [ ] Todas las credenciales en variables de entorno
- [ ] Firebase en plan Blaze (pay-as-you-go)
- [ ] Dominio configurado
- [ ] SSL certificate
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Página de contacto/soporte
- [ ] Plan de respaldo de base de datos
- [ ] Monitoring configurado
- [ ] Plan de respuesta a incidentes

### Post-Launch Monitoreo
- [ ] Monitor Firebase costs diariamente
- [ ] Review error logs en Sentry
- [ ] Analizar métricas de uso
- [ ] Recopilar feedback de usuarios
- [ ] Iterar basado en datos

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs del MVP
- **Engagement**: # de reportes creados por semana
- **Efectividad**: # de mascotas marcadas como encontradas
- **Colaboración**: # de sightings reportados por otros usuarios
- **Retención**: % de usuarios que reportan más de 1 mascota
- **Performance**: Tiempo promedio para completar reporte < 5 min

### Objetivos Mes 1
- 50 reportes de mascotas
- 10 sightings comunitarios
- 5 mascotas encontradas
- 0 errores críticos reportados
- 90% de reportes completos (todos los campos)

---

## 🔄 PROCESO DE DESARROLLO

### Workflow Recomendado
1. Crear branch por tarea (`feature/add-email-field`)
2. Desarrollar y testear localmente
3. Commit con mensajes descriptivos
4. Pull request con descripción y screenshots
5. Review de código
6. Merge a main
7. Deploy automático a staging
8. QA en staging
9. Deploy a producción

### Priorización
- **P0 (Bloqueador)**: Sprint 0 completo
- **P1 (Alta)**: Sprint 1
- **P2 (Media)**: Sprint 2
- **P3 (Baja)**: Sprints 3-4

---

## 📝 NOTAS ADICIONALES

### Consideraciones Técnicas
- Usar Firebase Emulator para desarrollo local
- Configurar diferentes proyectos Firebase (dev/staging/prod)
- Implementar feature flags para rollout gradual
- Considerar rate limiting para prevenir abuso

### Consideraciones de Negocio
- Plan de marketing para lanzamiento
- Partnerships con veterinarias locales
- Programa de embajadores comunitarios
- Estrategia de monetización (opcional: featured posts, premium features)

### Recursos Necesarios
- Desarrollador full-stack (tú)
- Diseñador UI/UX (para mejoras visuales)
- Community manager (para soporte y engagement)
- Presupuesto Firebase (~$50-100/mes inicial)
