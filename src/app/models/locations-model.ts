export class Ciudad {
  id: number;
  descripcion: string;
  totalActas: number;
}

export class Colonia {
  id: number;
  idCiudad: number;
  descripcion: string;
  totalActas: number;
}

export class Calle {
  id: number;
  idColonia: number;
  descripcion: string;
  totalActas: number;
}

export class CiudadResponse {
  dsdatos: {
    Ciudad: Ciudad[]
  };
}

export class ColoniaResponse {
  dsdatos: {
    Colonia: Colonia[]
  };
}

export class CalleResponse {
  dsdatos: {
    Calle: Calle[]
  };
}
