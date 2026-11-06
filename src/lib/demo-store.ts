import type {
  CategoriaCompra,
  CategoriaGasto,
  CategoriaVenta,
  Compra,
  Dataset,
  EstadoPago,
  EstadoEntrega,
  Gasto,
  HistoriaClinica,
  HistoriaClinicaInput,
  MetodoPago,
  Paciente,
  PagoVenta,
  Venta,
} from "./types";

// ─────────────────────────────────────────────────────────────
//  Store en memoria para el modo DEMO.
//  Permite probar todo el sistema sin configurar PostgreSQL.
//  En producción (DATABASE_URL definido) se usa Prisma.
// ─────────────────────────────────────────────────────────────

type Store = {
  pacientes: Paciente[];
  ventas: Venta[];
  compras: Compra[];
  gastos: Gasto[];
  historias: HistoriaClinica[];
  ventaSeq: number;
  pagoSeq: number;
  compraSeq: number;
  gastoSeq: number;
  pacienteSeq: number;
  historiaSeq: number;
};

const globalStore = globalThis as unknown as { __opticaMdStore?: Store };

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20261104);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const randAmount = (min: number, max: number) => Math.round((rnd() * (max - min) + min) * 100) / 100;
const chance = (p: number) => rnd() < p;

const PACIENTES_SEED: Array<Omit<Paciente, "id" | "createdAt" | "activo">> = [
  {
    cedula: "1712345678",
    nombres: "María Fernanda",
    apellidos: "Guamaní Toapanta",
    edad: 34,
    genero: "Femenino",
    fechaNacimiento: "1992-03-14",
    telefono: "099 876 5432",
    email: "mf.guamani@gmail.com",
    direccion: "Av. Eloy Alfaro y Av. Naciones Unidas, Quito",
    ocupacion: "Docente",
  },
  {
    cedula: "1803456789",
    nombres: "Carlos Andrés",
    apellidos: "Vélez Mendoza",
    edad: 42,
    genero: "Masculino",
    fechaNacimiento: "1984-07-22",
    telefono: "098 765 4321",
    email: "carlos.velez@outlook.com",
    direccion: "La Carolina, Quito",
    ocupacion: "Ingeniero civil",
  },
  {
    cedula: "1704567890",
    nombres: "Rosa Elena",
    apellidos: "Chávez Paredes",
    edad: 58,
    genero: "Femenino",
    fechaNacimiento: "1968-01-05",
    telefono: "097 654 3210",
    direccion: "Cumbayá, Quito",
    ocupacion: "Comerciante",
  },
  {
    cedula: "0605678901",
    nombres: "Luis Alberto",
    apellidos: "Moreno Salazar",
    edad: 27,
    genero: "Masculino",
    fechaNacimiento: "1999-11-30",
    telefono: "096 543 2109",
    email: "luis.moreno27@gmail.com",
    direccion: "Sector La Floresta, Quito",
    ocupacion: "Estudiante",
  },
  {
    cedula: "1716789012",
    nombres: "Ana Lucía",
    apellidos: "Torres Benítez",
    edad: 31,
    genero: "Femenino",
    fechaNacimiento: "1995-05-18",
    telefono: "095 432 1098",
    email: "ana.torresb@hotmail.com",
    direccion: "Av. República y Amazonas, Quito",
    ocupacion: "Contadora",
  },
  {
    cedula: "0507890123",
    nombres: "Jorge Washington",
    apellidos: "Paredes Cevallos",
    edad: 65,
    genero: "Masculino",
    fechaNacimiento: "1961-09-09",
    telefono: "094 321 0987",
    direccion: "Tumbaco, Quito",
    ocupacion: "Jubilado",
  },
  {
    cedula: "1728901234",
    nombres: "Daniela Sofía",
    apellidos: "Ortiz Ríos",
    edad: 19,
    genero: "Femenino",
    fechaNacimiento: "2007-02-27",
    telefono: "093 210 9876",
    email: "dani.ortiz@icloud.com",
    direccion: "San Blas, Quito",
    ocupacion: "Estudiante",
  },
  {
    cedula: "1309012345",
    nombres: "Miguel Ángel",
    apellidos: "Zambrano Vera",
    edad: 47,
    genero: "Masculino",
    fechaNacimiento: "1979-12-03",
    telefono: "092 109 8765",
    direccion: "Cotocollao, Quito",
    ocupacion: "Chofer profesional",
  },
];

