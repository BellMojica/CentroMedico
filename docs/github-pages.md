# Configurar GitHub Pages

Para publicar el frontend en GitHub Pages:

1. En el repositorio, ve a **Settings** → **Pages**.
2. En **Source** elige **Deploy from a branch**.
3. En **Branch** selecciona `main` y carpeta **/ (root)**.
4. Guarda. La página quedará en:
   - `https://<usuario>.github.io/<repositorio>/`

El archivo **.nojekyll** en la raíz hace que GitHub sirva los archivos estáticos sin Jekyll.

**Nota:** En GitHub Pages solo se sirve el frontend (HTML, CSS, JS). La API debe estar desplegada en otro servicio (por ejemplo Render); la URL del API se configura en `public/js/config.js`.
