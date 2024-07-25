export class User {
  id: string;
  contraseña: string;
  nombre: string;
  mensaje: string;
}

export class UserResponse {
  dsdatos: {
    usuario: User;
  };
}