const VENTA_TEMPLATES: Record<
  CategoriaVenta,
  { descripciones: string[]; min: number; max: number }
> = {
  LUNAS: {
    descripciones: [
      "Lunas monofocales antirreflejo 1.56",
      "Lunas progresivas digitales + antirreflejo",
      "Lunas fotocromáticas blue cut",
      "Lunas monofocales orgánicas AR",
      "Lunas bifocales laboratorio",
    ],
    min: 145,
    max: 420,
  },
  ARMAZONES: {
    descripciones: [
      "Armazón metálico unisex",
      "Armazón acetato marca Vulk",
      "Armazón titanio ultraliviano",
      "Armazón infantil flexible",
      "Armazón deportivo polarizado",
    ],
    min: 68,
    max: 265,
  },
  LENTES_CONTACTO: {
    descripciones: [
      "Lentes de contacto mensuales (par)",
      "Lentes de contacto diarias (30 unidades)",
      "Lentes tóricos mensuales (par)",
      "Lentes de contacto multifocales",
    ],
    min: 45,
    max: 165,
  },
  ACCESORIOS: {
    descripciones: [
      "Solución multiuso 360 ml",
      "Estuche rígido + paño microfibra",
      "Gotas lubricantes oculares",
      "Cordón de sujeción premium",
    ],
    min: 6,
    max: 48,
  },
  CONSULTA: {
    descripciones: [
      "Consulta optométrica completa",
      "Control visual de seguimiento",
      "Examen refractivo + fondo de ojo",
      "Adaptación de lentes de contacto",
    ],
    min: 20,
    max: 40,
  },
};

const PROVEEDORES = [
  "Laboratorio Óptico Visión Andina",
  "Importadora FrameLine Cía. Ltda.",
  "Distribuidora LensPro Ecuador",
  "Laboratorio Cristal Vision",
  "Insumos Ópticos Quito",
  "Equipos Optométricos del Ecuador",
] as const;

const COMPRA_TEMPLATES: Record<CategoriaCompra, string[]> = {
  ARMAZONES: ["Lote de 20 armazones acetato", "Reposición de armazones metálicos"],
  LUNAS_LABORATORIO: ["Tallado de lunas progresivas (12 pares)", "Lunas monofocales AR (20 pares)"],
  LENTES_CONTACTO: ["Caja de lentes mensuales", "Lentes diarios - 3 cajas"],
  INSUMOS: ["Solución de limpieza y estuches", "Tornillos, plaquetas y topes"],
  EQUIPOS: ["Lámpara de hendidura - mantenimiento", "Foróptero digital"],
  OTROS: ["Material de oficina", "Repuestos de montura"],
};

function iso(y: number, m: number, d: number, h = 11, min = 30): string {
  return new Date(y, m, d, h, min).toISOString();
}

