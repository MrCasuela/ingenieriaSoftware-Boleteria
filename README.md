# Sistema de Boletería - Vue.js

Un sistema moderno de compra de entradas con código QR único desarrollado con Vue.js 3, Vue Router y Pinia.

## 🎯 Historia de Usuario

**ING-1-HU1**: Como cliente quiero comprar una entrada y recibir un código QR único con mis datos personales para poder ingresar al evento en menos de 2 minutos.

## ✨ Características

- ✅ **Arquitectura Vue Modular** con separación de responsabilidades
- ✅ **4 Vistas principales**: Lista de eventos, Selección de entradas, Datos personales, Confirmación
- ✅ **Código QR único** generado con datos del ticket y comprador
- ✅ **Estado global** con Pinia para manejo de datos
- ✅ **Routing** con Vue Router para navegación entre vistas
- ✅ **Componentes reutilizables** (EventCard, TicketCard, etc.)
- ✅ **Validación de formularios** y formateo automático
- ✅ **Diseño responsivo** con Bootstrap 5
- ✅ **Proceso de compra** en menos de 2 minutos

## 🏗️ Estructura Actualizada del Proyecto

```
📦 ingenieriaSoftware-Boleteria/
├── 📄 index.html         # HTML principal (punto de entrada)
├── 📄 package.json       # Dependencias del proyecto
├── ⚙️ vite.config.js     # Configuración de Vite
├── 📄 README.md         # Documentación
└── 📁 src/              # Código fuente organizado
    ├── 📁 components/   # Componentes reutilizables
    │   ├── NavBar.vue
    │   ├── ProgressIndicator.vue
    │   ├── EventCard.vue
    │   └── TicketCard.vue
    ├── 📁 views/        # Páginas principales
    │   ├── EventList.vue
    │   ├── TicketSelection.vue
    │   ├── PersonalData.vue
    │   └── Confirmation.vue
    ├── 📁 stores/       # Estado global (Pinia)
    │   └── ticketStore.js
    ├── 📁 services/     # APIs y servicios
    │   ├── apiService.js
    │   └── qrService.js
    ├── 📁 composables/  # Funciones reutilizables
    │   ├── useFormFormatting.js
    │   └── useQRGenerator.js
    ├── 📁 router/       # Configuración de rutas
    │   └── index.js
    ├── 📁 assets/       # Recursos estáticos
    │   └── styles.css
    ├── App.vue          # Componente principal
    └── main.js          # Punto de entrada JavaScript
```

## 🚀 Uso Rápido

### Opción 1: Versión Simple (CDN)
Simplemente abre el archivo `index.html` en tu navegador.

### Opción 2: Desarrollo con Vite

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en desarrollo**:
```bash
npm run dev
```

3. **Construir para producción**:
```bash
npm run build
```

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo
- **Vue Router 4** - Enrutamiento oficial
- **Pinia** - Estado global moderno
- **QRCode.js** - Generación de códigos QR
- **Bootstrap 5** - Framework CSS
- **Font Awesome** - Iconos
- **Vite** - Build tool moderno (opcional)

## 🔄 Flujo de Usuario

1. **Seleccionar Evento** → El usuario ve la lista de eventos disponibles
2. **Elegir Entrada** → Selecciona el tipo de entrada y precio
3. **Datos Personales** → Completa información personal y de pago
4. **Confirmación** → Recibe el código QR único para el evento

## 🎨 Componentes Principales

### **Components**
- `NavBar.vue` - Barra de navegación
- `ProgressIndicator.vue` - Indicador de progreso del proceso
- `EventCard.vue` - Tarjeta de evento individual
- `TicketCard.vue` - Tarjeta de tipo de entrada

### **Views**
- `EventList.vue` - Lista de eventos disponibles
- `TicketSelection.vue` - Selección de tipo de entrada
- `PersonalData.vue` - Formulario de datos personales y pago
- `Confirmation.vue` - Confirmación con código QR

### **Services**
- `qrService.js` - Generación y manejo de códigos QR
- `apiService.js` - Simulación de APIs de eventos y pagos

### **Composables**
- `useFormFormatting.js` - Formateo de campos de formulario
- `useQRGenerator.js` - Generación de códigos QR

## 📱 Características Técnicas

- **Responsive Design** - Optimizado para mobile y desktop
- **Progressive Enhancement** - Funciona sin JavaScript básico
- **Estado Reactivo** - Actualizaciones en tiempo real
- **Validación de Formularios** - Campos requeridos y formatos
- **Navegación SPA** - Sin recargas de página
- **Código QR Dinámico** - Generado con datos únicos del usuario

## 🎯 Cumplimiento de Requisitos

✅ **Compra rápida**: Proceso completado en menos de 2 minutos  
✅ **Código QR único**: Generado con datos del evento y comprador  
✅ **Datos personales**: Integrados en el código QR  
✅ **Interfaz intuitiva**: Navegación clara y progreso visible  
✅ **Arquitectura moderna**: Código modular y mantenible