# ÓPTICA MD — Sistema de Gestión Clínica y Contable

> **VEMOS POR TI, CUIDAMOS TU VISIÓN**

Aplicación web para la gestión integral de una óptica: fichas de pacientes, historial clínico optométrico y contabilidad mensual (ventas, compras, gastos y reportes).

Construida con **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma** y **PostgreSQL**. Optimizada para desplegarse en **Vercel**.

---

## ✨ Funcionalidades

### Acceso y seguridad
- Pantalla de **Login** en `/login` con la identidad visual de ÓPTICA MD.
- Sesión firmada con **HMAC-SHA256** y cookie `httpOnly` (12 horas, `sameSite=lax`, `secure` en producción).
- `middleware.ts` protege `/dashboard`, `/pacientes`, `/ventas`, `/compras`, `/gastos` y `/reportes`; las rutas públicas se limitan al login y a los recursos estáticos.
- Credenciales configurables con `ADMIN_EMAIL` y `ADMIN_PASSWORD`; el secreto de firma se define con `AUTH_SECRET`.
- Botón **Cerrar sesión** en el sidebar y redirección segura después del login.

### Dashboard financiero
- Selector de mes y año con navegación.
- KPIs del periodo: ventas facturadas, cobrado, compras, gastos, utilidad neta, ticket promedio y cuentas por cobrar.
- Flujo de caja mensual (gráfico SVG) y comparación contra el mes anterior.
- Cobranza del mes (donut) y distribución de gastos por categoría.
- Movimientos recientes y cartera pendiente.
- Accesos rápidos para registrar **venta**, **compra** y **gasto** desde cualquier pantalla.

### Ventas
- Categorías: lunas/cristales, armazones, lentes de contacto, accesorios y consultas.
- Ventas con paciente registrado o cliente ocasional.
- Abonos y saldos: estados **Pendiente**, **Parcial** y **Pagada** calculados a partir de los pagos.
- Método de pago (efectivo, transferencia, tarjeta).
- Estado de entrega editable en línea: **En taller**, **Listo**, **Entregado**.
- Registro de abonos posteriores y filtros por texto, categoría, método y estado.
- **Acciones rápidas por venta:** recibo imprimible, orden de laboratorio (si la venta está vinculada a una historia clínica) y notificación por WhatsApp.
- **Recibo de venta / comprobante de abono** en `/ventas/[id]/recibo`, con formato A5 o ticket adaptable: encabezado, paciente, detalle del trabajo, valor total, abono pagado, saldo pendiente, método de pago, abonos registrados y estado de entrega.
- **Orden de laboratorio / taller** en `/ventas/[id]/orden-laboratorio`: solo medidas técnicas (esfera, cilindro, eje, adición, altura y DNP para OD/OI), tipo de lente y tratamientos, **sin precios**.
- **WhatsApp con plantillas automáticas** según el estado de entrega:
  - Pedido registrado: total, abono y saldo pendiente.
  - Lentes listos (`LISTO` o `ENTREGADO`): aviso de retiro con saldo pendiente.

### Compras e inventario
- Registro de compras con proveedor, RUC, número de comprobante y categoría.
- Totales por mes, desglose por proveedor y categoría.

### Gastos
- Gastos operativos por categoría (arriendo, servicios, sueldos, mantenimiento, publicidad, otros).
- Soporte para gastos recurrentes y número de comprobante.

### Pacientes e historial clínico
- CRUD de pacientes con búsqueda por nombre, cédula, teléfono o correo.
- Ficha con datos de contacto, compras, saldo pendiente y ventas asociadas.
- Archivado/restauración de pacientes (no se eliminan registros con historial).
- Ruta `/pacientes/[id]/historial` con la **historia clínica optométrica completa** de 6 secciones:
  1. **Filiación y control** — datos editables del paciente (edad, género, ocupación, teléfono, dirección), uso de lentes, último control visual y último cambio de lentes. El número `HC-0001` se asigna automáticamente.
  2. **Motivo de consulta** — las 14 opciones del formulario clínico, con campo de texto condicional para «Otros».
  3. **Antecedentes** — tarjetas independientes de patológicos personales, oftalmológicos y familiares; «Ninguno» desmarca el resto de su bloque.
  4. **Examen optométrico** — tabla de agudeza visual `Evaluación | OD | OI` (VL/VP, con y sin corrección) y evaluación del segmento posterior (papila, mácula, retina y observaciones).
  5. **Diagnóstico optométrico** — selección múltiple con campo condicional para «Otro».
  6. **Prescripción optométrica** — tabla técnica `Parámetro | OD | OI` (esfera, cilindro, eje, adición, altura, DNP, AV final), tipo de lente y tratamientos recomendados.
