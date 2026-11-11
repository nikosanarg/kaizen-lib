# Frente L6: piezas-motion

- Skeleton: latido de opacidad (el de valle-verde), no el brillo con gradiente de kaizen-next: más barato en tablas enteras y sin movimiento con reduced motion. La raíz anuncia (`role=status`, `aria-busy`, label sólo para lectores) y las barras son `aria-hidden`. Sin tokens nuevos: fondo `--kz-surface-hover`, pulso fijo de 1.4s.
- AnimatedNumber: `useSpring` + escritura directa al DOM (sin render por cuadro). Reduced motion se lee con `matchMedia` en vivo: `useReducedMotion` de motion cachea el valor del primer uso y en tests (y si el usuario cambia la preferencia) quedaba viejo. No porté la `clave` ni la espera de estabilidad de NumeroAnimado: el spring ya retoma desde lo que se ve; si valle-verde lo extraña, se agrega.
- Reveal: `whileInView` con `viewport.once`. Con `escalonado`, envuelve cada hijo directo en un `m.div` (variants + staggerChildren). Sin IntersectionObserver motion no dispara: el contenido queda oculto (todos los navegadores objetivo lo tienen).
- Pressable: renderiza el nativo (`button`/`a`/`div`), así foco y teclado son del elemento. Deshabilitado no escala. `type="button"` por defecto.