function seed(): Store {
  const now = new Date();
  const pacientes: Paciente[] = PACIENTES_SEED.map((p, i) => ({
    ...p,
    id: `p-${String(i + 1).padStart(2, "0")}`,
    activo: true,
    createdAt:
      i < 2
        ? iso(now.getFullYear(), now.getMonth(), Math.min(now.getDate(), i + 1))
        : iso(now.getFullYear(), now.getMonth() - (2 + i), Math.min(28, 5 + i)),
  }));

  const ventas: Venta[] = [];
  const compras: Compra[] = [];
  const gastos: Gasto[] = [];
  let ventaSeq = 0;
  let pagoSeq = 0;
  let compraSeq = 0;
  let gastoSeq = 0;

  const currentDay = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  for (let offset = 5; offset >= 0; offset--) {
    const cursor = new Date(year, month - offset, 1);
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const isCurrent = offset === 0;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const maxDay = isCurrent ? Math.max(1, currentDay) : lastDay;
    const ventaCount = isCurrent ? 24 : randInt(22, 29);

    for (let i = 0; i < ventaCount; i++) {
      const categoria = pick<CategoriaVenta>([
        "LUNAS",
        "LUNAS",
        "LUNAS",
        "ARMAZONES",
        "ARMAZONES",
        "LENTES_CONTACTO",
        "ACCESORIOS",
        "CONSULTA",
        "CONSULTA",
      ]);
      const template = VENTA_TEMPLATES[categoria];
      const total = randAmount(template.min, template.max);
      const day = randInt(1, maxDay);
      const fecha = iso(y, m, day, randInt(9, 18), pick([0, 15, 30, 45]));
      const paciente = chance(0.72) ? pick(pacientes) : null;
      const walkIn = pick([
        "Cliente ocasional",
        "Sofía Herrera",
        "Andrés Villacís",
        "Camila Espinosa",
        "Roberto Cárdenas",
      ]);

      const pagoRoll = rnd();
      // Las lunas suelen dejar saldo porque se envían a tallar.
      const estadoPago: EstadoPago =
        categoria === "LUNAS" && pagoRoll < 0.32
          ? "PARCIAL"
          : pagoRoll < 0.12
            ? "PENDIENTE"
            : pagoRoll < 0.24
              ? "PARCIAL"
              : "PAGADA";

      const estadoEntrega: EstadoEntrega = isCurrent
        ? categoria === "LUNAS"
          ? pick<EstadoEntrega>(["EN_TALLER", "EN_TALLER", "LISTO", "ENTREGADO"])
          : pick<EstadoEntrega>(["ENTREGADO", "ENTREGADO", "LISTO"])
        : "ENTREGADO";

      const ventaId = `v-${String(++ventaSeq).padStart(4, "0")}`;
      const pagos: PagoVenta[] = [];
      const metodo = pick<MetodoPago>(["EFECTIVO", "EFECTIVO", "TRANSFERENCIA", "TARJETA"]);

      if (estadoPago === "PAGADA") {
        pagos.push({
          id: `pg-${String(++pagoSeq).padStart(4, "0")}`,
          ventaId,
          monto: total,
          metodo,
          fecha,
          nota: null,
        });
      } else if (estadoPago === "PARCIAL") {
        pagos.push({
          id: `pg-${String(++pagoSeq).padStart(4, "0")}`,
          ventaId,
          monto: Math.round(total * 0.5 * 100) / 100,
          metodo,
          fecha,
          nota: "Abono inicial / anticipo",
        });
      }

      ventas.push({
        id: ventaId,
        codigo: `V-${y}-${String(ventaSeq).padStart(4, "0")}`,
        fecha,
        categoria,
        descripcion: pick(template.descripciones),
        total,
        metodoPago: metodo,
        estadoPago,
        estadoEntrega,
        pacienteId: paciente?.id ?? null,
        clienteNombre: paciente ? null : walkIn,
        notas:
          categoria === "LUNAS"
            ? pick([
                "Enviado a laboratorio para tallado.",
                "Se coordinó entrega en 5 días hábiles.",
                "Paciente solicita antirreflejo azul.",
                null,
              ])
            : null,
        pagos,
      });
    }

    // Compras del mes
    const compraCount = isCurrent ? 3 : randInt(4, 6);
    for (let i = 0; i < compraCount; i++) {
      const categoria = pick<CategoriaCompra>([
        "ARMAZONES",
        "LUNAS_LABORATORIO",
        "LUNAS_LABORATORIO",
        "LENTES_CONTACTO",
        "INSUMOS",
        "OTROS",
      ]);
      const total =
        categoria === "LUNAS_LABORATORIO"
          ? randAmount(280, 720)
          : categoria === "ARMAZONES"
            ? randAmount(180, 620)
            : randAmount(45, 240);
      compras.push({
        id: `c-${String(++compraSeq).padStart(4, "0")}`,
        fecha: iso(y, m, randInt(1, maxDay), randInt(9, 17)),
        proveedor: pick(PROVEEDORES),
        proveedorRuc: chance(0.7) ? `179${randInt(1000000, 9999999)}001` : null,
        numeroComprobante: `001-001-${String(randInt(1, 999)).padStart(9, "0")}`,
        categoria,
        descripcion: pick(COMPRA_TEMPLATES[categoria]),
        total,
      });
    }

    // Gastos operativos del mes
    const gastosBase: Array<{
      categoria: CategoriaGasto;
      descripcion: string;
      monto: number;
      day: number;
      recurrente?: boolean;
    }> = [
      { categoria: "ARRIENDO", descripcion: "Arriendo local comercial", monto: 650, day: 2, recurrente: true },
      { categoria: "SERVICIOS", descripcion: "Planilla de luz - Empresa Eléctrica", monto: randAmount(72, 98), day: 4 },
      { categoria: "SERVICIOS", descripcion: "Internet fibra óptica + telefonía", monto: 45.9, day: 5, recurrente: true },
      { categoria: "SERVICIOS", descripcion: "Agua potable", monto: randAmount(18, 32), day: 6 },
      { categoria: "SUELDOS", descripcion: "Sueldo asistente de mostrador", monto: 482, day: 28, recurrente: true },
      { categoria: "SUELDOS", descripcion: "Comisiones del mes", monto: randAmount(180, 340), day: 28 },
      { categoria: "PUBLICIDAD", descripcion: "Pauta en redes sociales", monto: randAmount(80, 160), day: 10 },
    ];
    if (chance(0.55)) {
      gastosBase.push({
        categoria: "MANTENIMIENTO",
        descripcion: pick(["Mantenimiento de foróptero", "Calibración de equipos", "Reparación de vitrina"]),
        monto: randAmount(60, 210),
        day: randInt(8, 24),
      });
    }
    if (chance(0.8)) {
      gastosBase.push({
        categoria: "OTROS",
        descripcion: pick(["Suministros de limpieza", "Material de oficina", "Movilización y mensajería"]),
        monto: randAmount(15, 65),
        day: randInt(7, 25),
      });
    }

    for (const g of gastosBase) {
      gastos.push({
        id: `g-${String(++gastoSeq).padStart(4, "0")}`,
        fecha: iso(y, m, Math.min(g.day, maxDay), 10),
        categoria: g.categoria,
        descripcion: g.descripcion,
        monto: g.monto,
        recurrente: Boolean(g.recurrente),
        comprobante: chance(0.6) ? `FAC-${randInt(1000, 9999)}` : null,
      });
    }
  }

  // Algunos saldos de meses pasados se cobran después (flujo de caja realista).
  for (const venta of ventas) {
    const pagado = venta.pagos.reduce((s, p) => s + p.monto, 0);
    const saldo = Math.round((venta.total - pagado) * 100) / 100;
    if (saldo > 0 && chance(0.62)) {
      const base = new Date(venta.fecha);
      const pagoDate = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate() + randInt(7, 26),
        12,
      );
      if (pagoDate.getTime() > now.getTime()) continue;
      venta.pagos.push({
        id: `pg-${String(++pagoSeq).padStart(4, "0")}`,
        ventaId: venta.id,
        monto: saldo,
        metodo: pick<MetodoPago>(["EFECTIVO", "TRANSFERENCIA", "TARJETA"]),
        fecha: pagoDate.toISOString(),
        nota: "Cancelación de saldo",
      });
      venta.estadoPago = "PAGADA";
    }
  }

  // Historias clínicas de ejemplo (controles previos)
  // Preferimos vincular una venta del mes actual para que la orden de
  // laboratorio sea visible en la vista por defecto de /ventas.
  const ventaVinculada =
    [...ventas].reverse().find((venta) => {
      const fecha = new Date(venta.fecha);
      return (
        venta.pacienteId === "p-01" &&
        venta.categoria === "LUNAS" &&
        fecha.getMonth() === month &&
        fecha.getFullYear() === year
      );
    }) ??
    [...ventas].reverse().find(
      (venta) => venta.pacienteId === "p-01" && venta.categoria === "LUNAS",
    );
  const fechaReciente = new Date(year, month, Math.max(1, currentDay - 12), 10, 30);
  const fechaAntigua = new Date(year, month - 10, 15, 10, 30);
  const fechaControlRosa = new Date(year, month - 2, 8, 15, 0);

  const historias: HistoriaClinica[] = [
    {
      id: "h-0001",
      numeroHistoria: "HC-0001",
      fecha: fechaAntigua.toISOString(),
      usaLentes: true,
      ultimoControlVisual: new Date(year - 1, month - 2, 20).toISOString(),
      ultimoCambioLentes: new Date(year - 2, month - 6, 12).toISOString(),
      motivosConsulta: ["Visión borrosa de lejos", "Dolor de cabeza", "Renovación de lentes"],
      motivoConsultaOtros: null,
      antecedentesPatologicos: ["Ninguno"],
      antecedentesPatologicosOtros: null,
      antecedentesOftalmologicos: ["Uso de lente"],
      antecedentesOftalmologicosOtros: null,
      antecedentesFamiliares: ["Miopía", "Hipertensión"],
      antecedentesFamiliaresOtros: null,
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
      diagnosticoOtro: null,
      esfera_OD: "-1.75",
      esfera_OI: "-2.00",
      cilindro_OD: "-0.50",
      cilindro_OI: "-0.75",
      eje_OD: "180°",
      eje_OI: "175°",
      adicion_OD: null,
      adicion_OI: null,
      altura_OD: "18 mm",
      altura_OI: "18 mm",
      dnp_OD: "31 mm",
      dnp_OI: "31 mm",
      avFinal_OD: "20/20",
      avFinal_OI: "20/20",
      tipoLenteRecomendado: ["Monofocal"],
      tipoLenteOtro: null,
      tratamientosRecomendados: ["Antirreflejo", "Filtro UV"],
      tratamientoOtro: null,
      pacienteId: "p-01",
      ventaId: null,
      createdAt: fechaAntigua.toISOString(),
      updatedAt: fechaAntigua.toISOString(),
    },
    {
      id: "h-0002",
      numeroHistoria: "HC-0002",
      fecha: fechaControlRosa.toISOString(),
      usaLentes: true,
      ultimoControlVisual: new Date(year - 1, month - 2, 2).toISOString(),
      ultimoCambioLentes: new Date(year - 3, month - 9, 18).toISOString(),
      motivosConsulta: ["Visión borrosa de cerca", "Fatiga visual", "Control visual"],
      motivoConsultaOtros: null,
      antecedentesPatologicos: ["Hipertensión arterial"],
      antecedentesPatologicosOtros: null,
      antecedentesOftalmologicos: ["Uso de lente", "Catarata"],
      antecedentesOftalmologicosOtros: null,
      antecedentesFamiliares: ["Glaucoma", "Catarata"],
      antecedentesFamiliaresOtros: null,
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
      diagnosticoOtro: null,
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
      tipoLenteOtro: null,
      tratamientosRecomendados: ["Antirreflejo", "Filtro de luz azul", "Fotocromático"],
      tratamientoOtro: null,
      pacienteId: "p-03",
      ventaId: null,
      createdAt: fechaControlRosa.toISOString(),
      updatedAt: fechaControlRosa.toISOString(),
    },
    {
      id: "h-0003",
      numeroHistoria: "HC-0003",
      fecha: fechaReciente.toISOString(),
      usaLentes: true,
      ultimoControlVisual: new Date(year - 1, month - 1, 10).toISOString(),
      ultimoCambioLentes: new Date(year - 1, month - 4, 22).toISOString(),
      motivosConsulta: ["Visión borrosa de lejos", "Fatiga visual", "Renovación de lentes"],
      motivoConsultaOtros: null,
      antecedentesPatologicos: ["Alergias"],
      antecedentesPatologicosOtros: "Alergia a la Nickelsulfato",
      antecedentesOftalmologicos: ["Uso de lente"],
      antecedentesOftalmologicosOtros: null,
      antecedentesFamiliares: ["Miopía"],
      antecedentesFamiliaresOtros: null,
      avSinCorreccionVL_OD: "20/40",
      avSinCorreccionVL_OI: "20/40",
      avSinCorreccionVP_OD: "20/25",
      avSinCorreccionVP_OI: "20/25",
      avConCorreccionVL_OD: "20/20",
      avConCorreccionVL_OI: "20/20",
      avConCorreccionVP_OD: "20/20",
      avConCorreccionVP_OI: "20/20",
      papilaOptica: "Normal",
      macula: "Normal",
      retina: "Normal",
      observacionesSegmentoPosterior: "Segmento posterior sin hallazgos relevantes.",
      diagnosticos: ["Miopía", "Astigmatismo"],
      diagnosticoOtro: null,
      esfera_OD: "-2.00",
      esfera_OI: "-2.25",
      cilindro_OD: "-0.50",
      cilindro_OI: "-0.50",
      eje_OD: "180°",
      eje_OI: "180°",
      adicion_OD: null,
      adicion_OI: null,
      altura_OD: "17 mm",
      altura_OI: "17 mm",
      dnp_OD: "31.5 mm",
      dnp_OI: "31.5 mm",
      avFinal_OD: "20/20",
      avFinal_OI: "20/20",
      tipoLenteRecomendado: ["Progresivo"],
      tipoLenteOtro: null,
      tratamientosRecomendados: ["Antirreflejo", "Filtro de luz azul"],
      tratamientoOtro: null,
      pacienteId: "p-01",
      ventaId: ventaVinculada?.id ?? null,
      createdAt: fechaReciente.toISOString(),
      updatedAt: fechaReciente.toISOString(),
    },
  ];

  return {
    pacientes,
    ventas,
    compras,
    gastos,
    historias,
    ventaSeq,
    pagoSeq,
    compraSeq,
    gastoSeq,
    pacienteSeq: pacientes.length,
    historiaSeq: historias.length,
  };
}

