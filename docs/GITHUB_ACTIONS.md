# GitHub Actions — EON WORLD

El flujo `.github/workflows/ci.yml` instala dependencias en Linux x64 (Node.js 22), comprueba PixiJS y Phaser, ejecuta pruebas y compila la versión web.

## Compilación automática

En cada `push` a `main` o `feat/aurora-first-playable`, y al abrir un pull request hacia `main`, se ejecutan:

1. Instalación: `npm ci` si existe `package-lock.json`; en caso contrario `npm install`.
2. Verificación: `npm ls pixi.js phaser --depth=0`.
3. Pruebas: `npm test`.
4. Build: `npm run build`.
5. Validación: comprobación de `dist/index.html`.

## Descargar el juego

1. Abrir [Actions](https://github.com/AnthonyHenriquezLuciano/EON_WORK/actions).
2. Elegir **EON WORLD - build y pruebas** y abrir una ejecución verde.
3. En **Artifacts**, descargar **eon-world-web-N**: contiene `dist/`, la compilación web estática (no un servidor de desarrollo).
4. **eon-world-lock-N** contiene `package-lock.json`, el registro de versiones exactas generado en esa ejecución. Conviene incorporar ese archivo al repositorio para futuras instalaciones reproducibles con `npm ci`.

## Descargar dependencias para ChatGPT sin npm

1. Actions → **EON WORLD - build y pruebas** → **Run workflow**.
2. Seleccionar `main` y activar **export_dependencies**.
3. Esperar a que termine satisfactoriamente.
4. En los artefactos descargar **eon-world-deps-linux-x64-N**.
5. Adjuntar el ZIP a la conversación de ChatGPT. Dentro viene un archivo `.tar.gz` con `node_modules`, `package.json` y `package-lock.json` compilados/instalados en Linux x64.

Esta opción puede consumir almacenamiento de artefactos de GitHub. El artefacto de dependencias se conserva 7 días, los otros 14. Las dependencias Linux pueden requerir reinstalación si cambia la arquitectura, versiones de Node o dependencias nativas.

## Límites actuales

- Este pipeline **verifica instalación y compilación**; no prueba automáticamente WebGL real ni el acabado visual en un navegador.
- Phaser ya figura como dependencia y se verifica instalado, pero **eso no implica que el mundo jugable haya sido migrado a Phaser**.
- No subir `node_modules` a Git; mantener `.gitignore` y versionar `package-lock.json` cuando sea posible.
- No añadir secretos, claves o archivos `.env` a artefactos.

Para ejecutar en local: `npm install && npm test && npm run build && npm run dev`.
