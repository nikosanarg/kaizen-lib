# Feedback: ajustes-0219

- Token warning ya existía (`--kz-warning*`, en PARES del contraste): no hizo falta token nuevo.
- `warning` va a la región polite: es un aviso, no un error que interrumpe.
- Offsets como variables CSS en la pila (`--kz-toast-offset-top/bottom`), sumadas a `space[6]`. El valor pasado reemplaza al default de safe-area en vez de sumarse: las barras fijas suelen incluir ya el safe-area y sumarlo dos veces dejaría un hueco.
- HeroText `gradiente`: se descartó `background: inherit` porque cada pieza heredaría el gradiente a su propio tamaño (repetido por palabra, igual que el parche de tutipoker). Se mide con offsetLeft/Top (ignoran el transform de la animación) y ResizeObserver; sin JS cae a gradiente por pieza, que es aceptable.
- Sin verificación visual en navegador (jsdom no hace layout): conviene mirarlo en tutipoker al integrar.