export function getStore(): Store {
  if (!globalStore.__opticaMdStore) {
    globalStore.__opticaMdStore = seed();
  }
  return globalStore.__opticaMdStore;
}

export function getDemoDataset(): Dataset {
  const store = getStore();
  return {
    pacientes: [...store.pacientes].sort((a, b) => a.apellidos.localeCompare(b.apellidos)),
    ventas: [...store.ventas].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    compras: [...store.compras].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    gastos: [...store.gastos].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    demo: true,
  };
}

// ── Mutaciones demo ───────────────────────────────────────────

export function demoCrearVenta(input: {
  fecha: Date;
  categoria: CategoriaVenta;
  descripcion: string;
  total: number;
  metodoPago: MetodoPago;
  estadoEntrega: EstadoEntrega;
  pacienteId?: string | null;
  clienteNombre?: string | null;
  anticipo?: number;
  notas?: string | null;
}): Venta {
  const store = getStore();
  const year = input.fecha.getFullYear();
  const secuencia = store.ventaSeq + 1;
  const ventaId = `v-${String(secuencia).padStart(4, "0")}`;
  const anticipo = Math.min(Math.max(input.anticipo ?? 0, 0), input.total);
  const pagos: PagoVenta[] = [];

  if (anticipo > 0) {
    pagos.push({
      id: `pg-${String(++store.pagoSeq).padStart(4, "0")}`,
      ventaId,
      monto: Math.round(anticipo * 100) / 100,
      metodo: input.metodoPago,
      fecha: input.fecha.toISOString(),
      nota: anticipo < input.total ? "Abono inicial / anticipo" : "Pago total",
    });
  }

  const venta: Venta = {
    id: ventaId,
    codigo: `V-${year}-${String(secuencia).padStart(4, "0")}`,
    fecha: input.fecha.toISOString(),
    categoria: input.categoria,
    descripcion: input.descripcion,
    total: Math.round(input.total * 100) / 100,
    metodoPago: input.metodoPago,
    estadoPago: anticipo <= 0 ? "PENDIENTE" : anticipo >= input.total ? "PAGADA" : "PARCIAL",
    estadoEntrega: input.estadoEntrega,
    pacienteId: input.pacienteId || null,
    clienteNombre: input.clienteNombre || null,
    notas: input.notas || null,
    pagos,
  };

  store.ventaSeq = secuencia;
  store.ventas.push(venta);
  return venta;
}

