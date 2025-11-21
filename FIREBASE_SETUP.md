# Configuración de Firebase

Este documento explica cómo configurar Firebase Authentication, Firestore y Storage para tu aplicación PawAlert.

## Prerrequisitos

1. Tener una cuenta de Firebase
2. Tener instalado Firebase CLI: `npm install -g firebase-tools`

## Pasos para configurar Firebase

### 1. Autenticarse en Firebase

```bash
firebase login
```

### 2. Inicializar Firebase en el proyecto (si no está inicializado)

```bash
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Storage
- ✅ Hosting (opcional)

Cuando pregunte por archivos de configuración, usa los que ya existen:
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`

### 3. Habilitar métodos de autenticación

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Sign-in method**
4. Habilita los siguientes proveedores:
   - ✅ **Email/Password**
   - ✅ **Google** (recomendado)

### 4. Desplegar las reglas de seguridad

```bash
# Desplegar solo las reglas de Firestore y Storage
firebase deploy --only firestore:rules,storage
```

### 5. Verificar la configuración

Después de desplegar, verifica que:

1. **Firestore Database** esté creada (modo production)
2. **Storage** esté habilitado
3. Las reglas de seguridad estén activas

## Reglas de seguridad implementadas

### Firestore Rules

- ✅ **Lectura pública**: Cualquiera puede ver las mascotas perdidas
- ✅ **Escritura autenticada**: Solo usuarios autenticados pueden crear reportes
- ✅ **Actualización/Eliminación**: Solo el dueño del reporte puede modificarlo o eliminarlo

### Storage Rules

- ✅ **Lectura pública**: Cualquiera puede ver las imágenes de mascotas
- ✅ **Escritura autenticada**: Solo usuarios autenticados pueden subir imágenes
- ✅ **Límites de tamaño**: Máximo 5MB por imagen
- ✅ **Validación de tipo**: Solo se permiten archivos de imagen

## Estructura de datos

### Colección: `pets`

```typescript
{
  id: string;              // Generado por Firestore
  userId: string;          // UID del usuario de Firebase Auth
  status: 'lost' | 'sighted' | 'found';
  type: 'dog' | 'cat' | 'other';
  name: string;
  breed: string;
  color: string;
  size: string;
  description: string;
  distinguishingFeatures: string;
  photo: string;           // URL de Firebase Storage
  lastSeenLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  lastSeenDate: string;    // ISO 8601
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reward?: string;
  sightings: Sighting[];
  createdAt: string;       // ISO 8601
}
```

### Storage: Estructura de carpetas

```
/pets/
  ├── {timestamp}_{filename}.jpg
  ├── {timestamp}_{filename}.png
  └── ...
```

## Comandos útiles

```bash
# Ver el estado del proyecto
firebase projects:list

# Ver las reglas actuales
firebase firestore:rules get
firebase storage:rules get

# Desplegar todo
firebase deploy

# Desplegar solo reglas
firebase deploy --only firestore:rules,storage

# Ver logs
firebase deploy --only firestore:rules --debug
```

## Solución de problemas

### Error: "Permission denied"
- Verifica que las reglas estén desplegadas correctamente
- Asegúrate de que el usuario esté autenticado antes de intentar crear/actualizar

### Error: "File size too large"
- Las imágenes deben ser menores a 5MB
- Considera comprimir las imágenes antes de subirlas

### Error: "Invalid file type"
- Solo se permiten archivos de imagen (image/*)
- Verifica el tipo MIME del archivo

## Próximos pasos

1. Configurar índices compuestos si es necesario
2. Implementar Cloud Functions para notificaciones
3. Configurar reglas de facturación para producción
4. Implementar límites de tasa (rate limiting)
