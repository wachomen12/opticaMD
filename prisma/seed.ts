import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PACIENTES = [
  {
    cedula: "1712345678",
    nombres: "María Fernanda",
    apellidos: "Guamaní Toapanta",
    fechaNacimiento: new Date("1992-03-14T12:00:00Z"),
    edad: 34,
    genero: "Femenino",
    telefono: "099 876 5432",
    email: "mf.guamani@gmail.com",
    direccion: "Av. Eloy Alfaro y Av. Naciones Unidas, Quito",
    ocupacion: "Docente",
  },
  {
    cedula: "1803456789",
    nombres: "Carlos Andrés",
    apellidos: "Vélez Mendoza",
    fechaNacimiento: new Date("1984-07-22T12:00:00Z"),
    edad: 42,
    genero: "Masculino",
    telefono: "098 765 4321",
    email: "carlos.velez@outlook.com",
    direccion: "La Carolina, Quito",
    ocupacion: "Ingeniero civil",
  },
  {
    cedula: "1704567890",
    nombres: "Rosa Elena",
    apellidos: "Chávez Paredes",
    fechaNacimiento: new Date("1968-01-05T12:00:00Z"),
    edad: 58,
    genero: "Femenino",
    telefono: "097 654 3210",
    direccion: "Cumbayá, Quito",
    ocupacion: "Comerciante",
  },
  {
    cedula: "0605678901",
    nombres: "Luis Alberto",
    apellidos: "Moreno Salazar",
    fechaNacimiento: new Date("1999-11-30T12:00:00Z"),
    edad: 27,
    genero: "Masculino",
    telefono: "096 543 2109",
    email: "luis.moreno27@gmail.com",
    direccion: "La Floresta, Quito",
    ocupacion: "Estudiante",
  },
  {
    cedula: "1716789012",
    nombres: "Ana Lucía",
    apellidos: "Torres Benítez",
    fechaNacimiento: new Date("1995-05-18T12:00:00Z"),
    edad: 31,
    genero: "Femenino",
    telefono: "095 432 1098",
    email: "ana.torresb@hotmail.com",
    direccion: "Av. República y Amazonas, Quito",
    ocupacion: "Contadora",
  },
  {
    cedula: "0507890123",
    nombres: "Jorge Washington",
    apellidos: "Paredes Cevallos",
    fechaNacimiento: new Date("1961-09-09T12:00:00Z"),
    edad: 65,
    genero: "Masculino",
    telefono: "094 321 0987",
    direccion: "Tumbaco, Quito",
    ocupacion: "Jubilado",
  },
  {
    cedula: "1728901234",
    nombres: "Daniela Sofía",
    apellidos: "Ortiz Ríos",
    fechaNacimiento: new Date("2007-02-27T12:00:00Z"),
    edad: 19,
    genero: "Femenino",
    telefono: "093 210 9876",
    email: "dani.ortiz@icloud.com",
    direccion: "San Blas, Quito",
    ocupacion: "Estudiante",
  },
  {
    cedula: "1309012345",
    nombres: "Miguel Ángel",
    apellidos: "Zambrano Vera",
    fechaNacimiento: new Date("1979-12-03T12:00:00Z"),
    edad: 47,
    genero: "Masculino",
    telefono: "092 109 8765",
    direccion: "Cotocollao, Quito",
    ocupacion: "Chofer profesional",
  },
];

const PROVEEDORES = [
  "Laboratorio Óptico Visión Andina",
  "Importadora FrameLine Cía. Ltda.",
  "Distribuidora LensPro Ecuador",
  "Laboratorio Cristal Vision",
  "Insumos Ópticos Quito",
];