- Un paciente puede tener **múltiples controles** a lo largo del tiempo, con selector de historias guardadas y creación de un nuevo control.
- Cada control actualiza la filiación del paciente y conserva el número de historia correlativo.
- **Imprimir Receta / PDF:** vista limpia de impresión en `/pacientes/[id]/historial/receta?hc=<historiaId>`, con la identidad visual de ÓPTICA MD, tabla OD/OI, diagnóstico, tipo de lente y tratamientos.
- **Crear Venta desde esta Receta:** abre el diálogo de venta precargado con el paciente y una descripción como `Lente Progresivo + Antirreflejo + Filtro de luz azul - Según HC #0001`; al guardar, la venta queda vinculada a la historia clínica.

### Reportes contables mensuales
- Estado de resultados del mes (facturado, cobrado, costo de compras, gastos, utilidad).
- Resultado en base devengada y en base caja.
- Detalle por categoría de ingreso y egreso.
- Exportación a **CSV** (`/api/reportes/export?mes=YYYY-MM`).
- Impresión / guardado como PDF con estilos de impresión dedicados.

### Experiencia de uso
- Interfaz corporativa responsive con sidebar colapsable y cajón móvil.
- Paleta de marca: azul `#235D92`, azul profundo `#123568`, naranja `#EA711B`, fondo `#F8FAFC`.
- Formularios en diálogos con validación y mensajes de error en español.
- Modo demostración automático cuando no hay base de datos configurada.

### Logo oficial
- El componente `LogoOpticaMD` carga **`public/logo-optica-md.png`** en el sidebar, login, receta y recibo.
- Mientras el archivo no exista (o si falla la carga), se muestra un **fallback tipográfico/SVG** limpio con la marca ÓPTICA MD.
- Para reemplazarlo, copia la imagen oficial en `public/logo-optica-md.png`; no hace falta cambiar código.

---

## 🧱 Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Actions) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + componentes estilo shadcn/ui |
| Iconos | Lucide React |
| UI primitives | Radix UI (Dialog, Tabs, Slot) |
| Base de datos | PostgreSQL (Supabase / Neon) |
| ORM | Prisma 6 |
| Despliegue | Vercel |

---

## 🚀 Inicio rápido (modo demostración)

Requisitos: **Node.js 20+** y npm.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido a `/login`.

Credenciales de demostración (si no defines `ADMIN_EMAIL` ni `ADMIN_PASSWORD`):

```text
Correo:     admin@opticamd.ec
Contraseña: OpticaMD2026!
```

Sin variables de entorno, la aplicación arranca en **modo demostración** con un conjunto de datos realista de 6 meses (pacientes, historias clínicas, ventas, pagos, compras y gastos). Puedes crear y editar registros: los cambios se mantienen en memoria mientras el servidor esté activo y se reinician al reiniciarlo.

> El modo demo se activa automáticamente si `DATABASE_URL` no existe, es un placeholder o si `DEMO_MODE=true`.

---

## 🗄️ Conectar PostgreSQL (Supabase o Neon)