export function demoRegistrarPago(input: {
  ventaId: string;
  monto: number;
  metodo: MetodoPago;
  fecha: Date;
  nota?: string | null;
}): Venta | null {
  const store = getStore();
  const venta = store.ventas.find((v) => v.id === input.ventaId);
  if (!venta) return null;
  const pagado = venta.pagos.reduce((s, p) => s + p.monto, 0);
  const saldo = Math.max(0, venta.total - pagado);
  const monto = Math.min(Math.max(input.monto, 0.01), saldo);
  venta.pagos.push({
    id: `pg-${String(++store.pagoSeq).padStart(4, "0")}`,
    ventaId: venta.id,
    monto: Math.round(monto * 100) / 100,
    metodo: input.metodo,
    fecha: input.fecha.toISOString(),
    nota: input.nota || "Registro de abono",
  });
  const nuevoPagado = pagado + monto;
  venta.estadoPago =
    nuevoPagado >= venta.total - 0.01 ? "PAGADA" : nuevoPagado > 0 ? "PARCIAL" : "PENDIENTE";
  return venta;
}

export function demoCrearCompra(input: {
  fecha: Date;
  proveedor: string;
  proveedorRuc?: string | null;
  numeroComprobante?: string | null;
  categoria: CategoriaCompra;
  descripcion: string;
  total: number;
}): Compra {
  const store = getStore();
  const compra: Compra = {
    id: `c-${String(++store.compraSeq).padStart(4, "0")}`,
    fecha: input.fecha.toISOString(),
    proveedor: input.proveedor,
    proveedorRuc: input.proveedorRuc || null,
    numeroComprobante: input.numeroComprobante || null,
    categoria: input.categoria,
    descripcion: input.descripcion,
    total: Math.round(input.total * 100) / 100,
  };
  store.compras.push(compra);
  return compra;
}

