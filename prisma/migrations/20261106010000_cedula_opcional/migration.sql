-- La cédula / RUC pasa a ser opcional en la ficha del paciente.
ALTER TABLE "pacientes" ALTER COLUMN "cedula" DROP NOT NULL;