1. Crea un proyecto en [Supabase](https://supabase.com) o [Neon](https://neon.tech).
2. Copia `.env.example` a `.env` y completa las credenciales:

```env
# Supabase: usa el connection string del pooler (puerto 6543) para DATABASE_URL
# y la conexión directa (puerto 5432) para DIRECT_URL / migraciones.
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:6543/postgres?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"

NEXT_PUBLIC_APP_NAME="ÓPTICA MD"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ADMIN_EMAIL="admin@opticamd.ec"
ADMIN_PASSWORD="OpticaMD2026!"
AUTH_SECRET="una-cadena-larga-aleatoria-de-al-menos-32-caracteres"
```

3. Genera el esquema y carga los datos de ejemplo:

```bash
npm run db:push
npm run db:seed
npm run dev
```

### Alternativa: ejecutar el SQL directamente

El archivo [`supabase/schema.sql`](supabase/schema.sql) contiene el DDL completo (tipos enum, tablas, índices y llaves foráneas) generado desde Prisma. Puedes pegarlo en el **SQL Editor** de Supabase si prefieres no usar `prisma db push`.

Para cargar solo los datos de ejemplo sobre una base ya creada:

```bash
npm run db:seed
```

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub/GitLab.
2. Importa el proyecto en [Vercel](https://vercel.com/new).
3. Configura las variables de entorno del proyecto:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET` (cadena aleatoria de al menos 32 caracteres; por ejemplo `openssl rand -base64 48`)
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL` (tu dominio público, p. ej. `https://optica-md.vercel.app`)
4. Ejecuta el esquema contra la base de producción (una sola vez):

```bash
npx prisma db push
npm run db:seed   # opcional: datos de ejemplo
```

5. Despliega. El comando de build ya incluye `prisma generate` y `package.json` define `postinstall: prisma generate` para que Vercel compile Prisma correctamente.

> **Importante:** no definas `DEMO_MODE=true` en producción si quieres persistencia real. En Vercel el modo demo funciona, pero cada instancia/serverless puede reiniciar su estado en memoria.
>
> Cambia siempre `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET` antes de publicar. En producción la cookie de sesión se marca `secure` y solo viaja por HTTPS.

---

## 📜 Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | Linter de Next.js |
| `npm run db:push` | Sincroniza `schema.prisma` con PostgreSQL |
| `npm run db:seed` | Carga datos de demostración |
| `npm run db:studio` | Abre Prisma Studio |

---

## 📁 Estructura del proyecto

```
prisma/
  schema.prisma          # Modelos y enums (Paciente, HistoriaClinica, Venta, PagoVenta, Compra, Gasto)
  seed.ts                # Datos de ejemplo para PostgreSQL
supabase/
  schema.sql             # DDL listo para el SQL Editor de Supabase
src/
  app/
    (app)/               # Layout de la aplicación
      dashboard/         # Dashboard financiero mensual
      ventas/            # Registro y cobranza de ventas
      compras/           # Compras e inventario
      gastos/            # Gastos operativos
      reportes/          # Reportes contables + exportación CSV
      pacientes/         # Listado, ficha e historial clínico
    login/               # Pantalla de acceso
    (print)/             # Rutas de impresión sin el shell de la app
      pacientes/[id]/historial/receta/  # Receta optométrica imprimible
      ventas/[id]/recibo/              # Recibo de venta / comprobante de abono
      ventas/[id]/orden-laboratorio/   # Orden técnica para el taller
    actions/             # Server Actions (auth, contabilidad, pacientes e historial)
    api/reportes/export/ # Generación de CSV
    globals.css          # Tema, utilidades y estilos de impresión A4
  components/
    auth/                # Formulario de login
    brand/               # Logo oficial + fallback de marca
    dashboard/           # KPIs, gráficos, movimientos, cartera
    layout/              # Sidebar (con cierre de sesión), topbar, footer, logo
    contabilidad/        # Diálogos de venta, compra, gasto, pago
    pacientes/           # Tabla, diálogos y ficha
    clinical/            # Asistente de historia clínica (6 secciones) y botón de impresión
    ui/                  # Componentes base reutilizables
  lib/
    accounting.ts        # Cálculos de KPIs, flujo de caja y agregados
    auth.ts              # Credenciales, sesión firmada y validación de token
    clinical.ts          # Catálogos clínicos, filas de AV/RX y resumen de receta
    data.ts              # Capa de acceso a datos (Prisma o demo)
    demo-store.ts        # Dataset y mutaciones en memoria
    prisma.ts            # Cliente Prisma + detección de modo demo
    whatsapp.ts          # Plantillas de WhatsApp y normalización de teléfonos
    format.ts            # Formato de moneda, fechas y etiquetas
  middleware.ts          # Protección de rutas y redirección al login
public/
  logo-optica-md.png     # Logo oficial (opcional; si no existe se usa el fallback)
```

---

## 🧮 Criterios contables

- **Ventas del mes:** suma de `total` de las ventas con fecha dentro del periodo.
- **Cobrado del mes:** suma de los pagos (`PagoVenta`) registrados en el periodo, incluidos abonos de ventas anteriores.
- **Por cobrar del mes:** saldo pendiente (`total − pagos`) de las ventas del periodo.
- **Utilidad neta (base caja):** `cobrado − compras − gastos`. Es la cifra principal del dashboard.
- **Resultado devengado (reportes):** `ventas facturadas − compras − gastos`, mostrado como referencia junto al resultado en base caja.

Los importes se almacenan como `Decimal(10,2)` y se formatean como moneda de Ecuador (USD).

---

## 🔭 Alcance y siguientes pasos

Esta entrega incluye la base contable, la gestión de pacientes, la **historia clínica optométrica completa**, el acceso protegido y los comprobantes operativos (recibo, orden de laboratorio y WhatsApp). Quedan como siguientes iteraciones:

- Roles y permisos (administración, optómetra, caja).
- Inventario con stock por producto y alertas de reposición.
- Carga de comprobantes (facturas, recibos) a almacenamiento de objetos.
- Recordatorios de control visual y citas.
- Envío de la receta por correo o WhatsApp.

---

## 📝 Notas

- El acceso está protegido por login y sesión firmada; cambia las credenciales y `AUTH_SECRET` antes de publicar.
- Los datos de demostración se generan de forma determinista respecto a la fecha actual.
- Para restablecer el demo basta con reiniciar el servidor.
- El logo oficial se toma de `public/logo-optica-md.png`; si no existe, se usa el fallback de marca.
- Moneda: USD. Zona horaria de referencia: Ecuador (UTC−5).

---

© ÓPTICA MD · VEMOS POR TI, CUIDAMOS TU VISIÓN
