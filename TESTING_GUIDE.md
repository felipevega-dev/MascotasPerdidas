# 🧪 Guía de Testing - MascotasPerdidas

## Preparación del Entorno

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea el archivo `.env.local` con:

```bash
# Firebase (reemplaza con tus credenciales reales)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Resend Email (obtén tu key en https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## Checklist de Testing

### ✅ Test 1: Autenticación
- [ ] Registro de nuevo usuario
- [ ] Login con credenciales existentes
- [ ] Verificar que el nombre aparece en el navbar
- [ ] Logout y verificar que redirige correctamente

### ✅ Test 2: Reportar Mascota Perdida
**Ruta**: `/report`

- [ ] Completar Paso 1: Información básica (nombre, tipo, raza)
- [ ] Subir foto de la mascota
- [ ] Completar Paso 2: Descripción y características
- [ ] Completar Paso 3: Ubicación (usar el mapa para seleccionar)
- [ ] Completar Paso 4: Contacto (email y teléfono)
- [ ] Verificar que aparece mensaje de éxito
- [ ] Confirmar que la mascota aparece en `/my-pets`

### ✅ Test 3: Editar Mascota
**Ruta**: `/my-pets`

- [ ] Hacer clic en el botón "Editar" de una mascota
- [ ] Modal de edición se abre correctamente
- [ ] Modificar información en Paso 1 (nombre, tipo)
- [ ] Cambiar foto en Paso 2
- [ ] Actualizar ubicación en Paso 3
- [ ] Modificar contacto en Paso 4
- [ ] Guardar cambios
- [ ] Verificar que los cambios se reflejan instantáneamente
- [ ] Intentar editar una mascota de otro usuario (debe denegar acceso)

### ✅ Test 4: Ver Detalles de Mascota
**Ruta**: `/pet/[id]`

- [ ] Hacer clic en una tarjeta de mascota
- [ ] Verificar que todos los datos se muestran correctamente:
  - [ ] Imagen principal
  - [ ] Nombre, tipo, raza
  - [ ] Descripción
  - [ ] Ubicación en mapa
  - [ ] Información de contacto
  - [ ] Badge de estado (Perdida/Encontrada)

### ✅ Test 5: Reportar Avistamiento
**Ruta**: `/pet/[id]`

- [ ] Hacer clic en "Reportar Avistamiento"
- [ ] Completar formulario:
  - [ ] Seleccionar ubicación en mapa
  - [ ] Agregar descripción
  - [ ] Subir foto (opcional)
- [ ] Enviar reporte
- [ ] Verificar mensaje de éxito
- [ ] El dueño debería recibir un email (si RESEND_API_KEY está configurado)

### ✅ Test 6: Marcar como Encontrada
**Ruta**: `/my-pets`

- [ ] Hacer clic en "Marcar como Encontrada"
- [ ] Confirmar acción en el diálogo
- [ ] Verificar que el badge cambia a "Encontrada"
- [ ] Verificar que se recibe email de confirmación

### ✅ Test 7: Mapa Interactivo - Vista Híbrida
**Ruta**: `/map`

#### Cambiar Vistas
- [ ] Vista "Híbrida" (por defecto): Sidebar + Mapa
- [ ] Vista "Mapa": Solo mapa a pantalla completa
- [ ] Vista "Lista": Solo lista de tarjetas

#### Interacción Sidebar → Mapa
- [ ] Hacer clic en una mascota del sidebar
- [ ] Verificar que el mapa se centra en esa ubicación
- [ ] Verificar que el marcador se resalta

#### Interacción Mapa → Sidebar
- [ ] Hacer clic en un marcador del mapa
- [ ] Verificar que aparece tarjeta overlay sobre el mapa
- [ ] Verificar que el sidebar se desplaza a esa mascota
- [ ] Hacer clic fuera de la tarjeta para cerrarla

#### Sincronización
- [ ] Mover el mapa manualmente
- [ ] Verificar que el sidebar solo muestra mascotas visibles
- [ ] Hacer zoom in/out
- [ ] Verificar que los marcadores se agrupan/separan correctamente

### ✅ Test 8: Filtros de Búsqueda
**Ruta**: `/map`

#### Filtro por Tipo
- [ ] Seleccionar "Perro"
- [ ] Verificar que solo aparecen perros
- [ ] Seleccionar "Gato"
- [ ] Verificar que solo aparecen gatos
- [ ] Seleccionar "Otro"
- [ ] Verificar que solo aparecen otros tipos

#### Filtro por Estado
- [ ] Seleccionar "Perdida"
- [ ] Verificar que solo aparecen mascotas perdidas
- [ ] Seleccionar "Encontrada"
- [ ] Verificar que solo aparecen mascotas encontradas

#### Filtro por Radio de Distancia
- [ ] Activar geolocalización (dar permiso al navegador)
- [ ] Seleccionar radio "1km"
- [ ] Verificar que solo aparecen mascotas a menos de 1km
- [ ] Probar con 5km, 10km, 25km, 50km
- [ ] Verificar que las distancias son precisas

#### Ordenar por Distancia
- [ ] Activar checkbox "Ordenar por distancia"
- [ ] Verificar que las mascotas más cercanas aparecen primero
- [ ] Verificar que se muestra la distancia en cada tarjeta

#### Limpiar Filtros
- [ ] Aplicar varios filtros
- [ ] Hacer clic en "Limpiar filtros"
- [ ] Verificar que todos los filtros se resetean

### ✅ Test 9: Feed Global de Publicaciones
**Ruta**: `/map`

- [ ] Hacer clic en el botón de Feed (esquina superior derecha)
- [ ] Panel se desliza desde la derecha
- [ ] Verificar que muestra las publicaciones más recientes primero
- [ ] Hacer scroll hacia abajo
- [ ] Verificar carga infinita (más publicaciones aparecen)
- [ ] Hacer clic en una publicación
- [ ] Verificar que redirige a la página de detalles
- [ ] Cerrar panel con el botón X

### ✅ Test 10: Sistema de Alertas
**Ruta**: `/map`

#### Alertas en Tiempo Real
- [ ] Permanecer en la página del mapa
- [ ] Esperar 2 minutos (polling automático)
- [ ] Si hay nuevas mascotas, aparece banner en la parte superior

#### Auto-rotación
- [ ] Si hay múltiples alertas, esperar 5 segundos
- [ ] Verificar que el banner rota automáticamente
- [ ] Observar el indicador de "1 de X"

#### Interacción
- [ ] Hacer clic en "Ver detalles"
- [ ] Verificar que redirige a la mascota
- [ ] Descartar una alerta con el botón X
- [ ] Verificar que esa alerta no vuelve a aparecer
- [ ] Verificar que continúa rotando entre las demás

#### Testing Manual de Alertas
Para probar sin esperar:
1. Reportar una nueva mascota desde otra cuenta o navegador
2. Volver a `/map` en el primer navegador
3. Hacer clic en "Buscar Nuevas" (si se implementó)
4. O esperar 2 minutos para el polling automático

### ✅ Test 11: Chat Interno
**Ruta**: `/pet/[id]`

#### Iniciar Conversación
- [ ] Ir a una publicación de otra persona
- [ ] Hacer clic en "Chatear con el dueño"
- [ ] Ventana de chat aparece en esquina inferior derecha

#### Enviar Mensajes
- [ ] Escribir mensaje de texto
- [ ] Presionar Enter o botón de enviar
- [ ] Verificar que el mensaje aparece
- [ ] Verificar alineación (tus mensajes a la derecha, del otro usuario a la izquierda)

#### Enviar Imágenes
- [ ] Hacer clic en el botón de adjuntar imagen
- [ ] Seleccionar imagen desde tu dispositivo
- [ ] Verificar que aparece preview
- [ ] Hacer clic en la imagen para ver en tamaño completo

#### Tiempo Real
Para probar sincronización en tiempo real:
1. Abrir la conversación en dos navegadores diferentes
2. Usuario A envía mensaje en navegador 1
3. Verificar que aparece instantáneamente en navegador 2
4. Usuario B responde en navegador 2
5. Verificar que aparece instantáneamente en navegador 1

#### Marcadores de Lectura
- [ ] Enviar mensaje
- [ ] Esperar a que el otro usuario abra la conversación
- [ ] Verificar cambio de estado (futuro: agregar checkmarks)

#### Cerrar/Minimizar
- [ ] Hacer clic en el botón X para cerrar
- [ ] Volver a abrir desde la página del pet
- [ ] Verificar que los mensajes persisten

### ✅ Test 12: Código QR
**Ruta**: `/pet/[id]`

#### Generar QR
- [ ] Ir a una de tus mascotas
- [ ] Hacer clic en "Generar Código QR"
- [ ] Verificar que se carga la página QR

#### Contenido
- [ ] Verificar que aparece:
  - [ ] Imagen de la mascota
  - [ ] Nombre de la mascota
  - [ ] Tipo (perro/gato/otro)
  - [ ] Código QR grande y legible
  - [ ] Instrucciones de escaneo
  - [ ] Información de contacto

#### Imprimir
- [ ] Hacer clic en "Imprimir"
- [ ] Verificar vista previa de impresión
- [ ] Verificar que el diseño es apto para cortar (formato collar)
- [ ] Imprimir en papel (opcional)

#### Escanear
- [ ] Usar tu móvil para escanear el QR
- [ ] Verificar que te lleva a la página correcta de la mascota

### ✅ Test 13: Compartir en Redes Sociales
**Ruta**: `/pet/[id]`

#### Abrir Modal
- [ ] Hacer clic en "Compartir"
- [ ] Modal se abre con 6 opciones

#### Probar Cada Plataforma
- [ ] **WhatsApp**: Hacer clic, verificar que abre WhatsApp con mensaje pre-llenado
- [ ] **Facebook**: Hacer clic, verificar que abre diálogo de compartir
- [ ] **Twitter/X**: Hacer clic, verificar que abre con tweet pre-llenado
- [ ] **Telegram**: Hacer clic, verificar que abre Telegram
- [ ] **Email**: Hacer clic, verificar que abre cliente de email con asunto y cuerpo

#### Copiar Enlace
- [ ] Hacer clic en "Copiar enlace"
- [ ] Verificar que aparece toast de confirmación
- [ ] Pegar en otra ventana
- [ ] Verificar que el enlace funciona

#### Responsive
- [ ] Probar en móvil
- [ ] Verificar que cada red social abre la app nativa

### ✅ Test 14: Emails de Notificación
**Prerequisito**: Configurar `RESEND_API_KEY` en `.env.local`

#### Email de Mascota Perdida
- [ ] Reportar nueva mascota perdida
- [ ] Verificar recepción de email
- [ ] Abrir email
- [ ] Verificar formato HTML:
  - [ ] Logo/header
  - [ ] Imagen de la mascota
  - [ ] Información completa
  - [ ] Botón para ver detalles
  - [ ] Información de contacto

#### Email de Mascota Encontrada
- [ ] Marcar mascota como encontrada
- [ ] Verificar recepción de email
- [ ] Verificar contenido celebratorio

#### Email de Avistamiento
- [ ] Otra persona reporta avistamiento
- [ ] Dueño recibe email
- [ ] Verificar:
  - [ ] Ubicación del avistamiento
  - [ ] Descripción
  - [ ] Foto (si fue adjuntada)
  - [ ] Fecha y hora

#### Endpoint de Test
Para testear sin crear mascotas:
```bash
curl -X POST http://localhost:3000/api/emails/test
```

Deberías recibir un email de prueba.

### ✅ Test 15: Performance y UX
**Todas las rutas**

#### Estados de Carga
- [ ] Al cargar `/` muestra skeleton cards
- [ ] Al cargar `/my-pets` muestra skeletons
- [ ] Al cargar `/map` muestra loading state
- [ ] Botones muestran spinner mientras procesan

#### Estados Vacíos
- [ ] Usuario nuevo ve estado vacío en `/my-pets`
- [ ] Filtros sin resultados muestran "Sin resultados"
- [ ] Chat sin mensajes muestra estado inicial

#### Responsive Design
- [ ] Probar en móvil (375px)
- [ ] Probar en tablet (768px)
- [ ] Probar en desktop (1024px+)
- [ ] Verificar que todo es usable en cada tamaño

#### Accesibilidad
- [ ] Navegar con teclado (Tab)
- [ ] Verificar focus states visibles
- [ ] Probar con lector de pantalla (opcional)

### ✅ Test 16: Seguridad y Validación
**Todas las rutas**

#### Validación de Formularios
- [ ] Intentar enviar formulario vacío
- [ ] Verificar mensajes de error
- [ ] Email inválido muestra error
- [ ] Teléfono inválido muestra error

#### Autorización
- [ ] Intentar editar mascota de otro usuario (debe fallar)
- [ ] Intentar marcar como encontrada mascota ajena (debe fallar)
- [ ] Acceder a `/my-pets` sin login (debe redirigir)

#### Validación de Imágenes
- [ ] Subir archivo no-imagen (debe rechazar)
- [ ] Subir imagen muy grande (debe comprimir o avisar)

---

## 🐛 Reporte de Bugs

Si encuentras algún error, documéntalo con:

1. **Pasos para reproducir**
2. **Comportamiento esperado**
3. **Comportamiento actual**
4. **Screenshots** (si aplica)
5. **Navegador y versión**
6. **Consola de errores** (F12 → Console)

---

## ✅ Checklist Final

Antes de considerar el testing completo:

- [ ] Todos los tests pasaron sin errores críticos
- [ ] Emails funcionan correctamente
- [ ] Chat sincroniza en tiempo real
- [ ] Geolocalización precisa
- [ ] Filtros funcionan correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay warnings de TypeScript
- [ ] La aplicación es responsive
- [ ] Performance es aceptable (< 3s carga inicial)

---

## 📊 Herramientas Útiles

### Chrome DevTools
```
F12 → Console: Ver errores JavaScript
F12 → Network: Ver peticiones API
F12 → Application: Ver Firestore/Storage
```

### Testing en Móvil
```
F12 → Toggle Device Toolbar
O acceder desde tu móvil: http://[tu-ip-local]:3000
```

### Limpiar Cache
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

**Última actualización**: Documento de testing completo para todas las funcionalidades.