async function main() {
  console.log("→ Limpiando datos previos…");
  await prisma.pagoVenta.deleteMany();
  await prisma.historiaClinica.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.compra.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.paciente.deleteMany();

  console.log("→ Creando pacientes…");
  const pacientes = [];
  for (const data of PACIENTES) {
    pacientes.push(await prisma.paciente.create({ data }));
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let ventaSeq = 0;

  const ventaTemplates = [
    { categoria: "LUNAS" as const, descripcion: "Lunas progresivas digitales + antirreflejo", min: 185, max: 420 },
    { categoria: "LUNAS" as const, descripcion: "Lunas monofocales antirreflejo 1.56", min: 120, max: 240 },
    { categoria: "ARMAZONES" as const, descripcion: "Armazón acetato marca Vulk", min: 85, max: 240 },
    { categoria: "ARMAZONES" as const, descripcion: "Armazón titanio ultraliviano", min: 120, max: 280 },
    { categoria: "LENTES_CONTACTO" as const, descripcion: "Lentes de contacto mensuales (par)", min: 55, max: 150 },
    { categoria: "ACCESORIOS" as const, descripcion: "Solución multiuso 360 ml", min: 8, max: 35 },
    { categoria: "CONSULTA" as const, descripcion: "Consulta optométrica completa", min: 20, max: 35 },
  ];

  console.log("→ Creando ventas de los últimos 4 meses…");
  for (let offset = 3; offset >= 0; offset--) {
    const cursor = new Date(year, month - offset, 1);
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const gifted = offset === 0 ? Math.max(1, Math.min(now.getDate(), lastDay)) : lastDay;
    const cantidad = offset === 0 ? 10 : 18;

    for (let i = 0; i < cantidad; i++) {
      const template = ventaTemplates[Math.floor(Math.random() * ventaTemplates.length)];
      const total = Math.round((template.min + Math.random() * (template.max - template.min)) * 100) / 100;
      const day = 1 + Math.floor(Math.random() * gifted);
      const fecha = new Date(y, m, day, 11, 30);
      const paciente = Math.random() > 0.25 ? pacientes[Math.floor(Math.random() * pacientes.length)] : null;
      const metodo = Math.random() > 0.5 ? "EFECTIVO" : "TRANSFERENCIA";
      const parcial = template.categoria === "LUNAS" && Math.random() > 0.6;
      const pagado = parcial ? Math.round(total * 0.5 * 100) / 100 : total;
      const estadoPago = parcial ? "PARCIAL" : "PAGADA";

      await prisma.venta.create({
        data: {
          codigo: `V-${y}-${String(++ventaSeq).padStart(4, "0")}`,
          fecha,
          categoria: template.categoria,
          descripcion: template.descripcion,
          total,
          metodoPago: metodo,
          estadoPago,
          estadoEntrega: offset === 0 ? "EN_TALLER" : "ENTREGADO",
          pacienteId: paciente?.id ?? null,
          clienteNombre: paciente ? null : "Cliente ocasional",
          pagos: {
            create: {
              monto: pagado,
              metodo,
              fecha,
              nota: parcial ? "Abono inicial / anticipo" : "Pago total",
            },
          },
        },
      });
    }

    for (let i = 0; i < 3; i++) {
      const compraTotal = Math.round((150 + Math.random() * 500) * 100) / 100;
      await prisma.compra.create({
        data: {
          fecha: new Date(y, m, 2 + Math.floor(Math.random() * Math.max(1, gifted - 2)), 10),
          proveedor: PROVEEDORES[Math.floor(Math.random() * PROVEEDORES.length)],
          numeroComprobante: `001-001-${String(1000 + i).padStart(9, "0")}`,
          categoria: i === 0 ? "LUNAS_LABORATORIO" : i === 1 ? "ARMAZONES" : "INSUMOS",
          descripcion: i === 0 ? "Tallado de lunas progresivas" : i === 1 ? "Lote de armazones" : "Insumos ópticos varios",
          total: compraTotal,
        },
      });
    }

    const gastos = [
      { categoria: "ARRIENDO" as const, descripcion: "Arriendo local comercial", monto: 650, day: 2, recurrente: true },
      { categoria: "SERVICIOS" as const, descripcion: "Planilla de luz", monto: 84.5, day: 4 },
      { categoria: "SERVICIOS" as const, descripcion: "Internet fibra óptica + telefonía", monto: 45.9, day: 5, recurrente: true },
      { categoria: "SUELDOS" as const, descripcion: "Sueldo asistente de mostrador", monto: 482, day: 28, recurrente: true },
      { categoria: "PUBLICIDAD" as const, descripcion: "Pauta en redes sociales", monto: 120, day: 10 },
    ];
    for (const gasto of gastos) {
      await prisma.gasto.create({
        data: {
          fecha: new Date(y, m, Math.min(gasto.day, gifted), 10),
          categoria: gasto.categoria,
          descripcion: gasto.descripcion,
          monto: gasto.monto,
          recurrente: Boolean(gasto.recurrente),
        },
      });
    }
  }

  console.log("→ Creando historias clínicas de ejemplo…");
  await prisma.historiaClinica.create({
    data: {
      numeroHistoria: "HC-0001",
      pacienteId: pacientes[0].id,
      fecha: new Date(year, month - 2, 12, 10, 30),
      usaLentes: true,
      ultimoControlVisual: new Date(year - 1, month - 2, 20).toISOString(),
      ultimoCambioLentes: new Date(year - 2, month - 6, 12).toISOString(),
      motivosConsulta: ["Visión borrosa de lejos", "Dolor de cabeza", "Renovación de lentes"],
      antecedentesPatologicos: ["Ninguno"],
      antecedentesOftalmologicos: ["Uso de lente"],
      antecedentesFamiliares: ["Miopía", "Hipertensión"],
      avSinCorreccionVL_OD: "20/40",
      avSinCorreccionVL_OI: "20/50",
      avSinCorreccionVP_OD: "20/30",
      avSinCorreccionVP_OI: "20/40",
      avConCorreccionVL_OD: "20/20",
      avConCorreccionVL_OI: "20/20",
      avConCorreccionVP_OD: "20/20",
      avConCorreccionVP_OI: "20/25",
      papilaOptica: "Normal, bordes definidos",
      macula: "Normal",
      retina: "Sin alteraciones aparentes",
      observacionesSegmentoPosterior: "Relación CD 0.3 en ambos ojos.",
      diagnosticos: ["Miopía", "Astigmatismo"],
      esfera_OD: "-1.75",
      esfera_OI: "-2.00",
      cilindro_OD: "-0.50",
      cilindro_OI: "-0.75",
      eje_OD: "180°",
      eje_OI: "175°",
      altura_OD: "18 mm",
      altura_OI: "18 mm",
      dnp_OD: "31 mm",
      dnp_OI: "31 mm",
      avFinal_OD: "20/20",
      avFinal_OI: "20/20",
      tipoLenteRecomendado: ["Monofocal"],
      tratamientosRecomendados: ["Antirreflejo", "Filtro UV"],
    },
  });

  await prisma.historiaClinica.create({
    data: {
      numeroHistoria: "HC-0002",
      pacienteId: pacientes[2].id,
      fecha: new Date(year, month - 1, 8, 15),
      usaLentes: true,
      ultimoControlVisual: new Date(year - 1, month - 2, 2).toISOString(),
      ultimoCambioLentes: new Date(year - 3, month - 9, 18).toISOString(),
      motivosConsulta: ["Visión borrosa de cerca", "Fatiga visual", "Control visual"],
      antecedentesPatologicos: ["Hipertensión arterial"],
      antecedentesOftalmologicos: ["Uso de lente", "Catarata"],
      antecedentesFamiliares: ["Glaucoma", "Catarata"],
      avSinCorreccionVL_OD: "20/30",
      avSinCorreccionVL_OI: "20/30",
      avSinCorreccionVP_OD: "20/60",
      avSinCorreccionVP_OI: "20/60",
      avConCorreccionVL_OD: "20/25",
      avConCorreccionVL_OI: "20/25",
      avConCorreccionVP_OD: "20/30",
      avConCorreccionVP_OI: "20/30",
      papilaOptica: "Normal",
      macula: "Leve pigmentación macular",
      retina: "Normal",
      observacionesSegmentoPosterior: "Control anual con oftalmología.",
      diagnosticos: ["Presbicia", "Hipermetropía"],
      esfera_OD: "+1.50",
      esfera_OI: "+1.75",
      cilindro_OD: "-0.25",
      cilindro_OI: "-0.25",
      eje_OD: "90°",
      eje_OI: "85°",
      adicion_OD: "+2.00",
      adicion_OI: "+2.00",
      altura_OD: "20 mm",
      altura_OI: "20 mm",
      dnp_OD: "30 mm",
      dnp_OI: "30 mm",
      avFinal_OD: "20/25",
      avFinal_OI: "20/25",
      tipoLenteRecomendado: ["Progresivo"],
      tratamientosRecomendados: ["Antirreflejo", "Filtro de luz azul", "Fotocromático"],
    },
  });

  console.log("✓ Seed completado: 8 pacientes, ventas, compras, gastos e historias clínicas de ejemplo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
