# EON WORLD — Barrio Aurora: primera versión jugable

**Estado:** vertical slice experimental. El producto final empieza **desde el nacimiento**; este corte reproduce un día interactivo **a los 14 años** para validar jugabilidad antes de integrar todas las edades.

## Requisitos

- Node.js 22
- npm

## Iniciar en Work, Codespaces o cualquier entorno Node

```bash
npm install
npm run dev
```

Abre la URL de desarrollo indicada por Vite.

## Verificar

```bash
npm test
npm run build
```

**Nota:** el entorno de ChatGPT donde se preparó esta rama no tuvo acceso al registro de npm. GitHub Actions verificará la instalación, los tests y la compilación cuando se ejecute. La rama NO incluye `node_modules` ni un lockfile: deben generarse durante el primer `npm install` en Work; después se recomienda guardar `package-lock.json` y cambiar CI a `npm ci`.

## Pantalla principal y creador de personaje

- **Pantalla principal:** logo EON WORLD y escena animada de Barrio Aurora al atardecer. Opciones: Nueva Historia, Continuar (muestra el personaje y el día guardados), Opciones (animaciones, borrar partida), Galería (recuerdos del diario) y Créditos.
- **Creador en 4 pasos:** Esencia (nombre, apellido, fortaleza), Tu apariencia, Tu historia (cumpleaños, sueño) y Confirmar.
- **Género:** Femenino, Masculino o No binario, en cualquier paso. Cambiarlo cambia el cuerpo, el peinado, la ropa, los complementos y la voz; se conservan el tono de piel, el color de ojos y el de cabello.
- **Apariencia:** piel, rostro, ojos, cejas, nariz, boca, 12 peinados, color de cabello y extras. Pestañas de Ropa, Accesorios, Estilo (conjuntos completos) y Voz (se puede escuchar).
- **Vista previa:** retrato grande, sprite que gira en 4 direcciones y "Vista previa en el mundo".
- El personaje creado es el que camina por el mundo y aparece en la barra superior y en el diario.
- **Arte provisional:** todo el pixel art (retrato, sprites, vecinos y la escena del menú) se dibuja por código en `src/art/`, sin imágenes. Se puede sustituir por ilustraciones definitivas más adelante.
- Las partidas anteriores al creador se conservan y continúan con Alma Rodríguez.

## Controles

- **WASD o flechas:** caminar con tu personaje dentro de la escena.
- **Clic/tocar el mapa:** moverla hacia ese lugar.
- **Puntos de interés:** interactuar.
- **Menú de lugares:** viajar entre hogar, barrio, escuela, cafetería y club de arte.
- **Panel lateral:** objetivos, diarios, personas, inventario y acciones disponibles.
- **Dormir:** termina el día desde casa y conserva la historia.
- El progreso se guarda automáticamente en el almacenamiento local del navegador.

## Reglas de juego

- Las actividades consumen minutos y energía.
- La tarea requiere preparar la mochila.
- Puedes escuchar a Eva o decir que estás ocupada, con repercusiones sociales diferentes.
- Hablar con mamá incorpora un testimonio sobre una antigua oferta de trabajo.
- Investigar una carta familiar añade evidencia, **sin atribuir motivos ocultos no verificados**.
- No se muestran porcentajes secretos de confianza ni sentimientos de los NPC.

## Próximas fases

- Motor completo desde nacimiento, avances temporales y autonomía según edad.
- Habitantes autónomos con agendas, creencias y memoria.
- Pixeles y tilesets originales definitivos en lugar de geometría provisional.
- Colisiones, navegación por caminos, cámara y animaciones.
- Más días, actividades, conversaciones, economía y pruebas automatizadas.
- Persistencia versionada compatible con EON CORE y futura sincronización Supabase.

Diseño y desarrollo por etapas. No es una versión de producción.
