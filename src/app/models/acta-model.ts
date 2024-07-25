export class Acta {
  id: number; // nuestro id es nuestro folio
  agencia: string;
  anioSolicitud: number;
  cantidadVisitas: number;
  codigoTecnico: string;
  colonia: string; // agregado
  controlHermeticidad: number;
  coDiluido: number;
  dictamenUV: string;
  diferencia: number;
  direccion: string; // agregado
  estatus: string;
  fechaAsignacion: string;
  fechaSolicitud: string;
  fechaUltVisita: string;
  fechaUltVisitaSinFormato: string;
  horaUltVisita: string;
  idCalle: number;
  idCliente: number;
  identificacion: string;
  latitude: string;
  lecturaFinal: number;
  lecturaInicial: number;
  longitude: string;
  medidiorFlujoLtHr: number;
  medidorCorrecto: boolean; // agregado
  medidorDuracionMin: number;
  medidorFunciona: boolean;
  municipio: string;
  noConformidadUV: string;
  nombreCliente: string; // agregado
  nombrePersona: string;
  numeroMedidor: string; // agregado
  observaciones: string;
  parentezcoTitular: string;
  prioridad: number;
  telefonoPersona: string;
  tipoIdentificacion: string;
  tipoSolicitud: string;
  ubicacionActa: string;
  usuarioAgencia: string;
  usuarioCreacion: string;
  usuarioTecnico: string;
  documentos: Detalle[];
  acciones: Detalle[];
  aparatos: Detalle[];
  areasMejora: Detalle[];
  controlHermeticidadOpt: Detalle[];
  coDiluidos: Detalle[];
  mejorasEquipos: Detalle[];
  singulares: Detalle[];
  uvs: Detalle[];
}

export class Detalle {
  id: number;
  idActa: number;
  tipo: string;
  indice: string;
  valor: string;
  valorNum: number;
  valorExtra: string;
  isChecked: boolean;
  descripcion: string;
  canContinue: boolean;
  requiredPhoto: boolean;
  requiredComment: boolean;
}

export class DetalleImg {
  folio: number;
  descripcion: string;
  nombreArchivo: string;
  fotoBase: string;
}

export class OpcionMultiple {
  descripcion: string;
  tipo: string;
  indice: string;
  valor: string;
  isChecked: boolean;
}

export class LocalActa {
  acta: Acta;
  id: string;
  imagenes: DetalleImg[];
  multipleOpt: Detalle[];
}

export class ActaLocation {
  latitude: string;
  longitude: string;
  location: string;
}

export class EstadoActa {
  canContinue: boolean;
  requireComment: boolean;
  requirePhoto: boolean;
  optionSelected: string;
  options: Detalle[];
}

export class ActaResponse {
  dsdatos: {
    Acta: Acta[]
  };
}

export class OptionMultipleResponse {
  dsdatos: {
    Opciones: [
      OpcionMultiple
    ]
  };
}

export class DetalleImgResponse {
  ttfile: {
    ttFile: [
      DetalleImg
    ]
  };
}

export class SaveActaResponse {
  actaSavedId: number;
  localActas: LocalActa[];
  successApi: boolean;
}