export function demoCrearGasto(input: {
  fecha: Date;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  recurrente: boolean;
  comprobante?: string | null;
}): Gasto {
  const store = getStore();
  const gasto: Gasto = {
    id: `g-${String(++store.gastoSeq).padStart(4, "0")}`,
    fecha: input.fecha.toISOString(),
    categoria: input.categoria,
    descripcion: input.descripcion,
    monto: Math.round(input.monto * 100) / 100,
    recurrente: input.recurrente,
    comprobante: input.comprobante || null,
  };
  store.gastos.push(gasto);
  return gasto;
}

export function demoCrearPaciente(input: {
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: Date | null;
  edad?: number | null;
  genero?: string | null;
  telefono: string;
  email?: string | null;
  direccion?: string | null;
  ocupacion?: string | null;
  notas?: string | null;
}): Paciente {
  const store = getStore();
  const paciente: Paciente = {
    id: `p-${String(++store.pacienteSeq).padStart(2, "0")}`,
    cedula: input.cedula,
    nombres: input.nombres.trim(),
    apellidos: input.apellidos.trim(),
    fechaNacimiento: input.fechaNacimiento ? input.fechaNacimiento.toISOString() : null,
    edad: input.edad ?? null,
    genero: input.genero || null,
    telefono: input.telefono,
    email: input.email || null,
    direccion: input.direccion || null,
    ocupacion: input.ocupacion || null,
    notas: input.notas || null,
    activo: true,
    createdAt: new Date().toISOString(),
  };
  store.pacientes.push(paciente);
  return paciente;
}

