-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CategoriaVenta" AS ENUM ('LUNAS', 'LENTE_COMPLETO', 'ARMAZONES', 'LENTES_CONTACTO', 'ACCESORIOS', 'CONSULTA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADA');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('EN_TALLER', 'LISTO', 'ENTREGADO');

-- CreateEnum
CREATE TYPE "CategoriaCompra" AS ENUM ('ARMAZONES', 'LUNAS_LABORATORIO', 'LENTES_CONTACTO', 'INSUMOS', 'EQUIPOS', 'OTROS');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('ARRIENDO', 'SERVICIOS', 'SUELDOS', 'MANTENIMIENTO', 'PUBLICIDAD', 'OTROS');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "cedula" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "edad" INTEGER,
    "genero" TEXT,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "direccion" TEXT,
    "ocupacion" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" "CategoriaVenta" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "estadoEntrega" "EstadoEntrega" NOT NULL DEFAULT 'ENTREGADO',
    "pacienteId" TEXT,
    "clienteNombre" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historias_clinicas" (
    "id" TEXT NOT NULL,
    "numeroHistoria" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usaLentes" BOOLEAN NOT NULL DEFAULT false,
    "ultimoControlVisual" TEXT,
    "ultimoCambioLentes" TEXT,
    "motivosConsulta" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "motivoConsultaOtros" TEXT,
    "antecedentesPatologicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "antecedentesPatologicosOtros" TEXT,
    "antecedentesOftalmologicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "antecedentesOftalmologicosOtros" TEXT,
    "antecedentesFamiliares" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "antecedentesFamiliaresOtros" TEXT,
    "avSinCorreccionVL_OD" TEXT,
    "avSinCorreccionVL_OI" TEXT,
    "avSinCorreccionVP_OD" TEXT,
    "avSinCorreccionVP_OI" TEXT,
    "avConCorreccionVL_OD" TEXT,
    "avConCorreccionVL_OI" TEXT,
    "avConCorreccionVP_OD" TEXT,
    "avConCorreccionVP_OI" TEXT,
    "papilaOptica" TEXT,
    "macula" TEXT,
    "retina" TEXT,
    "observacionesSegmentoPosterior" TEXT,
    "diagnosticos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "diagnosticoOtro" TEXT,
    "esfera_OD" TEXT,
    "esfera_OI" TEXT,
    "cilindro_OD" TEXT,
    "cilindro_OI" TEXT,
    "eje_OD" TEXT,
    "eje_OI" TEXT,
    "adicion_OD" TEXT,
    "adicion_OI" TEXT,
    "altura_OD" TEXT,
    "altura_OI" TEXT,
    "dnp_OD" TEXT,
    "dnp_OI" TEXT,
    "avFinal_OD" TEXT,
    "avFinal_OI" TEXT,
    "tipoLenteRecomendado" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tipoLenteOtro" TEXT,
    "tratamientosRecomendados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tratamientoOtro" TEXT,
    "pacienteId" TEXT NOT NULL,
    "ventaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_venta" (
    "id" TEXT NOT NULL,
    "ventaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "MetodoPago" NOT NULL DEFAULT 'EFECTIVO',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedor" TEXT NOT NULL,
    "proveedorRuc" TEXT,
    "numeroComprobante" TEXT,
    "categoria" "CategoriaCompra" NOT NULL DEFAULT 'ARMAZONES',
    "descripcion" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" "CategoriaGasto" NOT NULL DEFAULT 'OTROS',
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "recurrente" BOOLEAN NOT NULL DEFAULT false,
    "comprobante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cedula_key" ON "pacientes"("cedula");

-- CreateIndex
CREATE INDEX "pacientes_apellidos_nombres_idx" ON "pacientes"("apellidos", "nombres");

-- CreateIndex
CREATE UNIQUE INDEX "ventas_codigo_key" ON "ventas"("codigo");

-- CreateIndex
CREATE INDEX "ventas_fecha_idx" ON "ventas"("fecha");

-- CreateIndex
CREATE INDEX "ventas_estadoPago_idx" ON "ventas"("estadoPago");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_numeroHistoria_key" ON "historias_clinicas"("numeroHistoria");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_ventaId_key" ON "historias_clinicas"("ventaId");

-- CreateIndex
CREATE INDEX "historias_clinicas_pacienteId_fecha_idx" ON "historias_clinicas"("pacienteId", "fecha");

-- CreateIndex
CREATE INDEX "historias_clinicas_fecha_idx" ON "historias_clinicas"("fecha");

-- CreateIndex
CREATE INDEX "pagos_venta_ventaId_idx" ON "pagos_venta"("ventaId");

-- CreateIndex
CREATE INDEX "pagos_venta_fecha_idx" ON "pagos_venta"("fecha");

-- CreateIndex
CREATE INDEX "compras_fecha_idx" ON "compras"("fecha");

-- CreateIndex
CREATE INDEX "gastos_fecha_idx" ON "gastos"("fecha");

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_clinicas" ADD CONSTRAINT "historias_clinicas_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_venta" ADD CONSTRAINT "pagos_venta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

