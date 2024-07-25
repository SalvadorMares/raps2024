export const EstadoActa = {
  canContinue: false,
  requireComment: false,
  requirePhoto: false,
  options : [
    { text: 'Aceptada total', value: 1, isChecked: false, canContinue: true, requirePhoto: false, requireComment: false },
    { text: 'Aceptada parcial', value: 2, isChecked: false, canContinue: true, requirePhoto: false, requireComment: false },
    { text: 'Ausente', value: 3, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
    { text: 'Sin medidor', value: 4, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
    { text: 'Rechazo', value: 5, isChecked: false, canContinue: false, requirePhoto: false, requireComment: true },
    { text: 'Servicio suspendido', value: 6, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
    { text: 'Ilícito', value: 7, isChecked: false, canContinue: false, requirePhoto: true, requireComment: true },
  ]
};

// [
//   { text: 'Aceptada total', value: 1, isChecked: false, canContinue: true, requirePhoto: false, requireComment: false },
//   { text: 'Aceptada parcial', value: 2, isChecked: false, canContinue: true, requirePhoto: false, requireComment: false },
//   { text: 'Ausente', value: 3, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
//   { text: 'Sin medidor', value: 4, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
//   { text: 'Rechazo', value: 5, isChecked: false, canContinue: false, requirePhoto: false, requireComment: true },
//   { text: 'Servicio suspendido', value: 6, isChecked: false, canContinue: false, requirePhoto: false, requireComment: false },
//   { text: 'Ilícito', value: 7, isChecked: false, canContinue: false, requirePhoto: true, requireComment: true },
// ];

export const Aparatos = [
  { text: 'Estufa residencial', value: 1, isChecked: false, co: 0 },
  { text: 'Estufa comercial', value: 2, isChecked: false, co: 0 },
  { text: 'Horno residencial', value: 3, isChecked: false, co: 0 },
  { text: 'Horno comercial', value: 4, isChecked: false, co: 0 },
  { text: 'Boiler de paso', value: 5, isChecked: false, co: 0 },
  { text: 'Boiler de acumulacion', value: 6, isChecked: false, co: 0 },
  { text: 'Secadora', value: 7, isChecked: false, co: 0 },
  { text: 'Calentador', value: 8, isChecked: false, co: 0 },
  { text: 'Radiador mural', value: 9, isChecked: false, co: 0 },
  { text: 'Otros', value: 10, isChecked: false, co: 0 },
];

export const ControlHere = [
  { text: '00', isChecked: false },
  { text: '01', isChecked: false },
  { text: '02', isChecked: false },
  { text: '03', isChecked: false },
  { text: '04', isChecked: false },
  // { text: 'N/A', isChecked: false },
];

export const coDiluido = [
  { text: '05', isChecked: false },
  { text: '06', isChecked: false },
  // { text: 'N/A', isChecked: false },
];

export const AreaMejora = [
  { text: '7.1', isChecked: false },
  { text: '7.5.6', isChecked: false },
  { text: '7.5.3', isChecked: false },
  { text: '7.5.1', isChecked: false },
  { text: 'Fx', isChecked: false },
  { text: '7.5.2', isChecked: false },
  // { text: 'N/A', isChecked: false },
];

export const EquiposConsumoMejora = [
  { text: '9.3', isChecked: false },
  { text: '11.6', isChecked: false },
  { text: '11.9', isChecked: false },
  { text: '7.2.2', isChecked: false },
  { text: '7.5.8', isChecked: false },
  { text: '11.2', isChecked: false },
  // { text: 'N/A', isChecked: false },
];