export function demoActualizarPaciente(
  id: string,
  input: Partial<Omit<Paciente, "id" | "createdAt">>,
): Paciente | null {
  const store = getStore();
  const paciente = store.pacientes.find((p) => p.id === id);
  if (!paciente) return null;
  Object.assign(paciente, input);
  return paciente;
}

export function demoEliminarPaciente(id: string): boolean {
  const store = getStore();
  const paciente = store.pacientes.find((p) => p.id === id);
  if (!paciente) return false;
  paciente.activo = false;
  return true;
}

// ── Historias clínicas demo ──────────────────────────────────

export function demoCrearHistoria(input: HistoriaClinicaInput): HistoriaClinica {
  const store = getStore();
  const secuencia = store.historiaSeq + 1;
  const now = new Date().toISOString();
  const historia: HistoriaClinica = {
    ...input,
    id: `h-${String(secuencia).padStart(4, "0")}`,
    numeroHistoria: `HC-${String(secuencia).padStart(4, "0")}`,
    createdAt: now,
    updatedAt: now,
  };
  store.historiaSeq = secuencia;
  store.historias.push(historia);
  return historia;
}

export function demoActualizarHistoria(
  id: string,
  input: HistoriaClinicaInput,
): HistoriaClinica | null {
  const store = getStore();
  const historia = store.historias.find((h) => h.id === id);
  if (!historia) return null;
  Object.assign(historia, input, { updatedAt: new Date().toISOString() });
  return historia;
}

export function demoVincularVentaHistoria(historiaId: string, ventaId: string): void {
  const store = getStore();
  const historia = store.historias.find((h) => h.id === historiaId);
  if (historia) {
    historia.ventaId = ventaId;
    historia.updatedAt = new Date().toISOString();
  }
}

export function demoReset(): void {
  globalStore.__opticaMdStore = seed();
}
